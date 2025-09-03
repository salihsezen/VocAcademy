const puppeteer = require('puppeteer');

(async () => {
  const url = process.env.URL || 'http://localhost:5500/';
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    logs.push(`[console.${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    logs.push(`[pageerror] ${err.message}\n${err.stack}`);
  });
  page.on('requestfailed', req => {
    logs.push(`[requestfailed] ${req.url()} ${req.failure()?.errorText}`);
  });

  try {
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    console.log('HTTP status:', resp.status());
    // wait for global storage to be ready
    await page.waitForFunction(() => window.storage !== null, { timeout: 10000 }).catch(()=>{});
    const content = await page.evaluate(() => document.body.innerText.slice(0, 200));
    console.log('Body preview:', content.replace(/\s+/g, ' ').trim());
  } catch (e) {
    console.error('Navigation error:', e.message);
  }

  console.log('--- Logs ---');
  for (const line of logs) console.log(line);

  // Check visibility of core sections
  const state = await page.evaluate(() => {
    function visible(id){ const el = document.getElementById(id); if (!el) return null; const style = window.getComputedStyle(el); return style.display !== 'none'; }
    return {
      nav: visible('nav-section'),
      gameModes: visible('game-modes-section'),
      game: visible('game-section'),
    };
  });
  console.log('State:', state);

  const counts = await page.evaluate(() => {
    try {
      const wordsLen = (window.storage && window.storage.getWords) ? window.storage.getWords().length : null;
      const tbody = document.getElementById('words-table-body');
      const tableCount = tbody ? tbody.querySelectorAll('tr').length : null;
      return { wordsLen, tableCount };
    } catch (e) { return { error: e.message }; }
  });
  console.log('Counts:', counts);

  await browser.close();
})();
