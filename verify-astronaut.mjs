import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function verify() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleErrors = [];
  const allRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('request', request => {
    allRequests.push({ url: request.url(), resourceType: request.resourceType() });
  });

  const astronautRequests = [];
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('astronaut')) {
      astronautRequests.push({
        url,
        status: response.status(),
        statusText: response.statusText(),
      });
    }
  });

  try {
    await page.goto('https://andyjohnsononline-cmyk.github.io/starkidgame/', {
      waitUntil: 'networkidle',
      timeout: 15000,
    });
    await page.waitForTimeout(2500);

    const screenshot = await page.screenshot({ path: 'screenshot-astronaut-verify.png' });
    writeFileSync('screenshot-astronaut-verify.png', screenshot);

    const hasCanvas = await page.locator('canvas').count() > 0;
    const imageRequests = allRequests.filter(r => r.resourceType === 'image');

    console.log('=== ASTRONAUT SPRITE VERIFICATION ===\n');
    console.log('1. GAME LOADED:', hasCanvas ? 'YES' : 'NO');
    console.log('\n2. ASTRONAUT.PNG REQUEST:');
    const astroReq = astronautRequests.find(r => r.url.includes('astronaut.png')) || imageRequests.find(r => r.url.includes('astronaut'));
    if (astroReq) {
      console.log('   URL:', astroReq.url);
      console.log('   Status:', astroReq.status, astroReq.statusText);
    } else {
      const astroAttempt = allRequests.find(r => r.url.includes('astronaut'));
      if (astroAttempt) {
        console.log('   Request attempted:', astroAttempt.url);
      }
      console.log('   (No astronaut.png response captured - may have 404\'d)');
    }
    console.log('\n3. ALL IMAGE REQUESTS:');
    imageRequests.forEach((r, i) => console.log('   [' + (i + 1) + ']', r.url));
    console.log('\n4. CONSOLE ERRORS:', consoleErrors.length);
    consoleErrors.forEach((e, i) => console.log('   [' + (i + 1) + ']', e));
    console.log('\n5. Screenshot saved: screenshot-astronaut-verify.png');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

verify();
