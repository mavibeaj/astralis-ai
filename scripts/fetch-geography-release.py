"""Install the pinned, versioned GeoNames catalog instead of rebuilding it.

Why: rebuilding 5.66 M places from ~250 GeoNames zips on every commit takes ~12 min on a
GitHub runner and longer on the Cloudflare builder, couples narrative/UI changes to a
third-party download, and makes the catalog differ from day to day.

geography.lock.json pins one catalog bundle (a .tar.gz of public/geography plus
geography-stats.json) by URL and SHA-256. This script downloads it, refuses it if the hash
differs, and extracts it. Bundles are produced by .github/workflows/geography-release.yml.

Exit codes: 0 installed · 3 no lock file (caller falls back to a rebuild) · 1 any failure.
A pinned bundle that cannot be fetched or verified is a hard failure; it never silently
falls back to different data.
"""
import hashlib, json, os, pathlib, shutil, sys, tarfile, tempfile, time, urllib.request

LOCK = pathlib.Path(os.environ.get('GEOGRAPHY_LOCK', 'geography.lock.json'))
OUT = pathlib.Path('public/geography')


def download(url, dest):
    req = urllib.request.Request(url, headers={'User-Agent': 'AstralisAI-geography-fetch/1.0'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=300) as r, open(dest, 'wb') as f:
                shutil.copyfileobj(r, f, 1 << 20)
            return
        except OSError as e:
            if attempt == 3:
                raise
            print(f'download retry {attempt + 1}: {e}', file=sys.stderr)
            time.sleep(2 ** attempt)


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def safe_extract(tar, root):
    root = root.resolve()
    for m in tar.getmembers():
        target = (root / m.name).resolve()
        if not (m.isfile() or m.isdir()) or (target != root and root not in target.parents):
            raise SystemExit(f'refusing unsafe bundle member: {m.name}')
    if hasattr(tarfile, 'data_filter'):
        tar.extractall(root, filter='data')
    else:
        tar.extractall(root)


def main():
    if not LOCK.exists():
        print(f'{LOCK} not found: no pinned catalog', file=sys.stderr)
        return 3
    lock = json.loads(LOCK.read_text())
    for k in ('version', 'url', 'sha256'):
        if not lock.get(k):
            raise SystemExit(f'{LOCK}: missing "{k}"')
    t0 = time.time()
    with tempfile.TemporaryDirectory() as tmp:
        bundle = pathlib.Path(tmp) / 'geography.tar.gz'
        download(lock['url'], bundle)
        got = sha256(bundle)
        if got != lock['sha256']:
            raise SystemExit(f'catalog {lock["version"]}: SHA-256 mismatch (expected {lock["sha256"]}, got {got})')
        stage = pathlib.Path(tmp) / 'x'
        stage.mkdir()
        with tarfile.open(bundle, 'r:gz') as tar:
            safe_extract(tar, stage)
        if not (stage / 'geography' / 'countries.json').exists():
            raise SystemExit('bundle has no geography/countries.json')
        if OUT.exists():
            shutil.rmtree(OUT)
        OUT.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(stage / 'geography'), OUT)
        stats = stage / 'geography-stats.json'
        if stats.exists():
            shutil.copy(stats, 'geography-stats.json')
    print(f'installed geography catalog {lock["version"]} ({bundle_size_mb(lock)}) in {time.time() - t0:.1f}s')
    return 0


def bundle_size_mb(lock):
    return f'{lock["bytes"] / 1e6:.0f} MB' if lock.get('bytes') else 'size not recorded'


if __name__ == '__main__':
    sys.exit(main())
