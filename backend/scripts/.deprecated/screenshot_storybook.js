#!/usr/bin/env node

/**
 * Screenshot Storybook Components for Golden Dataset
 *
 * This script uses Playwright to capture screenshots of components
 * from Storybook stories, producing realistic UI images for the
 * golden dataset evaluation framework.
 *
 * Usage:
 *   1. Start Storybook: cd app && npm run storybook
 *   2. Run this script: node backend/scripts/screenshot_storybook.js
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Load configuration
const CONFIG_PATH = path.join(__dirname, 'storybook_config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const STORYBOOK_URL = config.storybookUrl;
const OUTPUT_DIR = path.resolve(__dirname, config.outputDir);

/**
 * Check if Storybook is running
 */
async function checkStorybookRunning() {
  return new Promise((resolve) => {
    const url = new URL(STORYBOOK_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: '/',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Wait for Storybook to be ready
 */
async function waitForStorybook(maxAttempts = 30) {
  console.log(`⏳ Waiting for Storybook at ${STORYBOOK_URL}...`);

  for (let i = 0; i < maxAttempts; i++) {
    if (await checkStorybookRunning()) {
      console.log('✅ Storybook is ready!\n');
      return true;
    }

    process.stdout.write(`   Attempt ${i + 1}/${maxAttempts}...\r`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return false;
}

/**
 * Take screenshot of a component
 */
async function screenshotComponent(page, component) {
  const { id, name, storybookPath, outputFile, viewport, selector, waitFor } = component;

  try {
    console.log(`📸 ${name}...`);

    // Set viewport
    await page.setViewportSize(viewport);

    // Navigate to story
    const url = `${STORYBOOK_URL}${storybookPath}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for component to render
    await page.waitForTimeout(waitFor);

    // Wait for the selector to be visible
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
    } catch (e) {
      console.warn(`   ⚠️  Selector "${selector}" not found, using full page`);
    }

    // Take screenshot
    // Try to screenshot the specific element, fall back to full page
    let screenshotOptions = {
      path: path.join(OUTPUT_DIR, outputFile),
      type: 'png'
    };

    try {
      const element = await page.$(selector);
      if (element) {
        // Screenshot just the component
        await element.screenshot(screenshotOptions);
      } else {
        // Screenshot the story root
        const storyRoot = await page.$('#storybook-root, #root');
        if (storyRoot) {
          await storyRoot.screenshot(screenshotOptions);
        } else {
          await page.screenshot(screenshotOptions);
        }
      }
    } catch (e) {
      console.warn(`   ⚠️  Element screenshot failed, using full page`);
      await page.screenshot(screenshotOptions);
    }

    console.log(`   ✅ Saved: ${outputFile}`);
    return true;

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 Storybook Component Screenshot Generator\n');
  console.log('=' .repeat(60));
  console.log(`Storybook URL: ${STORYBOOK_URL}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  console.log(`Components: ${config.components.length}`);
  console.log('=' .repeat(60));
  console.log('');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`📁 Creating output directory: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check if Storybook is running
  const isRunning = await waitForStorybook();

  if (!isRunning) {
    console.error('\n❌ ERROR: Storybook is not running!');
    console.error('\nPlease start Storybook first:');
    console.error('   cd app');
    console.error('   npm run storybook');
    console.error('\nThen run this script again.');
    process.exit(1);
  }

  // Launch browser
  console.log('🚀 Launching Chromium browser...\n');
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    deviceScaleFactor: 2 // Retina display
  });

  const page = await context.newPage();

  // Screenshot each component
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < config.components.length; i++) {
    const component = config.components[i];
    console.log(`[${i + 1}/${config.components.length}] ${component.name}`);

    const success = await screenshotComponent(page, component);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    console.log('');
  }

  // Cleanup
  await browser.close();

  // Summary
  console.log('=' .repeat(60));
  console.log('✅ Screenshot Generation Complete!');
  console.log(`   Success: ${successCount}/${config.components.length}`);
  console.log(`   Failed: ${failCount}/${config.components.length}`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log('=' .repeat(60));
  console.log('');

  // List generated files
  console.log('Generated Screenshots:');
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.png'))
    .filter(f => {
      const stat = fs.statSync(path.join(OUTPUT_DIR, f));
      return stat.size > 0;
    });

  files.forEach(file => {
    const stat = fs.statSync(path.join(OUTPUT_DIR, file));
    const sizeKB = (stat.size / 1024).toFixed(1);
    console.log(`   ✓ ${file} (${sizeKB} KB)`);
  });

  console.log('');
  console.log('Next steps:');
  console.log('1. Review screenshots in', OUTPUT_DIR);
  console.log('2. Verify ground truth JSON files match');
  console.log('3. Run evaluation: python scripts/run_e2e_evaluation.py');
  console.log('');

  process.exit(failCount > 0 ? 1 : 0);
}

// Run main function
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
