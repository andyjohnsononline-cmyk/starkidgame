import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function testDeployed() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });
  const page = await browser.newPage();

  const consoleLogs = [];
  const consoleErrors = [];
  const consoleWarnings = [];
  const failedRequests = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error') consoleErrors.push(text);
    else if (type === 'warning') consoleWarnings.push(text);
    else consoleLogs.push(`[${type}] ${text}`);
  });

  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText || 'unknown',
    });
  });

  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400) {
      failedRequests.push({
        url,
        status,
        statusText: response.statusText(),
      });
    }
  });

  try {
    await page.goto('https://andyjohnsononline-cmyk.github.io/starkidgame/', {
      waitUntil: 'networkidle',
      timeout: 15000,
    });

    await page.waitForTimeout(2000);

    const screenshot = await page.screenshot({ path: 'screenshot-deployed.png' });
    writeFileSync('screenshot-deployed.png', screenshot);

    const hasCanvas = await page.locator('canvas').count() > 0;
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const title = await page.title();

    console.log('=== DEPLOYED SITE TEST REPORT ===');
    console.log('');
    console.log('1. WHAT YOU SEE ON SCREEN:');
    console.log('   Title:', title);
    console.log('   Canvas present:', hasCanvas);
    console.log('   Body text (first 200 chars):', bodyText.substring(0, 200));
    console.log('');
    console.log('2. CONSOLE ERRORS (' + consoleErrors.length + '):');
    if (consoleErrors.length === 0) {
      console.log('   (none)');
    } else {
      consoleErrors.forEach((e, i) => console.log('   [' + (i + 1) + ']', e));
    }
    console.log('');
    console.log('3. CONSOLE WARNINGS (' + consoleWarnings.length + '):');
    if (consoleWarnings.length === 0) {
      console.log('   (none)');
    } else {
      consoleWarnings.forEach((w, i) => console.log('   [' + (i + 1) + ']', w));
    }
    console.log('');
    console.log('4. FAILED NETWORK REQUESTS (' + failedRequests.length + '):');
    if (failedRequests.length === 0) {
      console.log('   (none)');
    } else {
      failedRequests.forEach((r, i) => {
        if (r.status) {
          console.log('   [' + (i + 1) + ']', r.status, r.statusText, '-', r.url);
        } else {
          console.log('   [' + (i + 1) + ']', r.failure, '-', r.url);
        }
      });
    }
    console.log('');
    console.log('Screenshot saved: screenshot-deployed.png');
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
}

testDeployed();
