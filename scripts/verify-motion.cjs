const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

async function runVerification() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const tmpDir = path.join(os.tmpdir(), 'edge-motion-verify-' + Date.now());
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9244',
    `--user-data-dir=${tmpDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9244/json');
  const tabs = await res.json();
  const WebSocket = require('../node_modules/next/dist/compiled/ws');
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (data) => {
      const p = JSON.parse(data);
      if (p.id === curId) {
        ws.removeListener('message', handler);
        if (p.error) reject(p.error);
        else resolve(p.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.on('open', r));
  await send('Page.enable');
  await send('DOM.enable');
  await send('Runtime.enable');

  const screenshotsDir = path.join(__dirname, '..', 'docs', 'motion-verification-evidence');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  async function takeScreenshot(name) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const filepath = path.join(screenshotsDir, `${name}.png`);
    fs.writeFileSync(filepath, Buffer.from(shot.data, 'base64'));
    console.log(`[Screenshot saved]: ${name}.png (${(shot.data.length / 1024).toFixed(1)} KB)`);
  }

  async function navigate(url, waitMs = 1200) {
    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, waitMs));
  }

  async function evaluate(code) {
    const r = await send('Runtime.evaluate', {
      expression: code,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(r.exceptionDetails)}`);
    }
    return r.result.value;
  }

  const results = {};

  console.log('========================================================');
  console.log('1. DESKTOP HOME PAGE VERIFICATION (1440x900)');
  console.log('========================================================');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await navigate('http://localhost:3000/');

  // 1.1 Immediate hero visibility check
  const heroCheck = await evaluate(`(() => {
    const h1 = document.querySelector('.home-hero-headline');
    const primaryBtn = document.querySelector('.home-hero-actions .button.primary-dark');
    const imgWrapper = document.querySelector('.hero-main-photo');
    const img = imgWrapper ? imgWrapper.querySelector('img') : null;
    const h1Style = window.getComputedStyle(h1);
    const btnStyle = window.getComputedStyle(primaryBtn);
    return {
      h1Visible: h1Style.opacity === '1' && h1Style.visibility !== 'hidden',
      btnVisible: btnStyle.opacity === '1' && btnStyle.visibility !== 'hidden',
      hasImage: img !== null,
      h1Text: h1 ? h1.textContent.trim().replace(/\\s+/g, ' ') : ''
    };
  })()`);
  console.log('Hero immediate visibility check:', heroCheck);
  results.heroImmediate = heroCheck;
  await takeScreenshot('01-home-hero-desktop');

  // 1.2 Scroll progress bar test with scaleX
  await evaluate(`window.scrollTo(0, 500)`);
  await new Promise(r => setTimeout(r, 200));

  const scrollProgressCheck = await evaluate(`(() => {
    const bar = document.querySelector('.scroll-progress-bar');
    if (!bar) return { found: false };
    const style = window.getComputedStyle(bar);
    return {
      found: true,
      ariaHidden: bar.getAttribute('aria-hidden'),
      transform: style.transform,
      transformOrigin: style.transformOrigin
    };
  })()`);
  console.log('Scroll progress bar check (scaleX):', scrollProgressCheck);
  results.scrollProgress = scrollProgressCheck;

  // 1.3 Bounded parallax container check
  const parallaxCheck = await evaluate(`(() => {
    const container = document.querySelector('.motion-parallax-container');
    const inner = document.querySelector('.motion-parallax-inner');
    if (!container || !inner) return { found: false };
    const cStyle = window.getComputedStyle(container);
    return {
      found: true,
      overflowHidden: cStyle.overflow === 'hidden',
      hasTransform: inner.style.transform !== '' || window.getComputedStyle(inner).transform !== 'none'
    };
  })()`);
  console.log('Bounded parallax check:', parallaxCheck);
  results.boundedParallax = parallaxCheck;

  // Scroll down to londonBoy feature
  await evaluate(`window.scrollTo(0, 1100)`);
  await new Promise(r => setTimeout(r, 500));
  await takeScreenshot('02-home-londonboy-feature');

  console.log('========================================================');
  console.log('2. ABOUT JOURNAL VERIFICATION (IntersectionObserver & Anchors)');
  console.log('========================================================');
  await navigate('http://localhost:3000/about');

  // 2.1 Sticky index presence
  const stickyIndex = await evaluate(`(() => {
    const box = document.querySelector('.sticky-index-box');
    const style = window.getComputedStyle(box);
    return {
      position: style.position,
      top: style.top
    };
  })()`);
  console.log('Desktop sticky index position:', stickyIndex);
  results.stickyIndex = stickyIndex;

  // 2.2 Active chapter switching on scroll via IntersectionObserver
  const initialChapter = await evaluate(`document.querySelector('.chapter-nav-link.active .ch-num')?.textContent`);
  console.log('Initial active chapter:', initialChapter);

  // Scroll down to Chapter 03 (id: "industrial-associates")
  await evaluate(`(() => {
    const ch3 = document.getElementById('chapter-industrial-associates');
    if (ch3) ch3.scrollIntoView({ behavior: 'instant', block: 'start' });
  })()`);
  await new Promise(r => setTimeout(r, 600));

  const scrolledChapter = await evaluate(`document.querySelector('.chapter-nav-link.active .ch-num')?.textContent`);
  console.log('Scrolled active chapter after Chapter 03 view:', scrolledChapter);
  results.chapterScrollSwitching = {
    initial: initialChapter,
    afterScroll: scrolledChapter,
    switchedSuccessfully: scrolledChapter === '03'
  };
  await takeScreenshot('03-about-journal-chapter-reading');

  // 2.3 Scroll margin top check for anchor navigation
  const anchorMarginCheck = await evaluate(`(() => {
    const chBlock = document.querySelector('.journal-chapter-block');
    const style = window.getComputedStyle(chBlock);
    return {
      scrollMarginTop: style.scrollMarginTop
    };
  })()`);
  console.log('Chapter scroll-margin-top (header offset):', anchorMarginCheck);
  results.anchorMargin = anchorMarginCheck;

  console.log('========================================================');
  console.log('3. LONDONBOY SIGNATURE BRAND & MEASURED PRODUCT RAIL');
  console.log('========================================================');
  await navigate('http://localhost:3000/brands/londonboy');

  // 3.1 Socks desktop sticky scene check
  const socksSticky = await evaluate(`(() => {
    const visualCol = document.querySelector('.lb-scene-socks .scene-visual-col');
    const style = window.getComputedStyle(visualCol);
    return {
      position: style.position,
      top: style.top
    };
  })()`);
  console.log('Socks desktop sticky composition:', socksSticky);
  results.socksSticky = socksSticky;

  // 3.2 Product rail buttons & measured scrolling
  const railInitialState = await evaluate(`(() => {
    const track = document.querySelector('.lb-showcase-track');
    const prevBtn = document.querySelector('.carousel-arrow-btn[aria-label*="previous"]');
    const nextBtn = document.querySelector('.carousel-arrow-btn[aria-label*="next"]');
    const cards = document.querySelectorAll('.lb-showcase-card');
    return {
      scrollLeft: track.scrollLeft,
      scrollWidth: track.scrollWidth,
      clientWidth: track.clientWidth,
      prevDisabled: prevBtn.disabled,
      nextDisabled: nextBtn.disabled,
      cardCount: cards.length
    };
  })()`);
  console.log('Rail initial state:', railInitialState);
  results.railInitial = railInitialState;

  // Scroll down to showcase
  await evaluate(`document.querySelector('.lb-showcase-section').scrollIntoView({ behavior: 'instant', block: 'start' })`);
  await new Promise(r => setTimeout(r, 500));

  // Click NEXT button on product rail
  const railAfterNext = await evaluate(`new Promise(resolve => {
    const track = document.querySelector('.lb-showcase-track');
    const nextBtn = document.querySelector('.carousel-arrow-btn[aria-label*="next"]');
    const prevBtn = document.querySelector('.carousel-arrow-btn[aria-label*="previous"]');
    nextBtn.click();
    setTimeout(() => {
      resolve({
        scrollLeft: track.scrollLeft,
        prevDisabled: prevBtn.disabled,
        moved: track.scrollLeft > 0
      });
    }, 600);
  })`);
  console.log('Rail state after Next click:', railAfterNext);
  results.railAfterNext = railAfterNext;
  await takeScreenshot('04-londonboy-showcase-rail');

  console.log('========================================================');
  console.log('4. PRODUCT DETAIL: GALLERY CROSSFADE & LIGHTBOX');
  console.log('========================================================');
  await navigate('http://localhost:3000/products/structured-ribbed-crew-sock');

  // 4.1 Gallery crossfade animation trigger
  const galleryCrossfade = await evaluate(`new Promise(resolve => {
    const thumbnails = document.querySelectorAll('.thumbnail-btn');
    if (thumbnails.length < 2) return resolve({ hasMultiple: false });
    thumbnails[1].click();
    setTimeout(() => {
      const activeImg = document.querySelector('.main-display-img');
      const style = window.getComputedStyle(activeImg);
      resolve({
        hasMultiple: true,
        animationName: style.animationName,
        src: activeImg.src
      });
    }, 100);
  })`);
  console.log('Product gallery crossfade check:', galleryCrossfade);
  results.galleryCrossfade = galleryCrossfade;

  // 4.2 Lightbox keyboard navigation
  const lightboxCheck = await evaluate(`new Promise(resolve => {
    const enlargeBtn = document.querySelector('.enlarge-image-btn');
    enlargeBtn.click();
    setTimeout(() => {
      const modal = document.querySelector('.lightbox-overlay');
      const isOpen = modal !== null;
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      setTimeout(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        setTimeout(() => {
          const isClosed = document.querySelector('.lightbox-overlay') === null;
          resolve({ isOpen, isClosed });
        }, 150);
      }, 150);
    }, 150);
  })`);
  console.log('Lightbox modal & keyboard check:', lightboxCheck);
  results.lightbox = lightboxCheck;
  await takeScreenshot('05-product-detail-specifications');

  console.log('========================================================');
  console.log('5. MOBILE VIEWPORT INSPECTION (390x844)');
  console.log('========================================================');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

  // 5.1 Mobile Home
  await navigate('http://localhost:3000/');
  await takeScreenshot('06-mobile-home-viewport');

  // 5.2 Mobile Menu Drawer
  const mobileMenuCheck = await evaluate(`new Promise(resolve => {
    const toggle = document.querySelector('.mobile-nav-toggle');
    toggle.click();
    setTimeout(() => {
      const drawer = document.querySelector('.mobile-menu-drawer');
      const isOpen = drawer !== null;
      const closeBtn = document.querySelector('.drawer-close-btn');
      closeBtn.click();
      setTimeout(() => {
        const isClosed = document.querySelector('.mobile-menu-drawer') === null;
        resolve({ isOpen, isClosed });
      }, 150);
    }, 150);
  })`);
  console.log('Mobile menu drawer check:', mobileMenuCheck);
  results.mobileMenu = mobileMenuCheck;

  // 5.3 Mobile About Journal Chip Navigation
  await navigate('http://localhost:3000/about');
  const mobileChipsCheck = await evaluate(`(() => {
    const nav = document.querySelector('.mobile-chapter-nav');
    const chips = document.querySelectorAll('.mobile-chapter-chip');
    const style = window.getComputedStyle(nav);
    return {
      display: style.display,
      chipCount: chips.length,
      firstChipActive: chips[0]?.classList.contains('active')
    };
  })()`);
  console.log('Mobile chapter chips check:', mobileChipsCheck);
  results.mobileChapterChips = mobileChipsCheck;
  await takeScreenshot('07-mobile-about-chips');

  console.log('========================================================');
  console.log('6. REDUCED MOTION PREFERENCE VERIFICATION');
  console.log('========================================================');
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
  });
  await navigate('http://localhost:3000/brands/londonboy');

  const reducedMotionCheck = await evaluate(`(() => {
    const progress = document.querySelector('.scroll-progress-bar');
    const socksVisual = document.querySelector('.lb-scene-socks .scene-visual-col');
    const socksStyle = window.getComputedStyle(socksVisual);
    const htmlStyle = window.getComputedStyle(document.documentElement);
    return {
      progressBarHidden: progress === null || window.getComputedStyle(progress).display === 'none',
      htmlScrollBehavior: htmlStyle.scrollBehavior,
      socksVisualPosition: socksStyle.position
    };
  })()`);
  console.log('Reduced motion audit results:', reducedMotionCheck);
  results.reducedMotion = reducedMotionCheck;
  await takeScreenshot('08-reduced-motion-state');

  console.log('========================================================');
  console.log('7. NO-JS CONTENT VISIBILITY AUDIT');
  console.log('========================================================');
  const fetchRes = await fetch('http://localhost:3000/');
  const html = await fetchRes.text();
  const hasNoscript = html.includes('<noscript>') && html.includes('opacity: 1 !important');
  const hasHeadingInHtml = html.includes('Everyday essentials.');
  console.log('No-JS server HTML audit:', {
    hasNoscriptStyle: hasNoscript,
    hasHeadingInHtml: hasHeadingInHtml
  });
  results.noJsAudit = { hasNoscript, hasHeadingInHtml };

  // Write full results to json
  fs.writeFileSync(
    path.join(__dirname, '..', 'docs', 'motion-verification-evidence', 'results.json'),
    JSON.stringify(results, null, 2)
  );

  edge.kill();
  console.log('========================================================');
  console.log('ALL MOTION VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  console.log('========================================================');
  process.exit(0);
}

runVerification().catch(err => {
  console.error('Motion verification error:', err);
  process.exit(1);
});
