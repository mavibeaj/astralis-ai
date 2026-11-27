import * as Astronomy from 'astronomy-engine';
export const ENGINE_VERSION='astronomy-engine@2.1.19';
const planets=['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
export function calculateUtc(instant){
 if(!(instant instanceof Date)||!Number.isFinite(instant.getTime()))throw new TypeError('Valid UTC instant required');
 const longitudes={Sun:Astronomy.SunPosition(instant).elon,Moon:Astronomy.EclipticGeoMoon(instant).lon};
 for(const planet of planets)longitudes[planet]=Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[planet],instant,true)).elon;
 for(const value of Object.values(longitudes))if(!Number.isFinite(value)||value<0||value>=360)throw new Error('Invalid calculated longitude');
 return {version:ENGINE_VERSION,utc:instant.toISOString(),frame:'geocentric tropical true ecliptic of date',longitudes};
}
