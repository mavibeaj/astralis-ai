// Allowlisted payload: no birth profiles, names, dates, places or raw charts.
export function shareCardSvg(index,locale='en',format='story'){
 if(!Number.isInteger(index)||index<0||index>100)throw new RangeError('Invalid index');
 if(!['en','es'].includes(locale)||!['story','portrait'].includes(format))throw new RangeError('Invalid card options');
 const h=format==='story'?1920:1350, mid=h/2;
 const title=locale==='es'?'Nuestra conexión simbólica':'Our symbolic connection';
 const note=locale==='es'?'Entretenimiento · Índice no científico':'Entertainment · Non-scientific index';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="'+h+'" viewBox="0 0 1080 '+h+'"><rect width="1080" height="'+h+'" fill="#100f23"/><g fill="none" stroke="#bca7fa" stroke-width="3"><circle cx="440" cy="'+(mid-100)+'" r="260"/><circle cx="640" cy="'+(mid-100)+'" r="260"/></g><g text-anchor="middle" fill="#f4edff" font-family="sans-serif"><text x="540" y="120" font-size="44">Astralis AI</text><text x="540" y="'+(mid-345)+'" font-size="42">'+title+'</text><text x="540" y="'+(mid-55)+'" font-size="110" font-weight="bold">'+index+'/100</text><text x="540" y="'+(h-130)+'" font-size="34">'+note+'</text><text x="540" y="'+(h-75)+'" font-size="28">'+(locale==='es'?'Resultado experimental':'Experimental result')+'</text></g></svg>';
}
