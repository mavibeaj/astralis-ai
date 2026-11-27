"""Build the static locality catalog from the GeoNames dump (CC BY 4.0).

Runs automatically as part of `npm run build` (the deployment build). It fails loudly
(non-zero exit) when GeoNames cannot be downloaded or the result is incomplete, so a
deployment can never ship with empty selectors.

If geography.lock.json pins a versioned catalog, that bundle is installed instead
(scripts/fetch-geography-release.py, SHA-256 verified) and nothing is rebuilt.
GEOGRAPHY_REBUILD=1        ignores the lock and rebuilds from GeoNames (release workflow).
GEOGRAPHY_COUNTRIES=PE,CL  restricts the build (CI smoke only; the manifest records it).
Writes metrics to geography-stats.json.
"""
import csv, io, json, os, pathlib, resource, sys, time, urllib.request, zipfile, concurrent.futures
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from geography_catalog import norm, new_stats, write_country, write_manifest

BASE = 'https://download.geonames.org/export/dump/'
OUT = pathlib.Path('public/geography')
FEATURE_A = {'ADM1', 'ADM2', 'ADM3', 'ADM4', 'ADM5', 'ADMD'}
EXCLUDE_P = {'PPLQ', 'PPLW', 'PPLH'}  # abandoned, destroyed, historical


def fetch(name):
    req = urllib.request.Request(BASE + name, headers={'User-Agent': 'AstralisAI-geography-build/2.0'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.read()
        except OSError:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)


def lines(name):
    return fetch(name).decode('utf-8').splitlines()


def main():
    if os.environ.get('GEOGRAPHY_REBUILD') != '1' and not os.environ.get('GEOGRAPHY_COUNTRIES'):
        import subprocess
        rc = subprocess.call([sys.executable, str(pathlib.Path(__file__).parent / 'fetch-geography-release.py')])
        if rc == 0:
            return
        if rc != 3:
            sys.exit(rc)
        print('no pinned catalog: rebuilding from GeoNames', file=sys.stderr)
    started = time.time()
    countries = [(r[0], r[4]) for r in csv.reader((s for s in lines('countryInfo.txt') if s and not s.startswith('#')), delimiter='\t') if len(r) > 4 and len(r[0]) == 2]
    subset = os.environ.get('GEOGRAPHY_COUNTRIES')
    if subset:
        allowed = set(subset.split(','))
        countries = [c for c in countries if c[0] in allowed]
    admin1 = {r[0]: r[1] for r in csv.reader(lines('admin1CodesASCII.txt'), delimiter='\t') if len(r) > 1}
    admin2 = {r[0]: r[1] for r in csv.reader(lines('admin2Codes.txt'), delimiter='\t') if len(r) > 1}

    def load(item):
        code = item[0]
        records = []
        try:
            raw = fetch(code + '.zip')
        except OSError as e:
            if getattr(e, 'code', None) == 404:  # territories without a dump (none expected)
                return code, records
            raise
        with zipfile.ZipFile(io.BytesIO(raw)) as z, z.open(code + '.txt') as f:
            for r in csv.reader(io.TextIOWrapper(f, encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE):
                if len(r) < 19 or not r[17] or not r[1]:
                    continue
                if not ((r[6] == 'P' and r[7] not in EXCLUDE_P) or (r[6] == 'A' and r[7] in FEATURE_A)):
                    continue
                place = [r[0], r[1], admin1.get(code + '.' + r[10], ''), admin2.get(code + '.' + r[10] + '.' + r[11], ''),
                         r[17], int(r[14] or 0), float(r[4]), float(r[5])]
                aliases = {norm(r[1]), norm(r[2])} | {norm(a) for a in r[3].split(',') if a}
                records.append((place, {a for a in aliases if a}))
        return code, records

    # Stream: each country is written as soon as it is loaded, so memory stays near the
    # largest single country instead of the whole world (measured 6.1 GB before this change).
    if OUT.exists():
        import shutil
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    names = dict(countries)
    stats, manifest = new_stats(), []
    import collections
    queue, pending = collections.deque(countries), collections.deque()
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        while queue or pending:
            while queue and len(pending) < 3:  # bounded window: at most 3 countries in memory
                pending.append(pool.submit(load, queue.popleft()))
            code, records = pending.popleft().result()
            entry = write_country(OUT, code, names[code], records, stats)
            if entry:
                manifest.append(entry)
            print(code, len(records), flush=True)
            del records
    stats = write_manifest(OUT, manifest, stats, 'geonames' + (':' + subset if subset else ':world'))
    stats['seconds'] = round(time.time() - started, 1)
    stats['peakRssMB'] = round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024, 1)
    stats['subset'] = subset or None
    pathlib.Path('geography-stats.json').write_text(json.dumps(stats, indent=1))
    print(json.dumps(stats), flush=True)
    if not subset and stats['countries'] < 240:
        raise SystemExit(f"Only {stats['countries']} countries in catalog; refusing to publish an incomplete catalog")


if __name__ == '__main__':
    main()
