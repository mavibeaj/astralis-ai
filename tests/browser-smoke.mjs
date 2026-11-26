import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const server=spawn('python3',['-m','http.server','4173','--bind','127.0.0.1','--directory','out'],{stdio:'ignore'});
let browser;
try{
 for(let i=0;i<50;i++){try{if((await fetch('http://127.0.0.1:4173')).ok)break}catch{}await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
 for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport,acceptDownloads:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173');
  await page.getByRole('button',{name:'ES',exact:true}).click();
  await page.getByRole('button',{name:'Pareja',exact:true}).click();
  const first=page.locator('.location-picker').first();
  await first.getByRole('option',{name:'Perú',exact:true}).waitFor({state:'attached'});
  await first.getByLabel('País de nacimiento').selectOption('PE');
  await first.getByPlaceholder('Escribe al menos 2 letras').fill('Chiclayo');
  await first.getByRole('button',{name:/Chiclayo.*Lambayeque/i}).first().click();
  assert.equal(await page.locator('#a-zone').inputValue(),'America/Lima');
  {const lat=Number(await page.locator('#a-lat').inputValue());assert.ok(lat>-6.9&&lat<-6.6,'Chiclayo latitude '+lat)}
  await first.getByText(/✓ Chiclayo/).waitFor();
  // Non-existent place: explicit empty state, manual path offered.
  await first.getByPlaceholder('Escribe al menos 2 letras').fill('Zzqxw');
  await first.getByText('No encontramos ese lugar',{exact:false}).waitFor();
  await page.getByRole('button',{name:'Probar con datos ficticios'}).click();
  // Picker resynchronises with the fictional profile (GB) instead of keeping Peru.
  assert.equal(await first.getByLabel('País de nacimiento').inputValue(),'GB');
  await page.getByRole('button',{name:'Descubrir nuestra conexión'}).click();
  await page.getByRole('heading',{name:'Índice simbólico experimental'}).waitFor();
  await page.getByRole('button',{name:'Ver demostración gratuita'}).click();
  await page.getByText('Vista previa sin IA generativa.',{exact:false}).waitFor();
  assert.equal(await page.locator('.premium-panel article').count(),5);
  const download=page.waitForEvent('download');
  await page.getByRole('button',{name:'Descargar tarjeta · 9:16'}).click();
  assert.match((await download).suggestedFilename(),/\.png$/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);
  await page.screenshot({path:'browser-'+viewport.width+'.png',fullPage:true});
  await page.close();
 }
 // Catalog unavailable: the page must say so and fall back to manual entry, never show empty selectors silently.
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/geography/**',r=>r.fulfill({status:404,contentType:'text/html',body:'<!doctype html><p>404</p>'}));
 await page.goto('http://127.0.0.1:4173');
 await page.getByRole('button',{name:'ES',exact:true}).click();
 await page.getByRole('button',{name:'Pareja',exact:true}).click();
 const picker=page.locator('.location-picker').first();
 await picker.getByRole('alert').getByText('no está disponible',{exact:false}).waitFor();
 await picker.getByLabel('Lugar de nacimiento').fill('Chiclayo, Lambayeque, Perú');
 await picker.getByLabel('Zona horaria de nacimiento').fill('America/Lima');
 assert.deepEqual(errors,[]);
 await page.screenshot({path:'browser-catalog-unavailable.png',fullPage:true});
 await page.close();
}finally{await browser?.close();server.kill();}
