"""Install the pinned, versioned GeoNames catalog instead of rebuilding it.

Why: rebuilding 5.66 M places from ~250 GeoNames zips on every commit takes ~12 min on a
GitHub runner and longer on the Cloudflare builder, couples narrative/UI changes to a
third-party download, and makes the catalog differ from day to day.

geography.lock.json pins one catalog bundle (a .tar.gz of public/geography plus
geography-stats.json) by URL and SHA-256. This script downloads it, refuses it if the hash
differs, and extracts it. Bundles are produced by .github/workflows/geography-release.yml.

Private repository: set GEOGRAPHY_TOKEN (a read-only token, e.g. a fine-grained PAT with Contents: read on
this repo, stored as an encrypted build variable). The script then downloads `assetApiUrl` through the GitHub
API and follows the redirect to the signed storage URL WITHOUT the token. The token is never printed or logged.

Exit codes: 0 installed · 3 no lock file (caller falls back to a rebuild) · 1 any failure.
A pinned bundle that cannot be fetched or verified is a hard failure; it never silently
falls back to different data.
"""
import hashlib, json, urllib.error, os, pathlib, shutil, sys, tarfile, tempfile, time, urllib.request

LOCK = pathlib.Path(os.environ.get('GEOGRAPHY_LOCK', 'geography.lock.json'))
OUT = pathlib.Path('public/geography')


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def _open(url, token=None):
    """GET url. With a token: authenticated API request, then the redirect target is fetched without it."""
    ua = {'User-Agent': 'AstralisAI-geography-fetch/1.1'}
    if not token:
        return urllib.request.urlopen(urllib.request.Request(url, headers=ua), timeout=300)
    req = urllib.request.Request(url, headers={**ua, 'Authorization': f'Bearer {token}', 'Accept': 'application/octet-stream', 'X-GitHub-Api-Version': '2022-11-28'})
    try:
        return urllib.request.build_opener(_NoRedirect).open(req, timeout=300)
    except urllib.error.HTTPError as e:
        if e.code in (301, 302, 303, 307, 308) and e.headers.get('Location'):
            return urllib.request.urlopen(urllib.request.Request(e.headers['Location'], headers=ua), timeout=300)
        raise


def download(url, dest, token=None):
    for attempt in range(4):
        try:
            with _open(url, token) as r, open(dest, 'wb') as f:
                shutil.copyfileobj(r, f, 1 << 20)
            return
        except OSError as e:
            if attempt == 3:
                raise SystemExit(f'catalog download failed: {type(e).__name__} {getattr(e, "code", "")}'.strip())
            print(f'download retry {attempt + 1}: {type(e).__name__} {getattr(e, "code", "")}', file=sys.stderr)  # never the URL with credentials or the token
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
        token = os.environ.get('GEOGRAPHY_TOKEN') or None
        url = lock.get('assetApiUrl') if token and lock.get('assetApiUrl') else lock['url']
        download(url, bundle, token)
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
