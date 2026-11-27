import * as A from 'astronomy-engine';
const rad=Math.PI/180, deg=180/Math.PI;
const norm=x=>(x%360+360)%360;
export function validCoordinates(lat,lon){return typeof lat==='number'&&typeof lon==='number'&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180}
export function natalAngles(instant,lat,lon){
 if(!validCoordinates(lat,lon)||!(instant instanceof Date)||!Number.isFinite(+instant))throw new RangeError('Invalid observer or time');
 if(Math.abs(lat)>=89.999999)return null;
 // In true equatorial coordinates of date, intersect the ecliptic with
 // the local horizon and choose the vector pointing toward local east.
 const time=A.MakeTime(instant), theta=(A.SiderealTime(time)*15+lon)*rad, phi=lat*rad;
 const zenith=[Math.cos(phi)*Math.cos(theta),Math.cos(phi)*Math.sin(theta),Math.sin(phi)];
 const east=[-Math.sin(theta),Math.cos(theta),0];
 const rotation=A.Rotation_EQD_ECT(time);
 const rotate=v=>{const r=A.RotateVector(rotation,new A.Vector(...v,time));return [r.x,r.y,r.z]};
 const z=rotate(zenith), e=rotate(east);
 let x=-z[1],y=z[0];const length=Math.hypot(x,y);
 if(length<1e-10)return null;
 const eastDot=x*e[0]+y*e[1];
 if(Math.abs(eastDot)<1e-10)return null;
 if(eastDot<0){x=-x;y=-y}
 const ascendant=norm(Math.atan2(y,x)*deg);
 // Meridian plane intersects ecliptic; choose upper-meridian branch by
 // equatorial right ascension, not altitude (MC may be below horizon).
 const meridianEast=rotate(east);
 x=-meridianEast[1];y=meridianEast[0];
 const upper=rotate([Math.cos(theta),Math.sin(theta),0]);
 if(x*upper[0]+y*upper[1]<0){x=-x;y=-y}
 const midheaven=norm(Math.atan2(y,x)*deg);
 return {ascendant,midheaven,descendant:norm(ascendant+180),imumCoeli:norm(midheaven+180),houseSystem:'whole-sign',houseCusps:Array.from({length:12},(_,i)=>norm(Math.floor(ascendant/30)*30+i*30))};
}
export function wholeSignHouse(longitude,ascendant){
 if(!Number.isFinite(longitude)||!Number.isFinite(ascendant))throw new RangeError('Invalid longitude');
 return Math.floor(norm(Math.floor(norm(longitude)/30)*30-Math.floor(norm(ascendant)/30)*30)/30)+1;
}
