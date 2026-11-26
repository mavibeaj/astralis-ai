"""Shared writer for the static geography catalog (format v2, adaptive shards).

Layout (public/geography/):
  countries.json      {"v":2,"countries":[[code, name, buckets, [split prefixes]]], "places":N, ...}
  CC/<b>.json         {"p":[[place, aliases]], "k":{key:[indices into p]}}

place = [geonameid, name, region(admin1), district(admin2), iana_zone, population, lat, lon]

Search key for a normalized alias/query: start with its first 2 characters; while that
prefix is in the country's split set and the string is longer, take one more character.
Bucket b = hash(key) % buckets, hash = 32-bit (h*31 + utf8 byte). Mirrors src/lib/geo-search.mjs.
Splitting happens only for prefixes whose payload exceeds the target, so small countries
stay in a single file and only dense prefixes (e.g. "sa", "san") get deeper keys.
"""
import gzip, json, math, pathlib, unicodedata, collections

TARGET_GZ = 200 * 1024        # aim below the approved 250 KB compressed per shard
SPLIT_RAW = 400 * 1024        # raw payload above which a prefix is subdivided
MAX_KEY = 16                  # deepest prefix length
MAX_FILES = 19000             # Cloudflare Pages: 20,000 files per deployment incl. app assets
MAX_FILE = 24 * 1024 * 1024   # Cloudflare Pages: 25 MiB per file


def norm(s):
    # Must match normalize() in src/lib/geo-search.mjs: casefold, NFKD, drop every Unicode mark (M*).
    return ''.join(c for c in unicodedata.normalize('NFKD', s.casefold()) if not unicodedata.category(c).startswith('M')).strip()


def chars(s):
    return list(s)


def h32(key):
    h = 0
    for byte in key.encode('utf-8'):
        h = (h * 31 + byte) & 0xFFFFFFFF
    return h


def key_for(alias, split):
    c = chars(alias)
    k = ''.join(c[:2])
    while k in split and len(c) > len(chars(k)):
        k = ''.join(c[:len(chars(k)) + 1])
    return k


def _dump(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':')).encode('utf-8')


def plan_country(records):
    """records: list of (place, aliases:set[str]). Returns (split, buckets, files)."""
    sizes = [len(_dump(p)) + sum(len(a.encode()) + 3 for a in al) + 8 for p, al in records]
    split = set()
    while True:
        load, extendable = collections.Counter(), set()
        for i, (p, al) in enumerate(records):
            keys = set()
            for a in al:
                if len(chars(a)) < 2:
                    continue
                k = key_for(a, split)
                keys.add(k)
                if len(chars(a)) > len(chars(k)):
                    extendable.add(k)
            for k in keys:
                load[k] += sizes[i]
        # Only split keys that can actually be subdivided (aliases longer than the key).
        # Keys are deepened independently; one very long dense prefix never stops the others.
        heavy = {k for k, v in load.items() if v > SPLIT_RAW and k not in split and k in extendable and len(chars(k)) < MAX_KEY}
        if not heavy:
            break
        split |= heavy
    total = sum(load.values())
    buckets = max(1, math.ceil(total / (TARGET_GZ * 5)))
    while True:
        files = build_files(records, split, buckets)
        worst = max(len(gzip.compress(b, 6)) for b in files.values())
        if worst <= TARGET_GZ or buckets >= 4096:
            return split, buckets, files
        buckets = math.ceil(buckets * 1.4)


def build_files(records, split, buckets):
    grouped = collections.defaultdict(lambda: ([], {}, {}))
    for p, al in records:
        by_bucket = collections.defaultdict(lambda: collections.defaultdict(set))
        for a in al:
            if len(chars(a)) >= 2:
                k = key_for(a, split)
                by_bucket[h32(k) % buckets][k].add(a)
        for b, keymap in by_bucket.items():
            places, index, keys = grouped[b]
            # Store only aliases that can match a key held in this shard.
            index[p[0]] = len(places)
            places.append([p, sorted(set().union(*keymap.values()))])
            for k in keymap:
                keys.setdefault(k, []).append(index[p[0]])
    return {b: _dump({'p': places, 'k': keys}) for b, (places, _, keys) in grouped.items()}


def new_stats():
    return {'files': 1, 'bytes': 0, 'gzBytes': 0, 'maxFile': 0, 'maxGz': 0, 'maxGzFile': '', 'places': 0}


def write_country(out, code, name, records, stats):
    """Plan and write one country's shards; returns its manifest entry (or None if empty)."""
    out = pathlib.Path(out)
    if not records:
        return None
    split, buckets, files = plan_country(records)
    for b, data in files.items():
        if len(data) > MAX_FILE:
            raise ValueError(f'{code}/{b}.json exceeds Cloudflare file limit')
        path = out / code / f'{b}.json'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        gz = len(gzip.compress(data, 6))
        stats['files'] += 1
        stats['bytes'] += len(data)
        stats['gzBytes'] += gz
        stats['maxFile'] = max(stats['maxFile'], len(data))
        if gz > stats['maxGz']:
            stats['maxGz'], stats['maxGzFile'] = gz, f'{code}/{b}.json'
    stats['places'] += len(records)
    return [code, name, buckets, sorted(split)]


def write_manifest(out, manifest, stats, source):
    if stats['files'] > MAX_FILES:
        raise ValueError(f"{stats['files']} catalog files exceed the Cloudflare Pages budget ({MAX_FILES})")
    stats['countries'] = len(manifest)
    manifest = sorted(manifest, key=lambda m: m[0])
    (pathlib.Path(out) / 'countries.json').write_bytes(_dump({'v': 2, 'source': source, 'places': stats['places'], 'countries': manifest}))
    return stats


def write_catalog(out, countries, by_country, source):
    """countries: list[(code, name)]; by_country: code -> list[(place, aliases)]."""
    pathlib.Path(out).mkdir(parents=True, exist_ok=True)
    stats, manifest = new_stats(), []
    for code, name in countries:
        entry = write_country(out, code, name, by_country.get(code) or [], stats)
        if entry:
            manifest.append(entry)
    return write_manifest(out, manifest, stats, source)
