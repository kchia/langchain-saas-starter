#!/usr/bin/env node

/**
 * Screenshot HTML Component Templates
 *
 * This script uses Playwright to capture clean screenshots of component
 * variants from standalone HTML files. Produces production-quality images
 * suitable for the golden dataset evaluation framework.
 *
 * Usage:
 *   node backend/scripts/screenshot_html.js
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Configuration
const HTML_TEMPLATES_DIR = path.join(__dirname, 'html_templates');
const OUTPUT_DIR = path.resolve(__dirname, '../data/golden_dataset/screenshots');

const HTML_FILES = [
  {
    htmlFile: 'button_variants.html',
    outputFile: 'button_variants.png',
    viewport: { width: 1400, height: 1000 }
  },
  {
    htmlFile: 'card_variants.html',
    outputFile: 'card_variants.png',
    viewport: { width: 1600, height: 900 }
  },
  {
    htmlFile: 'badge_variants.html',
    outputFile: 'badge_variants.png',
    viewport: { width: 1200, height: 600 }
  },
  {
    htmlFile: 'input_variants.html',
    outputFile: 'input_variants.png',
    viewport: { width: 1600, height: 900 }
  },
  {
    htmlFile: 'alert_variants.html',
    outputFile: 'alert_variants.png',
    viewport: { width: 1200, height: 1200 }
  },
  {
    htmlFile: 'select_variants.html',
    outputFile: 'select_variants.png',
    viewport: { width: 1400, height: 700 }
  },
  {
    htmlFile: 'checkbox_variants.html',
    outputFile: 'checkbox_variants.png',
    viewport: { width: 1400, height: 700 }
  },
  {
    htmlFile: 'switch_variants.html',
    outputFile: 'switch_variants.png',
    viewport: { width: 1600, height: 700 }
  }
];

/**
 * Take screenshot of HTML file
 */
async function screenshotHTML(page, config) {
  const { htmlFile, outputFile, viewport } = config;

  try {
    console.log(`📸 ${htmlFile}...`);

    // Set viewport
    await page.setViewportSize(viewport);

    // Get file path and convert to file:// URL
    const htmlPath = path.join(HTML_TEMPLATES_DIR, htmlFile);
    const fileUrl = `file://${htmlPath}`;

    if (!fs.existsSync(htmlPath)) {
      console.error(`   ❌ HTML file not found: ${htmlPath}`);
      return false;
    }

    // Navigate to HTML file
    await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 10000 });

    // Wait for fonts and styles to load
    await page.waitForTimeout(1000);

    // Take full-page screenshot
    const outputPath = path.join(OUTPUT_DIR, outputFile);
    await page.screenshot({
      path: outputPath,
      fullPage: true,
      type: 'png'
    });

    // Get file size
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(1);

    console.log(`   ✅ Saved: ${outputFile} (${sizeKB} KB)`);
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
  console.log('🎨 HTML Component Screenshot Generator\n');
  console.log('=' .repeat(60));
  console.log(`Templates Directory: ${HTML_TEMPLATES_DIR}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  console.log(`Components: ${HTML_FILES.length}`);
  console.log('=' .repeat(60));
  console.log('');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`📁 Creating output directory: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Launch browser
  console.log('🚀 Launching Chromium browser...\n');
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    deviceScaleFactor: 2 // Retina display for high quality
  });

  const page = await context.newPage();

  // Screenshot each HTML file
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < HTML_FILES.length; i++) {
    const config = HTML_FILES[i];
    console.log(`[${i + 1}/${HTML_FILES.length}] ${config.htmlFile}`);

    const success = await screenshotHTML(page, config);
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
  console.log(`   Success: ${successCount}/${HTML_FILES.length}`);
  console.log(`   Failed: ${failCount}/${HTML_FILES.length}`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log('=' .repeat(60));
  console.log('');

  // List generated files
  console.log('Generated Screenshots:');
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.png'))
    .sort();

  files.forEach(file => {
    const stat = fs.statSync(path.join(OUTPUT_DIR, file));
    const sizeKB = (stat.size / 1024).toFixed(1);
    console.log(`   ✓ ${file} (${sizeKB} KB)`);
  });

  console.log('');
  console.log('Next steps:');
  console.log('1. Review screenshots in', OUTPUT_DIR);
  console.log('2. Update ground truth JSON files to match variant format');
  console.log('3. Run evaluation: python scripts/run_e2e_evaluation.py');
  console.log('');

  process.exit(failCount > 0 ? 1 : 0);
}

// Run main function
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
