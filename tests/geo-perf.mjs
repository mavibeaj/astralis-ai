// Mobile search latency on the exported site under a throttled "slow 4G" profile.
// Usage: node tests/geo-perf.mjs  (expects ./out with a catalog). Prints JSON.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
const server = spawn('python3', ['-m', 'http.server', '4174', '--bind', '127.0.0.1', '--directory', 'out'], {stdio: 'ignore'});
const QUERIES = [['PE', 'Chiclayo'], ['PE', 'Monsefú'], ['PE', 'San José'], ['US', 'Springfield'], ['BR', 'São Paulo'], ['JP', '東京'], ['IN', 'Delhi']];
let browser;
try {
  for (let i = 0; i < 50; i++) {try {if ((await fetch('http://127.0.0.1:4174')).ok) break;} catch {} await new Promise(r => setTimeout(r, 200));}
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {});
  const page = await browser.newPage({viewport: {width: 390, height: 844}});
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.emulateNetworkConditions', {offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8});
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
  const bytes = {}; page.on('response', async r => {if (r.url().includes('/geography/')) {try {bytes[r.url()] = (await r.body()).length;} catch {}}});
  await page.goto('http://127.0.0.1:4174');
  await page.getByRole('button', {name: 'ES', exact: true}).click();
  await page.getByRole('button', {name: 'Pareja', exact: true}).click();
  const picker = page.locator('.location-picker').first();
  await picker.getByLabel('País de nacimiento').waitFor();
  const results = [];
  for (const [cc, q] of QUERIES) {
    if (!(await picker.locator(`option[value="${cc}"]`).count())) {results.push({cc, q, skipped: true}); continue;}
    await picker.getByLabel('País de nacimiento').selectOption(cc);
    const t = Date.now();
    await picker.getByLabel('Ciudad, distrito o pueblo').fill(q);
    await picker.locator('.location-results button').first().waitFor({timeout: 30000});
    results.push({cc, q, ms: Date.now() - t, matches: await picker.locator('.location-results button').count()});
  }
  console.log(JSON.stringify({profile: 'slow-4G 1.6Mbps/150ms, CPU x4', results, shardBytes: Object.values(bytes)}, null, 1));
} finally {await browser?.close(); server.kill();}
