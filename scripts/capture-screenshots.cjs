const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'brands', path: '/brands' },
  { name: 'londonboy', path: '/brands/londonboy' },
  { name: 'socks', path: '/brands/londonboy/socks' },
  { name: 'innerwear', path: '/brands/londonboy/innerwear' },
  { name: 'products', path: '/products' },
  { name: 'product-detail', path: '/products/structured-ribbed-crew-sock' },
  { name: 'associates', path: '/associates' },
  { name: 'contact', path: '/contact' }
];

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, mobile: true }
];

const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const tmpDir = path.join(require('os').tmpdir(), 'edge-cdp-' + Date.now());
  const edge = spawn(edgePath, [
    "--headless",
    "--remote-debugging-port=9225",
    `--user-data-dir=${tmpDir}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch("http://127.0.0.1:9225/json");
    const tabs = await res.json();
    const wsUrl = tabs[0].webSocketDebuggerUrl;

    const WebSocket = require("../node_modules/next/dist/compiled/ws");
    const ws = new WebSocket(wsUrl);

    let msgId = 1;
    const send = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (data) => {
          const parsed = JSON.parse(data);
          if (parsed.id === id) {
            ws.removeListener('message', handler);
            if (parsed.error) {
              console.error(`CDP Error for ${method}:`, parsed.error);
              reject(parsed.error);
            } else {
              resolve(parsed.result);
            }
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise(resolve => ws.on('open', resolve));

    await send("Page.enable");
    await send("DOM.enable");

    for (const vp of VIEWPORTS) {
      console.log(`Setting viewport: ${vp.name} (${vp.width}x${vp.height})`);
      await send("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.mobile
      });

      for (const page of PAGES) {
        const url = `http://localhost:3000${page.path}`;
        console.log(`Navigating to ${url}...`);
        await send("Page.navigate", { url });

        // Wait for page to render
        await new Promise(r => setTimeout(r, 1200));

        const screenshot = await send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: false
        });

        const filePath = path.join(SCREENSHOT_DIR, `${vp.name}-${page.name}.png`);
        fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'));
        console.log(`Saved screenshot: ${filePath}`);
      }
    }

    edge.kill();
    console.log("All screenshots captured successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Screenshot error:", err);
    edge.kill();
    process.exit(1);
  }
}

run();
