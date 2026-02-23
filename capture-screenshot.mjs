import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const url = 'http://localhost:5186/starkidgame/';
const outputPath = 'game-screenshot.png';

const browser = await chromium.launch();
const page = await browser.newPage();

// Set viewport to a reasonable game size
await page.setViewportSize({ width: 1280, height: 720 });

// Navigate to the game
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

// Wait for game to initialize (loading screen, etc.)
await page.waitForTimeout(4000);

// Take screenshot
await page.screenshot({ path: outputPath, fullPage: false });

await browser.close();

console.log(`Screenshot saved to ${outputPath}`);
