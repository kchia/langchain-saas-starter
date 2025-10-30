import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { chromium } = require('../app/node_modules/playwright');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const htmlFile = join(__dirname, 'generate-example-images.html');
const outputDir = join(__dirname, '..', 'app', 'public', 'examples');

async function generateExamples() {
  console.log('🎨 Generating example images...\n');

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1600 }
  });

  await page.goto(`file://${htmlFile}`);

  const examples = [
    { id: 0, filename: 'good-color-palette.png', name: 'Design System Tokens' },
    { id: 1, filename: 'good-button-variants.png', name: 'Button Variants' },
    { id: 2, filename: 'good-card-components.png', name: 'Card Components' },
    { id: 3, filename: 'good-form-inputs.png', name: 'Form Inputs' }
  ];

  for (const example of examples) {
    console.log(`📸 Generating ${example.name}...`);

    // Show the specific example
    await page.evaluate((index) => {
      window.showExample(index);
    }, example.id);

    // Wait a bit for rendering
    await page.waitForTimeout(500);

    // Take screenshot
    const outputPath = join(outputDir, example.filename);
    await page.screenshot({
      path: outputPath,
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: example.id === 0 ? 1600 : 1000 // Design tokens need more height
      }
    });

    console.log(`   ✓ Saved to ${example.filename}`);
  }

  await browser.close();
  console.log('\n✨ All examples generated successfully!');
}

generateExamples().catch(console.error);
