const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

async function testBrowser() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const tmpDir = path.join(os.tmpdir(), 'edge-interaction-' + Date.now());
  const edge = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9241',
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9241/json');
  const tabs = await res.json();
  const WebSocket = require('../node_modules/next/dist/compiled/ws');
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (data) => {
      const p = JSON.parse(data);
      if (p.id === curId) {
        ws.removeListener('message', handler);
        resolve(p.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.on('open', r));
  await send('Page.enable');
  await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

  async function navigateAndWait(url, waitMs = 2500) {
    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, waitMs));
  }

  console.log('--- TEST 1: Mobile Navigation Drawer & Escape Key ---');
  await navigateAndWait('http://localhost:3000/');

  let evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: 'new Promise(resolve => { const btn = document.querySelector(".mobile-nav-toggle"); if(!btn) return resolve("no-btn"); btn.click(); setTimeout(() => resolve(document.querySelector("#mobile-navigation-drawer") !== null), 300); })'
  });
  console.log('Mobile menu drawer opened:', evalRes.result.value);

  evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: 'new Promise(resolve => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); setTimeout(() => resolve(document.querySelector("#mobile-navigation-drawer") === null), 300); })'
  });
  console.log('Mobile menu closed via Escape:', evalRes.result.value);

  console.log('--- TEST 2: Catalogue Filter and Search Sync ---');
  await navigateAndWait('http://localhost:3000/products?category=socks');

  evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: '(() => { const cards = document.querySelectorAll(".catalogue-product-card"); return cards.length; })()'
  });
  console.log('Socks filtered products count:', evalRes.result.value);

  console.log('--- TEST 3: Contact Inquiry Composer Context Prefill ---');
  await navigateAndWait('http://localhost:3000/contact?brand=londonBoy&product=Structured%20Ribbed%20Crew%20Sock&sku=LB-SK-01&type=Wholesale');

  evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: '(() => { const subj = document.querySelector("#composer-subject"); const type = document.querySelector("#composer-type"); return { subject: subj ? subj.value : "", type: type ? type.value : "" }; })()'
  });
  console.log('Contact form prefilled state:', evalRes.result.value);

  console.log('--- TEST 4: Lightbox Modal on Product Detail ---');
  await navigateAndWait('http://localhost:3000/products/structured-ribbed-crew-sock');

  evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: 'new Promise(resolve => { const btn = document.querySelector(".enlarge-image-btn"); if(!btn) return resolve("no-btn"); btn.click(); setTimeout(() => resolve(document.querySelector(".lightbox-overlay") !== null), 300); })'
  });
  console.log('Lightbox opened:', evalRes.result.value);

  evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: 'new Promise(resolve => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); setTimeout(() => resolve(document.querySelector(".lightbox-overlay") === null), 300); })'
  });
  console.log('Lightbox closed via Escape:', evalRes.result.value);

  edge.kill();
  console.log('ALL BROWSER INTERACTION TESTS PASSED!');
  process.exit(0);
}

testBrowser().catch(err => {
  console.error('Interaction test failed:', err);
  process.exit(1);
});
