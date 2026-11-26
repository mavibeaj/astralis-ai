"""Offline test fixture for the locality picker.

Builds public/geography/ in the SAME shard format as scripts/build-geography.py,
but from GeoNames-derived snapshots distributed on PyPI, so tests and local
development do not depend on download.geonames.org being reachable.

Sources (both derived from GeoNames, CC BY 4.0):
  - geonamescache==3.0.2  cities500.json  (name, coords, IANA zone, population, alt names)
  - reverse_geocoder==1.5.1 rg_cities1000.csv (admin1 / admin2 *names*)

Limitations (documented in QA_REPORT.md):
  - Only populated places with population >= 500 (no small villages / hamlets,
    no administrative 'A' features). Rural coverage must be validated with the
    full GeoNames build (scripts/build-geography.py) in CI.
  - Region/district names are joined by name + proximity (< 0.15 deg); places
    without a confident match keep empty region/district. Nothing is guessed.

Usage: GEOGRAPHY_COUNTRIES=PE,US,... python3 scripts/build-geography-fixture.py
Not used for production builds.
"""
import csv, json, math, os, pathlib, unicodedata, collections
import geonamescache, reverse_geocoder

OUT = pathlib.Path('public/geography')
DEFAULT = 'PE,AR,BR,CL,CO,EC,MX,US,CA,ES,GB,FR,DE,IT,RU,IN,CN,JP,KR,AU,NZ,ZA,NG,EG,KE,MA,IS,GR,TR,IL'


def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFKD', s.casefold()) if not unicodedata.combining(c))


def bucket(p):  # identical to build-geography.py and location-picker.tsx
    h = 0
    for byte in p.encode('utf-8'):
        h = (h * 31 + byte) % 64
    return str(h)


def main():
    allowed = set((os.environ.get('GEOGRAPHY_COUNTRIES') or DEFAULT).split(','))
    data_dir = pathlib.Path(geonamescache.__file__).parent / 'data'
    cities = json.loads((data_dir / 'cities500.json').read_text(encoding='utf-8'))
    countries_meta = json.loads((data_dir / 'countries.json').read_text(encoding='utf-8'))
    rg_path = pathlib.Path(reverse_geocoder.__file__).parent / 'rg_cities1000.csv'
    admin = collections.defaultdict(list)
    with open(rg_path, encoding='utf-8') as f:
        for r in csv.DictReader(f):
            if r['cc'] in allowed:
                admin[(r['cc'], norm(r['name']))].append((float(r['lat']), float(r['lon']), r['admin1'], r['admin2']))
    # admin1 code -> name by majority vote of confident joins (never guessed)
    votes = collections.defaultdict(collections.Counter)
    joined = {}
    for c in cities.values():
        cc = c['countrycode']
        if cc not in allowed or not c.get('timezone'):
            continue
        best = None
        for lat, lon, a1, a2 in admin.get((cc, norm(c['name'])), []):
            d = math.hypot(lat - c['latitude'], lon - c['longitude'])
            if d < 0.15 and (best is None or d < best[0]):
                best = (d, a1, a2)
        if best:
            joined[c['geonameid']] = best
            if best[1]:
                votes[(cc, c.get('admin1code', ''))][best[1]] += 1
    admin1 = {k: v.most_common(1)[0][0] for k, v in votes.items()}
    bins = collections.defaultdict(lambda: collections.defaultdict(list))
    for c in cities.values():
        cc = c['countrycode']
        if cc not in allowed or not c.get('timezone'):
            continue
        j = joined.get(c['geonameid'])
        region = admin1.get((cc, c.get('admin1code', '')), '')
        district = j[2] if j else ''
        entry = [str(c['geonameid']), c['name'], region, district, c['timezone'], int(c.get('population') or 0), c['latitude'], c['longitude']]
        aliases = {norm(c['name'])} | {norm(a) for a in c.get('alternatenames', []) if a}
        for p in {a[:2] for a in aliases if len(a) >= 2}:
            bins[cc][bucket(p)].append([entry, [a for a in aliases if a.startswith(p)]])
    OUT.mkdir(parents=True, exist_ok=True)
    for cc, shards in bins.items():
        for key, rows in shards.items():
            path = OUT / cc / (key + '.json')
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(rows, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    names = sorted((m['iso'], m['name']) for m in countries_meta.values() if m['iso'] in bins)
    (OUT / 'countries.json').write_text(json.dumps(names, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    (OUT / 'SOURCE.txt').write_text('OFFLINE FIXTURE (geonamescache 3.0.2 cities500 + reverse_geocoder 1.5.1). GeoNames CC BY 4.0. Not for production.\n', encoding='utf-8')
    print('fixture countries', len(names), 'shards', sum(len(s) for s in bins.values()))


if __name__ == '__main__':
    main()
