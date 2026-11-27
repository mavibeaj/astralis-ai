// End-to-end journey on the exported site (out/), desktop and mobile.
// Requires a catalog containing PE and JP (GeoNames build or offline fixture).
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
// BASE_URL runs the same journey against a published preview (e.g. Cloudflare Pages).
const REMOTE = process.env.BASE_URL?.replace(/\/$/, '');
const server = REMOTE ? null : spawn('python3', ['-m', 'http.server', '4173', '--bind', '127.0.0.1', '--directory', 'out'], {stdio: 'ignore'});
const URL_ = REMOTE ?? 'http://127.0.0.1:4173';
const SHOTS = process.env.SCREENSHOT_PREFIX ?? 'browser';
let browser;

async function open(viewport, routeCatalog404 = false) {
  const page = await browser.newPage({viewport, acceptDownloads: true, locale: 'es-PE'});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => {if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errors.push(m.text());});
  if (routeCatalog404) await page.route('**/geography/**', r => r.fulfill({status: 404, contentType: 'text/html', body: '<!doctype html><p>404</p>'}));
  await page.goto(URL_);
  await page.getByRole('button', {name: 'ES', exact: true}).click();
  return {page, errors};
}
const noOverflow = async page => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'horizontal overflow');
async function pickPlace(page, prefix, country, query, match) {
  const picker = page.locator('.location-picker');
  await picker.getByRole('option', {name: country, exact: true}).waitFor({state: 'attached'});
  await picker.getByLabel('País de nacimiento').selectOption({label: country});
  await picker.getByLabel('Ciudad, distrito o pueblo').fill(query);
  await picker.getByRole('button', {name: match}).first().click();
  await picker.getByText('✓', {exact: false}).waitFor();
  return {zone: await page.locator(`#${prefix}-zone`).inputValue(), lat: Number(await page.locator(`#${prefix}-lat`).inputValue()), lon: Number(await page.locator(`#${prefix}-lon`).inputValue())};
}

try {
  for (let i = 0; i < 50; i++) {try {if ((await fetch(URL_)).ok) break;} catch {} await new Promise(r => setTimeout(r, 200));}
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {});
  for (const viewport of [{width: 1280, height: 900}, {width: 390, height: 844}]) {
    const w = viewport.width;
    const {page, errors} = await open(viewport);
    await page.getByRole('heading', {level: 1}).waitFor();
    await noOverflow(page);
    await page.screenshot({path: `${SHOTS}-${w}-landing.png`, fullPage: true});
    // Step 0: relationship
    await page.getByRole('button', {name: 'Descubrir nuestra conexión'}).first().click();
    await page.getByRole('radio', {name: 'Pareja'}).click();
    await page.getByLabel('Tu nombre o apodo (opcional)').fill('Ana');
    await page.getByLabel('Su nombre o apodo (opcional)').fill('Leo');
    await page.getByRole('button', {name: 'Continuar'}).click();
    // Step 1: validation, then Chiclayo from the catalog
    await page.getByRole('button', {name: 'Continuar'}).click();
    await page.locator('p.error[role=alert]').waitFor();
    await page.getByLabel('Fecha de nacimiento').fill('1990-03-06');
    await page.getByLabel('Hora de nacimiento').fill('07:45');
    const picker = page.locator('.location-picker');
    await picker.getByRole('option', {name: 'Perú', exact: true}).waitFor({state: 'attached'});
    await picker.getByLabel('País de nacimiento').selectOption('PE');
    await picker.getByLabel('Ciudad, distrito o pueblo').fill('Zzqxw');
    await picker.getByText('No encontramos ese lugar', {exact: false}).waitFor();
    const a = await pickPlace(page, 'a', 'Perú', 'Chiclayo', /Chiclayo.*Lambayeque/i);
    assert.equal(a.zone, 'America/Lima');
    assert.ok(a.lat > -6.9 && a.lat < -6.6 && a.lon > -80 && a.lon < -79.7, `Chiclayo ${a.lat},${a.lon}`);
    await page.screenshot({path: `${SHOTS}-${w}-form.png`, fullPage: true});
    await page.getByRole('button', {name: 'Continuar'}).click();
    // Step 2: international search
    await page.getByLabel('Fecha de nacimiento').fill('1995-09-22');
    await page.getByLabel('Hora de nacimiento').fill('15:30');
    const b = await pickPlace(page, 'b', 'Japón', 'Tokyo', /^Tokyo/i);
    assert.equal(b.zone, 'Asia/Tokyo');
    assert.ok(b.lat > 35 && b.lat < 36.5 && b.lon > 139 && b.lon < 140.5);
    await page.getByRole('button', {name: 'Continuar'}).click();
    // Step 3: confirm + consent
    await page.getByText('Chiclayo', {exact: false}).first().waitFor();
    await page.getByRole('button', {name: 'Calcular nuestra conexión'}).click();
    await page.locator('p.error[role=alert]').waitFor();
    await page.getByLabel('Ambas personas son adultas', {exact: false}).check();
    await page.getByRole('button', {name: 'Calcular nuestra conexión'}).click();
    await page.getByText('Calculando posiciones planetarias', {exact: false}).waitFor();
    // Story-first results: cover + 8 narrative chapters before anything technical.
    await page.locator('.story-cover h1').waitFor({timeout: 15000});
    assert.ok(await page.locator('details.chapter').count() >= 10, 'chapters');
    assert.ok(await page.locator('#ch-1 .story-card').count() >= 11, 'person A sections');
    assert.ok(await page.locator('#ch-2 .story-card').count() >= 11, 'person B sections');
    assert.match(await page.locator('#ch-1 .story-card.essence p').first().textContent(), /Ana tiene el Sol en Piscis/);
    assert.equal(await page.locator('#ch-10').getAttribute('open'), null, 'technical chapter closed by default');
    await page.locator('#ch-1 .basis summary').first().click();
    await page.locator('#ch-1 .basis li').first().waitFor();
    for (const n of [6, 7]) await page.locator(`#ch-${n} > summary`).click(); // collapsed by default
    for (let n = 1; n <= 8; n++) await page.locator(`#ch-${n}`).screenshot({path: `${SHOTS}-${w}-ch${n}.png`});
    await page.locator('.story-cover').screenshot({path: `${SHOTS}-${w}-cover.png`});
    await page.screenshot({path: `${SHOTS}-${w}-results.png`, fullPage: true});
    // Technical chapter on demand: wheels come from engine data.
    await page.locator('#ch-10 > summary').click();
    await page.getByRole('heading', {name: 'Índice simbólico experimental'}).waitFor();
    const wheel = page.locator('figure.wheel');
    assert.ok(await wheel.locator('g.body').count() >= 20, 'synastry bodies');
    assert.ok(await wheel.locator('line.aspect').count() > 0, 'aspects');
    assert.ok(await wheel.locator('text.house-num').count() === 12, 'houses');
    await wheel.locator('g.body circle.body-bg').nth(2).hover();
    await wheel.locator('g.tooltip').waitFor();
    await wheel.screenshot({path: `${SHOTS}-${w}-synastry-wheel.png`});
    await page.getByRole('tab', {name: /Carta A/}).click();
    await page.getByText('Grados exactos').click();
    assert.ok(await page.locator('.positions td').count() >= 13);
    // Premium excerpt, share card
    await page.getByRole('button', {name: 'Ver demostración gratuita'}).click();
    assert.ok(await page.locator('.premium-demo p').count() >= 2);
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Descargar tarjeta · 9:16'}).click();
    assert.match((await download).suggestedFilename(), /\.png$/);
    // Checkout simulation: decline, retry, approve, report, download, recovery.
    await page.getByRole('button', {name: 'Obtener informe premium (simulación)'}).click();
    await page.locator('.order-box .sim-badge').waitFor();
    await page.getByLabel('Rechazado').check();
    await page.getByRole('button', {name: 'Confirmar pago simulado'}).click();
    await page.getByText('Pago simulado rechazado', {exact: false}).waitFor();
    assert.equal(await page.getByTestId('order-status').textContent(), 'failed');
    await page.getByLabel('Aprobado').check();
    await page.getByRole('button', {name: 'Confirmar pago simulado'}).click();
    const code = await page.getByTestId('recovery-code').textContent({timeout: 15000});
    assert.match(code, /^[A-Z0-9]{20}$/);
    assert.ok(await page.locator('.report-view article').count() >= 3);
    assert.match(await page.locator('.report-view').textContent(), /8 capítulos/);
    const reportDl = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Descargar informe'}).click();
    assert.match((await reportDl).suggestedFilename(), /^cosmic-match-premium-sim_ord_.*\.html$/);
    if (w === 1280) await page.locator('.premium-panel').screenshot({path: 'browser-checkout-report.png'});
    await noOverflow(page);
    // Fictional data resynchronises the picker (no stale Peru selection).
    await page.getByRole('button', {name: 'Astralis AI'}).click();
    await page.getByLabel('Código de recuperación').fill(code.toLowerCase());
    await page.getByRole('button', {name: 'Recuperar'}).click();
    await page.locator('.recover .report-view article').first().waitFor();
    await page.getByRole('button', {name: 'Probar con datos ficticios'}).click();
    await page.getByRole('heading', {name: 'Revisa los datos'}).waitFor();
    await page.getByRole('button', {name: 'Editar'}).first().click();
    const c = await page.locator('#a-country').inputValue();
    assert.notEqual(c, 'PE', 'picker kept the previous country');
    if (await page.locator('#a-country option[value="GB"]').count()) assert.equal(c, 'GB');
    // Unknown time on person B -> partial reading, wheels without houses for B.
    await page.getByRole('button', {name: 'Continuar'}).click();
    await page.getByLabel('No conozco la hora exacta').check();
    await page.getByRole('button', {name: 'Continuar'}).click();
    await page.getByRole('button', {name: 'Calcular nuestra conexión'}).click();
    await page.locator('.story-cover h1').waitFor({timeout: 15000});
    await page.locator('.story-cover .notice').waitFor();
    assert.match(await page.locator('#ch-2 .story-card').nth(2).textContent(), /no podemos calcular el Ascendente/);
    await page.locator('#ch-10 > summary').click();
    await page.getByRole('heading', {name: /Lectura parcial/}).waitFor();
    await page.getByRole('tab', {name: /Carta B/}).click();
    assert.equal(await page.locator('figure.wheel text.house-num').count(), 0);
    await noOverflow(page);
    assert.deepEqual(errors, []);
    await page.close();
  }
  // Catalog unavailable: explicit alert and manual entry, never silent empty selectors.
  const {page, errors} = await open({width: 390, height: 844}, true);
  await page.getByRole('button', {name: 'Descubrir nuestra conexión'}).first().click();
  await page.getByRole('button', {name: 'Continuar'}).click();
  await page.locator('.notice[role=alert]').getByText('no está disponible', {exact: false}).waitFor();
  await page.getByLabel('Lugar de nacimiento').fill('Chiclayo, Lambayeque, Perú');
  await page.locator('#a-zone').fill('America/Lima');
  assert.deepEqual(errors, []);
  await page.screenshot({path: `${SHOTS}-catalog-unavailable.png`, fullPage: true});
  await page.close();
} finally {await browser?.close(); server?.kill();}
