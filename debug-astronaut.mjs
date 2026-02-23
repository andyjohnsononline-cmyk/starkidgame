/**
 * Debug script: Verify astronaut.png accessibility and game loading
 * 1. Screenshot astronaut.png directly
 * 2. Load game, capture network/console, screenshot player
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleMessages = [];
  const networkRequests = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleMessages.push({ type, text });
  });

  page.on('request', req => {
    networkRequests.push({
      url: req.url(),
      resourceType: req.resourceType(),
    });
  });

  const responses = [];
  page.on('response', async res => {
    const url = res.url();
    const status = res.status();
    if (url.includes('astronaut') || url.includes('astronaut.png')) {
      responses.push({
        url,
        status,
        statusText: res.statusText(),
        headers: res.headers(),
      });
    }
  });

  try {
    // Step 1: Navigate to astronaut.png directly
    console.log('=== STEP 1: Direct astronaut.png access ===');
    const astroRes = await page.goto('https://andyjohnsononline-cmyk.github.io/starkidgame/assets/astronaut.png', {
      waitUntil: 'load',
      timeout: 10000,
    });
    const astroStatus = astroRes?.status();
    console.log('Status:', astroStatus, astroRes?.statusText());
    console.log('Accessible:', astroStatus === 200 ? 'YES' : 'NO');

    const astroScreenshot = await page.screenshot({ path: 'debug-1-astronaut-png.png' });
    writeFileSync('debug-1-astronaut-png.png', astroScreenshot);
    console.log('Screenshot saved: debug-1-astronaut-png.png\n');

    // Step 2: Navigate to game
    console.log('=== STEP 2: Load game ===');
    await page.goto('https://andyjohnsononline-cmyk.github.io/starkidgame/', {
      waitUntil: 'networkidle',
      timeout: 15000,
    });
    await page.waitForTimeout(3000);

    const gameScreenshot = await page.screenshot({ path: 'debug-2-game-loaded.png' });
    writeFileSync('debug-2-game-loaded.png', gameScreenshot);
    console.log('Screenshot saved: debug-2-game-loaded.png');

    // Step 3: Zoom in on player area for detail (center of canvas)
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox().catch(() => null);
    if (box) {
      // Crop to center region (player is typically center)
      const clip = {
        x: box.x + box.width * 0.35,
        y: box.y + box.height * 0.25,
        width: box.width * 0.3,
        height: box.height * 0.5,
      };
      const playerScreenshot = await page.screenshot({
        path: 'debug-3-player-detail.png',
        clip,
      });
      writeFileSync('debug-3-player-detail.png', playerScreenshot);
      console.log('Screenshot saved: debug-3-player-detail.png');
    }

    // Report
    console.log('\n=== REPORT ===');
    console.log('\n1. ASTRONAUT.PNG DIRECT ACCESS:', astroStatus === 200 ? 'YES (200 OK)' : 'NO');
    console.log('\n2. NETWORK REQUESTS for astronaut:');
    const astroReqs = networkRequests.filter(r => r.url.includes('astronaut'));
    const astroResps = responses.filter(r => r.url.includes('astronaut'));
    if (astroReqs.length === 0) {
      console.log('   No requests captured (may have completed before listener attached)');
    }
    astroReqs.forEach((r, i) => console.log('   Request', i + 1, ':', r.url));
    astroResps.forEach((r, i) => {
      console.log('   Response', i + 1, ':', r.url);
      console.log('   Status:', r.status, r.statusText);
    });

    console.log('\n3. CONSOLE MESSAGES (errors and warnings):');
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    if (errors.length === 0) console.log('   Errors: (none)');
    else errors.forEach((e, i) => console.log('   Error', i + 1, ':', e.text));
    if (warnings.length > 0) {
      warnings.forEach((w, i) => console.log('   Warning', i + 1, ':', w.text));
    }

    console.log('\n4. ALL IMAGE REQUESTS:');
    const imgReqs = networkRequests.filter(r => r.resourceType === 'image');
    imgReqs.forEach((r, i) => console.log('   ', i + 1, r.url));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

debug();
