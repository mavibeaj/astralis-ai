"""Generate independent reference values for engine regression tests.

Reference: Swiss Ephemeris (pyswisseph, built-in Moshier ephemeris, FLG_MOSEPH),
an implementation independent from Astronomy Engine. pyswisseph is AGPL/commercial
dual-licensed; it is used ONLY on a developer machine to produce the numeric fixture
tests/fixtures/ephemeris-reference.json. It is never imported by the app or shipped.

Local-time -> UTC references use Python's zoneinfo (tzdb), independent of the
browser/ICU Intl implementation used by src/lib/birth-time.mjs.

Coordinates below are GeoNames values (see geonameid comments).
Run: pip install pyswisseph==2.10.3.2 && python3 scripts/generate-ephemeris-reference.py
"""
import json, datetime as dt
from zoneinfo import ZoneInfo
import swisseph as swe

PLACES = {  # name: (lat, lon, IANA zone)  -- GeoNames geonameid
    'Lima': (-12.04318, -77.02824, 'America/Lima'),          # 3936456
    'Chiclayo': (-6.77008, -79.85495, 'America/Lima'),       # 3698350
    'Cusco': (-13.53188, -71.96701, 'America/Lima'),         # 3941584
    'London': (51.50853, -0.12574, 'Europe/London'),          # 2643743
    'New York': (40.71427, -74.00597, 'America/New_York'),    # 5128581
    'Tokyo': (35.6895, 139.69171, 'Asia/Tokyo'),              # 1850147
    'Sydney': (-33.86785, 151.20732, 'Australia/Sydney'),     # 2147714
    'Reykjavik': (64.13548, -21.89541, 'Atlantic/Reykjavik'), # 3413829
    'Nairobi': (-1.28333, 36.81667, 'Africa/Nairobi'),        # 184745
    'Sao Paulo': (-23.5475, -46.63611, 'America/Sao_Paulo'),  # 3448439
}
CASES = [  # (place, local date, local time) -- fictional births, no real people
    ('Lima', '1990-03-06', '07:45'), ('Chiclayo', '1987-02-15', '12:00'), ('Cusco', '2001-07-21', '23:10'),
    ('London', '1975-12-24', '18:20'), ('New York', '2021-03-14', '03:30'), ('Tokyo', '1999-08-11', '19:05'),
    ('Sydney', '2010-01-01', '00:30'), ('Reykjavik', '1980-06-21', '12:00'), ('Nairobi', '2024-10-02', '06:15'),
    ('Sao Paulo', '1995-11-05', '14:40'), ('Lima', '1960-05-31', '15:00'), ('London', '1944-06-06', '06:30'),
]
BODIES = {'Sun': swe.SUN, 'Moon': swe.MOON, 'Mercury': swe.MERCURY, 'Venus': swe.VENUS, 'Mars': swe.MARS,
          'Jupiter': swe.JUPITER, 'Saturn': swe.SATURN, 'Uranus': swe.URANUS, 'Neptune': swe.NEPTUNE, 'Pluto': swe.PLUTO,
          'MeanNode': swe.MEAN_NODE, 'TrueNode': swe.TRUE_NODE}

out = {'generator': 'pyswisseph ' + swe.version + ' FLG_MOSEPH; zoneinfo tzdb', 'cases': []}
for place, d, t in CASES:
    lat, lon, zone = PLACES[place]
    local = dt.datetime.fromisoformat(d + 'T' + t).replace(tzinfo=ZoneInfo(zone))
    utc = local.astimezone(dt.timezone.utc)
    jd = swe.julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60 + utc.second / 3600)
    lons = {k: swe.calc_ut(jd, b, swe.FLG_MOSEPH)[0][0] for k, b in BODIES.items()}
    cusps, ascmc = swe.houses_ex(jd, lat, lon, b'P', swe.FLG_MOSEPH)
    out['cases'].append({'place': place, 'latitude': lat, 'longitude': lon, 'zone': zone, 'localDate': d, 'localTime': t,
                         'utc': utc.strftime('%Y-%m-%dT%H:%M:%S.000Z'), 'longitudes': lons,
                         'ascendant': ascmc[0], 'midheaven': ascmc[1], 'placidusCusps': list(cusps)})
json.dump(out, open('tests/fixtures/ephemeris-reference.json', 'w'), indent=1)
print('cases', len(out['cases']))
