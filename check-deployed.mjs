import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function check() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    await page.goto('https://andyjohnsononline-cmyk.github.io/starkidgame/', {
      waitUntil: 'networkidle',
      timeout: 15000,
    });
    await page.waitForTimeout(2500);

    const screenshot = await page.screenshot({ path: 'screenshot-deployed-check.png' });
    writeFileSync('screenshot-deployed-check.png', screenshot);

    const hasCanvas = await page.locator('canvas').count() > 0;

    console.log('=== DEPLOYED SITE CHECK ===');
    console.log('1. Game loads:', hasCanvas ? 'YES (canvas present)' : 'NO');
    console.log('2. Console errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((e, i) => console.log('   [' + (i + 1) + ']', e));
    }
    console.log('3. Screenshot: screenshot-deployed-check.png');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

check();
