const { spawn } = require('child_process');
const path = require('os');

const PAGES = [
  '/',
  '/about',
  '/brands',
  '/brands/londonboy',
  '/brands/londonboy/socks',
  '/brands/londonboy/innerwear',
  '/products',
  '/products/structured-ribbed-crew-sock',
  '/associates',
  '/contact'
];

async function main() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const tmpDir = require('path').join(require('os').tmpdir(), 'edge-cdp-overflow-' + Date.now());
  const edge = spawn(edgePath, [
    "--headless",
    "--remote-debugging-port=9229",
    `--user-data-dir=${tmpDir}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch("http://127.0.0.1:9229/json");
    const tabs = await res.json();
    const wsUrl = tabs[0].webSocketDebuggerUrl;

    const WebSocket = require("../node_modules/next/dist/compiled/ws");
    const ws = new WebSocket(wsUrl);

    let msgId = 1;
    const send = (method, params = {}) => {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (data) => {
          const parsed = JSON.parse(data);
          if (parsed.id === id) {
            ws.removeListener('message', handler);
            resolve(parsed.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise(resolve => ws.on('open', resolve));

    await send("Page.enable");
    await send("DOM.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true
    });

    let totalOverflows = 0;

    for (const pagePath of PAGES) {
      await send("Page.navigate", { url: `http://localhost:3000${pagePath}` });
      await new Promise(r => setTimeout(r, 1200));

      const evalRes = await send("Runtime.evaluate", {
        expression: `(() => {
          const results = [];
          const docWidth = window.innerWidth;
          const pageScrolls = document.documentElement.scrollWidth > docWidth + 3;
          if (pageScrolls) {
            results.push({
              tag: 'HTML',
              className: 'PAGE_OVERFLOW',
              id: '',
              scrollWidth: document.documentElement.scrollWidth,
              docWidth
            });
          }
          document.querySelectorAll('*').forEach(el => {
            if (el.closest('.lb-showcase-track')) return; // intentional carousel scroll
            const rect = el.getBoundingClientRect();
            if (rect.right > docWidth + 3) {
              results.push({
                tag: el.tagName,
                className: typeof el.className === 'string' ? el.className.slice(0, 30) : '',
                id: el.id,
                right: Math.round(rect.right),
                scrollWidth: el.scrollWidth,
                docWidth
              });
            }
          });
          return JSON.stringify(results);
        })()`
      });

      const overflowElements = JSON.parse(evalRes.result.value);
      if (overflowElements.length > 0) {
        console.error(`Page ${pagePath} has ${overflowElements.length} overflow elements:`, overflowElements);
        totalOverflows += overflowElements.length;
      } else {
        console.log(`Page ${pagePath}: PASSED (0 horizontal overflow elements at 390px)`);
      }
    }

    edge.kill();

    if (totalOverflows === 0) {
      console.log("ALL 10 PAGES PASSED MOBILE RESPONSIVENESS AUDIT!");
      process.exit(0);
    } else {
      console.error(`TOTAL OVERFLOWS DETECTED: ${totalOverflows}`);
      process.exit(1);
    }
  } catch (err) {
    console.error("Error during overflow audit:", err);
    edge.kill();
    process.exit(1);
  }
}

main();
