"""Generate country-scoped locality search shards from GeoNames CC BY 4.0.
Run on build infrastructure, not in the user's browser. No search data leaves the site.
"""
import csv, io, json, pathlib, urllib.request, zipfile, unicodedata, concurrent.futures, time, os
BASE='https://download.geonames.org/export/dump/'
OUT=pathlib.Path('public/geography')
OUT.mkdir(parents=True,exist_ok=True)
def fetch(name):
    req=urllib.request.Request(BASE+name,headers={'User-Agent':'AstralisAI-geography-build/1.0'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req,timeout=120) as r: return r.read()
        except OSError:
            if attempt==2: raise
            time.sleep(2**attempt)
def lines(name):
    return fetch(name).decode('utf-8').splitlines()
def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFKD',s.casefold()) if not unicodedata.combining(c))
def write(path,obj):
    path.parent.mkdir(parents=True,exist_ok=True)
    data=json.dumps(obj,ensure_ascii=False,separators=(',',':')).encode('utf-8')
    if len(data)>24*1024*1024: raise ValueError(f'Asset too large: {path}')
    path.write_bytes(data)
countries=[(r[0],r[4]) for r in csv.reader((s for s in lines('countryInfo.txt') if s and not s.startswith('#')),delimiter='\t') if len(r)>4 and len(r[0])==2]
admin1={r[0]:r[1] for r in csv.reader(lines('admin1CodesASCII.txt'),delimiter='\t') if len(r)>1}
admin2={r[0]:r[1] for r in csv.reader(lines('admin2Codes.txt'),delimiter='\t') if len(r)>1}
# Prefix shards limit transfer even for the largest countries.
def bucket(p):
    h=0
    for byte in p.encode('utf-8'): h=(h*31+byte)%64
    return str(h)
def country(item):
    code,name=item
    bins={}
    with zipfile.ZipFile(io.BytesIO(fetch(code+'.zip'))) as z:
        with z.open(code+'.txt') as f:
            for r in csv.reader(io.TextIOWrapper(f,encoding='utf-8'),delimiter='\t'):
                if len(r)<19 or r[6]!='P' or not r[17] or not r[1]: continue
                region=admin1.get(code+'.'+r[10],'')
                district=admin2.get(code+'.'+r[10]+'.'+r[11],'')
                entry=[r[0],r[1],region,district,r[17],int(r[14] or 0)]
                aliases={norm(r[1]),norm(r[2])}
                # Include alternate names including local scripts.
                aliases.update(norm(a) for a in r[3].split(',') if a)
                prefixes={a[:2] for a in aliases if len(a)>=2}
                for p in prefixes:
                    key=bucket(p)
                    bins.setdefault(key,[]).append([entry,[a for a in aliases if a.startswith(p)]])
    for key,rows in bins.items(): write(OUT/code/(key+'.json'),rows)
    
    return code,len(bins)
# Build only when explicitly invoked. Fail rather than silently publish incomplete data.
if os.environ.get('GEOGRAPHY_COUNTRIES'):
    allowed=set(os.environ['GEOGRAPHY_COUNTRIES'].split(','))
    countries=[c for c in countries if c[0] in allowed]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for code,count in pool.map(country,countries): print(code,count,flush=True)
write(OUT/'countries.json',countries)
if sum(1 for p in OUT.rglob('*.json'))>17500: raise ValueError('Too many static assets')
print('GeoNames index complete',flush=True)
