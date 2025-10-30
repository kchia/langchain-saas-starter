# Epic 7: Developer Experience & Documentation

**Status**: Not Started
**Priority**: Medium
**Epic Owner**: Frontend/DevRel Team
**Estimated Tasks**: 8
**Depends On**: Epic 4 (Code Generation), Epic 5 (Quality Validation)

---

## Overview

Build excellent developer experience with comprehensive API documentation, CLI tool for automation, component preview system, local development mode with mocks, step-by-step tutorials, API client SDK, troubleshooting guides, and video walkthroughs.

---

## Goals

1. Create comprehensive API documentation with OpenAPI/Swagger
2. Build CLI tool for automation and CI/CD integration
3. Implement component preview system in browser
4. Support local development mode with API mocks
5. Write step-by-step tutorials and guides
6. Generate API client SDK for TypeScript/Python
7. Create troubleshooting guides and FAQs
8. Produce video walkthroughs for common workflows

---

## Success Criteria

- ✅ OpenAPI spec covers all endpoints with examples
- ✅ Interactive Swagger UI available at `/docs`
- ✅ CLI supports all major workflows (generate, validate, export)
- ✅ Component preview works in browser with hot reload
- ✅ Local dev mode runs without external API dependencies
- ✅ Tutorials cover beginner to advanced use cases
- ✅ API clients generated and published (npm, PyPI)
- ✅ Troubleshooting guide resolves 90% of common issues
- ✅ Video walkthroughs available for key features
- ✅ Documentation site deployed and searchable

---

## Wireframe

### Interactive Prototype
**View HTML:** [dashboard-page.html](../wireframes/dashboard-page.html)

![Dashboard Page - Developer Experience](../wireframes/screenshots/05-dashboard-desktop.png)

### Key UI Elements (Developer Experience Focus)

**Quick Actions** (Top section)
- "Generate New Component" → CLI or Web UI entry point
- "View Documentation" → Task 1: OpenAPI/Swagger Documentation
- "Download CLI" → Task 2: CLI Tool Development
- "Browse Components" → Component library
- "Run Tutorial" → Task 5: Tutorials & Guides

**Recent Components** (Card grid)
- Component thumbnails with preview
- Click to open Component Preview → Task 3: Component Preview System
- Component metadata (type, created date, status)
- Quick actions: Download, Regenerate, Share

**CLI Integration Status** → Task 2: CLI Tool Development
- CLI version: 1.0.0
- Installation command: `npm install -g componentforge`
- Configuration status: ✓ Configured
- Recent CLI commands:
  - `componentforge generate <url>` (success)
  - `componentforge validate <file>` (success)
  - `componentforge list` (success)
- CLI usage stats: 45 commands this week

**API Access** → Task 1: OpenAPI/Swagger Documentation
- Swagger UI link: `/docs`
- ReDoc link: `/redoc`
- OpenAPI spec download (JSON/YAML)
- API key management
- Rate limit status: 234 / 1000 requests today

**SDK Downloads** → Task 6: API Client SDK
- TypeScript SDK: `npm install @componentforge/sdk`
- Python SDK: `pip install componentforge-sdk`
- Usage examples:
  ```typescript
  const client = new ComponentForgeClient({...});
  const result = await client.generateComponent({...});
  ```

**Documentation Center** → Task 5: Tutorials & Guides, Task 7: Troubleshooting
- Getting Started (5 min tutorial)
- Custom Tokens & Requirements
- CI/CD Integration
- Troubleshooting Guide
- API Reference
- Best Practices
- Video Walkthroughs → Task 8: Video Walkthroughs

**Local Development Mode** → Task 4: Local Development Mode
- Status: Active (DEV_MODE=local)
- Mock API enabled ✓
- Local pattern library: 10 components
- Response time: <100ms
- No external API calls required
- Toggle: Switch to production mode

**Component Preview Features** → Task 3: Component Preview System
- Interactive preview with prop controls
- Hot reload status: Active ✓
- Viewport controls (mobile, tablet, desktop)
- Dark/light mode toggle
- Accessibility info panel
- Share preview URL
- Copy code snippet

**Documentation Search**
- Search bar for docs, tutorials, troubleshooting
- Popular searches:
  - "Figma authentication"
  - "Token customization"
  - "CI/CD setup"
  - "Error codes"

**Troubleshooting Quick Links** → Task 7: Troubleshooting Guides
- Common Issues (90% resolution rate target)
  - "Figma authentication failed" → Solution steps
  - "Generation timeout" → Performance tips
  - "Token extraction failed" → Retry options
- Error codes reference
- Support contact: Discord, Email

**Video Tutorials** → Task 8: Video Walkthroughs
- Getting Started (5 min) [▶ Play]
- Figma Integration (3 min) [▶ Play]
- Token Customization (4 min) [▶ Play]
- CI/CD Integration (6 min) [▶ Play]
- Advanced Features (8 min) [▶ Play]
- All videos with closed captions
- Interactive demos embedded

**Developer Resources**
- GitHub repository link
- Discord community
- Changelog & release notes
- Contributing guide
- Example projects

**System Status**
- API status: Operational ✓
- Documentation site: Online ✓
- CLI update available: No
- Support: Available 24/7

### User Flow (Developer Onboarding)
1. New user visits dashboard
2. Clicks "Getting Started" tutorial
3. Watches 5-minute video walkthrough
4. Installs CLI: `npm install -g componentforge`
5. Runs first command: `componentforge generate <url>`
6. Views component in preview system
7. Reads API documentation at `/docs`
8. Installs SDK for programmatic access
9. Explores troubleshooting guide for issues
10. Joins Discord community for support

**DX Metrics Display:**
- CLI adoption: 50% of users
- Tutorial completion: 80%
- Documentation coverage: 100% endpoints
- Support tickets: <10% of users

**Quick Actions Flow:**
- "Generate New" → Opens generation wizard
- "View Docs" → `/docs` Swagger UI
- "Download CLI" → Installation instructions
- "Browse Components" → Component library
- "Run Tutorial" → Interactive tutorial picker

**Quick Test:**
```bash
# View wireframe locally
open .claude/wireframes/dashboard-page.html
```

---

## Tasks

### Task 1: OpenAPI/Swagger Documentation
**Acceptance Criteria**:
- [ ] Generate OpenAPI 3.0 specification from FastAPI
- [ ] Document all endpoints with:
  - Description and purpose
  - Request/response schemas
  - Example requests and responses
  - Error responses with codes
  - Authentication requirements
- [ ] Interactive Swagger UI at `http://localhost:8000/docs`
- [ ] ReDoc alternative UI at `http://localhost:8000/redoc`
- [ ] Export OpenAPI spec as JSON/YAML
- [ ] Include rate limiting information
- [ ] Add code examples in multiple languages
- [ ] Tag endpoints by feature (tokens, retrieval, generation)

**Files**:
- `backend/src/main.py` (FastAPI OpenAPI config)
- `backend/docs/openapi.json`
- `backend/docs/openapi.yaml`

**OpenAPI Configuration**:
```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="ComponentForge API",
    description="AI-powered design-to-code pipeline for React components",
    version="1.0.0",
    terms_of_service="https://componentforge.ai/terms",
    contact={
        "name": "ComponentForge Support",
        "email": "support@componentforge.ai",
        "url": "https://componentforge.ai/support"
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
    }
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="ComponentForge API",
        version="1.0.0",
        description="Generate production-ready React components from designs",
        routes=app.routes,
    )

    # Add custom examples
    openapi_schema["paths"]["/api/v1/generate"]["post"]["requestBody"]["content"]["application/json"]["examples"] = {
        "button": {
            "summary": "Generate Button component",
            "value": {
                "figma_url": "https://figma.com/file/abc123",
                "component_type": "Button",
                "tokens": {
                    "colors": {"primary": "#3B82F6"}
                }
            }
        }
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Example endpoint documentation
@app.post(
    "/api/v1/generate",
    summary="Generate component from design",
    description="Generates a production-ready React component from Figma design or screenshot",
    response_description="Generated component code and artifacts",
    tags=["generation"],
    responses={
        200: {
            "description": "Component generated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "component_id": "comp-123",
                        "code": "/* Component code */",
                        "status": "success"
                    }
                }
            }
        },
        400: {
            "description": "Invalid request",
            "content": {
                "application/json": {
                    "example": {
                        "error": "invalid_input",
                        "message": "Figma URL is required"
                    }
                }
            }
        },
        429: {
            "description": "Rate limit exceeded"
        }
    }
)
async def generate_component(request: GenerateRequest):
    pass
```

**Tests**:
- OpenAPI spec validates against schema
- Swagger UI loads correctly
- All endpoints documented
- Examples are accurate

---

### Task 2: CLI Tool Development
**Acceptance Criteria**:
- [ ] Build CLI tool `componentforge` with commands:
  - `componentforge generate <figma-url>` - Generate component
  - `componentforge validate <file>` - Validate existing component
  - `componentforge export <component-id>` - Export component files
  - `componentforge list` - List generated components
  - `componentforge regenerate <component-id>` - Regenerate component
  - `componentforge config` - Manage configuration
- [ ] Support flags:
  - `--output <dir>` - Output directory
  - `--tokens <file>` - Custom tokens file
  - `--requirements <file>` - Custom requirements
  - `--format <json|tsx>` - Output format
  - `--watch` - Watch for changes
- [ ] Configuration file support (`componentforge.config.json`)
- [ ] Interactive prompts for missing parameters
- [ ] Progress indicators for long operations
- [ ] Color-coded output (success, error, warning)
- [ ] Verbose mode for debugging (`-v`, `--verbose`)
- [ ] Install via npm: `npm install -g componentforge`

**Files**:
- `cli/package.json`
- `cli/src/index.ts`
- `cli/src/commands/generate.ts`
- `cli/src/commands/validate.ts`
- `cli/src/commands/export.ts`

**CLI Implementation**:
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { generateComponent } from './commands/generate';

const program = new Command();

program
  .name('componentforge')
  .description('Generate production-ready React components from designs')
  .version('1.0.0');

program
  .command('generate <figma-url>')
  .description('Generate component from Figma URL')
  .option('-o, --output <dir>', 'Output directory', './components')
  .option('-t, --tokens <file>', 'Custom tokens file')
  .option('-r, --requirements <file>', 'Custom requirements file')
  .option('-w, --watch', 'Watch for changes')
  .option('-v, --verbose', 'Verbose output')
  .action(async (figmaUrl, options) => {
    const spinner = ora('Generating component...').start();

    try {
      const result = await generateComponent(figmaUrl, options);
      spinner.succeed(chalk.green('Component generated successfully!'));
      console.log(chalk.blue(`Output: ${result.outputPath}`));
      console.log(chalk.gray(`Component ID: ${result.componentId}`));
    } catch (error) {
      spinner.fail(chalk.red('Generation failed'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('validate <file>')
  .description('Validate component quality')
  .option('-f, --fix', 'Auto-fix issues')
  .action(async (file, options) => {
    const spinner = ora('Validating component...').start();

    try {
      const result = await validateComponent(file, options);

      if (result.valid) {
        spinner.succeed(chalk.green('Component is valid!'));
      } else {
        spinner.warn(chalk.yellow(`Found ${result.issues.length} issues`));
        result.issues.forEach(issue => {
          console.log(chalk.red(`  - ${issue.message}`));
        });
      }
    } catch (error) {
      spinner.fail(chalk.red('Validation failed'));
      console.error(error.message);
      process.exit(1);
    }
  });

program.parse();
```

**Configuration File**:
```json
{
  "api": {
    "url": "http://localhost:8000",
    "key": "your-api-key"
  },
  "output": {
    "directory": "./components",
    "format": "tsx"
  },
  "figma": {
    "token": "your-figma-token"
  },
  "defaults": {
    "tokens": "./design-tokens.json",
    "requirements": "./requirements.json"
  }
}
```

**Tests**:
- CLI installs successfully
- All commands work correctly
- Configuration file loads
- Progress indicators display
- Error messages are clear

---

### Task 3: Component Preview System
**Acceptance Criteria**:
- [ ] Build web-based component preview
- [ ] Render generated components in iframe sandbox
- [ ] Support hot reload on code changes
- [ ] Interactive prop controls (adjust variant, size, etc.)
- [ ] State controls (hover, focus, disabled)
- [ ] Viewport size controls (mobile, tablet, desktop)
- [ ] Dark/light mode toggle
- [ ] Copy code snippet button
- [ ] Accessibility info panel (axe results)
- [ ] Share preview via URL
- [ ] Embed preview in documentation

**Files**:
- `app/src/app/preview/[id]/page.tsx`
- `app/src/components/preview/PreviewFrame.tsx`
- `app/src/components/preview/PropControls.tsx`

**Preview Component**:
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

interface PreviewProps {
  componentId: string;
  code: string;
  props: Record<string, any>;
}

export function ComponentPreview({ componentId, code, props }: PreviewProps) {
  const [selectedVariant, setSelectedVariant] = useState('primary');
  const [selectedSize, setSelectedSize] = useState('md');
  const [isDisabled, setIsDisabled] = useState(false);
  const [viewportSize, setViewportSize] = useState('desktop');

  return (
    <div className="flex h-screen">
      {/* Controls Panel */}
      <div className="w-64 border-r p-4 space-y-4">
        <div>
          <label className="text-sm font-medium">Variant</label>
          <Select
            value={selectedVariant}
            onChange={setSelectedVariant}
            options={props.variants}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Size</label>
          <Select
            value={selectedSize}
            onChange={setSelectedSize}
            options={props.sizes}
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isDisabled}
              onChange={(e) => setIsDisabled(e.target.checked)}
            />
            <span className="text-sm">Disabled</span>
          </label>
        </div>

        <div>
          <label className="text-sm font-medium">Viewport</label>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant={viewportSize === 'mobile' ? 'primary' : 'secondary'}
              onClick={() => setViewportSize('mobile')}
            >
              Mobile
            </Button>
            <Button
              size="sm"
              variant={viewportSize === 'desktop' ? 'primary' : 'secondary'}
              onClick={() => setViewportSize('desktop')}
            >
              Desktop
            </Button>
          </div>
        </div>

        <Button
          onClick={() => navigator.clipboard.writeText(code)}
          variant="outline"
          className="w-full"
        >
          Copy Code
        </Button>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 p-8 bg-gray-50">
        <div
          className={`mx-auto bg-white rounded-lg shadow-lg p-8 ${
            viewportSize === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
          }`}
        >
          <PreviewFrame
            code={code}
            props={{
              variant: selectedVariant,
              size: selectedSize,
              disabled: isDisabled
            }}
          />
        </div>
      </div>

      {/* Info Panel */}
      <div className="w-64 border-l p-4">
        <h3 className="font-semibold mb-4">Accessibility</h3>
        <AccessibilityInfo componentId={componentId} />
      </div>
    </div>
  );
}
```

**Tests**:
- Preview renders components correctly
- Prop controls update preview
- Hot reload works
- Clipboard copy functional
- Accessibility info displays

---

### Task 4: Local Development Mode
**Acceptance Criteria**:
- [ ] Support offline development with mocked APIs
- [ ] Mock responses for all endpoints:
  - Token extraction → Returns sample tokens
  - Pattern retrieval → Returns mock patterns
  - Code generation → Returns sample component
- [ ] Seed database with sample data
- [ ] Local pattern library (10+ components)
- [ ] Fast response times (<100ms)
- [ ] No external API calls required
- [ ] Environment variable: `DEV_MODE=local`
- [ ] Documentation for local setup

**Files**:
- `backend/src/mocks/api_mocks.py`
- `backend/src/mocks/sample_data.json`

**Mock Implementation**:
```python
from fastapi import FastAPI
from typing import Dict, Any
import json

class MockAPIServer:
    def __init__(self, app: FastAPI):
        self.app = app
        self.sample_data = self._load_sample_data()

    def _load_sample_data(self) -> Dict[str, Any]:
        """Load sample data for mocking."""
        with open('src/mocks/sample_data.json') as f:
            return json.load(f)

    def enable_mocks(self):
        """Enable mock mode for all endpoints."""

        @self.app.post("/api/v1/tokens/extract")
        async def mock_extract_tokens(request):
            return {
                "tokens": self.sample_data["tokens"]["button"],
                "confidence": 0.95,
                "method": "mock"
            }

        @self.app.post("/api/v1/requirements/propose")
        async def mock_propose_requirements(request):
            return {
                "requirements": self.sample_data["requirements"]["button"],
                "confidence": 0.92
            }

        @self.app.post("/api/v1/patterns/retrieve")
        async def mock_retrieve_patterns(request):
            return {
                "patterns": self.sample_data["patterns"][:3],
                "scores": [0.95, 0.88, 0.82]
            }

        @self.app.post("/api/v1/generate")
        async def mock_generate_component(request):
            return {
                "component_id": "mock-123",
                "code": self.sample_data["generated_code"]["button"],
                "status": "success",
                "latency": 0.05,
                "cache_layer": "mock"
            }

# Enable in main.py
if os.getenv("DEV_MODE") == "local":
    mock_server = MockAPIServer(app)
    mock_server.enable_mocks()
```

**Sample Data**:
```json
{
  "tokens": {
    "button": {
      "colors": {
        "primary": "#3B82F6",
        "background": "#FFFFFF"
      },
      "typography": {
        "fontSize": "16px",
        "fontWeight": 500
      }
    }
  },
  "requirements": {
    "button": [
      {
        "category": "props",
        "name": "variant",
        "values": ["primary", "secondary", "ghost"]
      }
    ]
  },
  "patterns": [
    {
      "id": "pattern-button-001",
      "name": "Button",
      "code": "/* Button code */"
    }
  ],
  "generated_code": {
    "button": "/* Generated Button component */"
  }
}
```

**Tests**:
- Mock mode activates correctly
- All endpoints return sample data
- No external API calls made
- Response times fast (<100ms)

---

### Task 5: Tutorials & Guides
**Acceptance Criteria**:
- [ ] Write beginner tutorial: "Your First Component"
- [ ] Write intermediate tutorial: "Custom Tokens & Requirements"
- [ ] Write advanced tutorial: "Batch Generation & CI/CD"
- [ ] Create quick start guide (5 minutes to first component)
- [ ] Write integration guides:
  - Next.js integration
  - Storybook integration
  - Design system integration
- [ ] Create best practices guide
- [ ] Write migration guide (from manual to automated)
- [ ] Include code examples for each tutorial
- [ ] Add screenshots and diagrams
- [ ] Publish to documentation site

**Files**:
- `docs/tutorials/01-getting-started.md`
- `docs/tutorials/02-custom-tokens.md`
- `docs/tutorials/03-cicd-integration.md`
- `docs/guides/quick-start.md`
- `docs/guides/best-practices.md`

**Tutorial Example** (`01-getting-started.md`):
```markdown
# Your First Component

Learn how to generate your first React component in under 5 minutes.

## Prerequisites

- Node.js 18+ installed
- ComponentForge CLI installed: `npm install -g componentforge`
- Figma account with a design file

## Step 1: Install ComponentForge

```bash
npm install -g componentforge
```

## Step 2: Configure Figma Token

```bash
componentforge config --figma-token YOUR_TOKEN
```

## Step 3: Generate Component

```bash
componentforge generate https://figma.com/file/abc123 \
  --output ./components
```

## Step 4: Preview Component

```bash
cd components
npm install
npm run dev
```

Open http://localhost:3000/preview to see your component!

## Next Steps

- [Customize design tokens](./02-custom-tokens.md)
- [Add custom requirements](./02-custom-tokens.md#requirements)
- [Integrate with your app](../guides/integration.md)
```

**Tests**:
- Tutorials have no broken links
- Code examples run successfully
- Screenshots up to date
- Documentation builds correctly

---

### Task 6: API Client SDK
**Acceptance Criteria**:
- [ ] Generate TypeScript SDK from OpenAPI spec
- [ ] Generate Python SDK from OpenAPI spec
- [ ] SDKs support all endpoints
- [ ] Type-safe request/response objects
- [ ] Automatic retry logic
- [ ] Error handling with custom exceptions
- [ ] Configuration management
- [ ] Publish to npm as `@componentforge/sdk`
- [ ] Publish to PyPI as `componentforge-sdk`
- [ ] Include usage examples in README

**Files**:
- `sdks/typescript/package.json`
- `sdks/typescript/src/client.ts`
- `sdks/python/setup.py`
- `sdks/python/componentforge/client.py`

**TypeScript SDK**:
```typescript
import axios, { AxiosInstance } from 'axios';

export interface ComponentForgeConfig {
  apiUrl: string;
  apiKey?: string;
  figmaToken?: string;
}

export class ComponentForgeClient {
  private client: AxiosInstance;

  constructor(config: ComponentForgeConfig) {
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Authorization': config.apiKey ? `Bearer ${config.apiKey}` : undefined,
        'Content-Type': 'application/json'
      }
    });
  }

  async generateComponent(params: GenerateComponentParams): Promise<GeneratedComponent> {
    const response = await this.client.post('/api/v1/generate', params);
    return response.data;
  }

  async extractTokens(params: ExtractTokensParams): Promise<DesignTokens> {
    const response = await this.client.post('/api/v1/tokens/extract', params);
    return response.data;
  }

  async proposeRequirements(params: ProposeRequirementsParams): Promise<Requirements> {
    const response = await this.client.post('/api/v1/requirements/propose', params);
    return response.data;
  }

  async validateComponent(params: ValidateComponentParams): Promise<ValidationResult> {
    const response = await this.client.post('/api/v1/validate', params);
    return response.data;
  }
}

// Usage
const client = new ComponentForgeClient({
  apiUrl: 'http://localhost:8000',
  apiKey: 'your-api-key'
});

const result = await client.generateComponent({
  figmaUrl: 'https://figma.com/file/abc123',
  componentType: 'Button'
});

console.log(result.code);
```

**Python SDK**:
```python
from typing import Dict, Any
import requests

class ComponentForgeClient:
    def __init__(self, api_url: str, api_key: str = None):
        self.api_url = api_url
        self.api_key = api_key
        self.session = requests.Session()

        if api_key:
            self.session.headers['Authorization'] = f'Bearer {api_key}'

    def generate_component(self, figma_url: str,
                          component_type: str,
                          **kwargs) -> Dict[str, Any]:
        """Generate component from Figma URL."""
        response = self.session.post(
            f'{self.api_url}/api/v1/generate',
            json={
                'figma_url': figma_url,
                'component_type': component_type,
                **kwargs
            }
        )
        response.raise_for_status()
        return response.json()

    def extract_tokens(self, figma_url: str = None,
                      screenshot: bytes = None) -> Dict[str, Any]:
        """Extract design tokens."""
        if screenshot:
            files = {'file': screenshot}
            response = self.session.post(
                f'{self.api_url}/api/v1/tokens/extract/screenshot',
                files=files
            )
        else:
            response = self.session.post(
                f'{self.api_url}/api/v1/tokens/extract/figma',
                json={'figma_url': figma_url}
            )

        response.raise_for_status()
        return response.json()

# Usage
client = ComponentForgeClient(
    api_url='http://localhost:8000',
    api_key='your-api-key'
)

result = client.generate_component(
    figma_url='https://figma.com/file/abc123',
    component_type='Button'
)

print(result['code'])
```

**Tests**:
- SDKs compile/build successfully
- All methods work correctly
- Error handling functional
- Published packages install

---

### Task 7: Troubleshooting Guides
**Acceptance Criteria**:
- [ ] Create troubleshooting guide covering:
  - Installation issues
  - API connection errors
  - Figma authentication failures
  - Token extraction problems
  - Generation failures
  - Validation errors
  - Performance issues
- [ ] Organize by error type and severity
- [ ] Include error codes and messages
- [ ] Provide step-by-step solutions
- [ ] Add "Common Issues" section with quick fixes
- [ ] Link to relevant API documentation
- [ ] Include support contact information

**Files**:
- `docs/troubleshooting.md`
- `docs/error-codes.md`

**Troubleshooting Guide Structure**:
```markdown
# Troubleshooting Guide

## Common Issues

### "Figma authentication failed"

**Cause**: Invalid or expired Figma Personal Access Token

**Solution**:
1. Generate new PAT at https://figma.com/settings
2. Update configuration:
   ```bash
   componentforge config --figma-token YOUR_NEW_TOKEN
   ```
3. Retry generation

### "Component generation failed: timeout"

**Cause**: Generation taking longer than 120s timeout

**Solutions**:
1. Simplify component design (reduce variants)
2. Check network connection
3. Try again during off-peak hours
4. Contact support if issue persists

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| E1001 | Invalid Figma URL | Check URL format: https://figma.com/file/... |
| E1002 | Token extraction failed | Retry with screenshot instead |
| E1003 | No patterns found | Check component type is supported |

## Performance Issues

### Slow generation (>60s)

- Check cache hit rate: `componentforge status`
- Clear cache: `componentforge cache clear`
- Use local dev mode: `DEV_MODE=local`

## Getting Help

- Documentation: https://docs.componentforge.ai
- Discord: https://discord.gg/componentforge
- Email: support@componentforge.ai
```

**Tests**:
- All solutions tested and verified
- Links work correctly
- Error codes match implementation

---

### Task 8: Video Walkthroughs
**Acceptance Criteria**:
- [ ] Create video tutorials:
  - Getting started (5 min)
  - Figma integration (3 min)
  - Token customization (4 min)
  - CI/CD integration (6 min)
  - Advanced features (8 min)
- [ ] Professional narration and editing
- [ ] Closed captions included
- [ ] Publish to YouTube and embed in docs
- [ ] Create GIF animations for key workflows
- [ ] Add interactive demos on website

**Videos**:
- `videos/01-getting-started.mp4`
- `videos/02-figma-integration.mp4`
- `videos/03-token-customization.mp4`
- `videos/04-cicd-integration.mp4`
- `videos/05-advanced-features.mp4`

**Video Script Example**:
```
Title: Getting Started with ComponentForge (5 min)

[00:00 - 00:30] Introduction
- What is ComponentForge
- Benefits: Save time, ensure accessibility, stay in sync

[00:30 - 01:30] Installation
- Install CLI: npm install -g componentforge
- Configure Figma token
- Verify installation

[01:30 - 03:30] First Generation
- Open Figma design
- Copy URL
- Run generate command
- Watch progress
- View output

[03:30 - 04:30] Preview Component
- Import in Next.js app
- View in Storybook
- Check accessibility report

[04:30 - 05:00] Next Steps
- Customize tokens
- Add requirements
- CI/CD integration
```

**Tests**:
- Videos play correctly
- Captions accurate
- Embedded properly in docs
- GIFs load quickly

---

## Dependencies

**Requires**:
- Epic 4: Code generation for demos
- Epic 5: Validation for examples

**Blocks**:
- User adoption (good DX required)

---

## Technical Architecture

### Documentation Stack

```
OpenAPI Spec
     ↓
Swagger UI (Interactive Docs)
     ↓
SDK Generation (TypeScript/Python)
     ↓
Tutorials & Guides
     ↓
Video Walkthroughs
```

---

## Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Documentation Coverage** | 100% endpoints | OpenAPI spec completeness |
| **CLI Adoption** | 50% of users | npm download stats |
| **Tutorial Completion** | 80% | Analytics tracking |
| **Support Tickets** | <10% of users | Support system |

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Documentation becomes outdated | High | Automated checks, version docs with code |
| CLI bugs affect many users | High | Thorough testing, gradual rollout |
| Videos outdated after UI changes | Medium | Mark video version, update quarterly |
| Tutorials too complex | Medium | User testing, iterative improvement |

---

## Definition of Done

- [ ] All 8 tasks completed with acceptance criteria met
- [ ] OpenAPI documentation complete
- [ ] CLI published to npm
- [ ] Component preview system functional
- [ ] Local dev mode working
- [ ] Tutorials written and published
- [ ] API clients published (npm, PyPI)
- [ ] Troubleshooting guide comprehensive
- [ ] Videos produced and published
- [ ] Documentation site deployed
- [ ] User feedback collected and positive

---

## Related Epics

- **Depends On**: Epic 4, Epic 5
- **Blocks**: User adoption
- **Related**: All epics (documentation covers everything)

---

## Notes

**Developer Experience is Key**: Great DX drives adoption. Invest heavily in clear docs, helpful error messages, and smooth CLI experience.

**Keep Docs Fresh**: Documentation decay is real. Automate validation where possible and schedule regular reviews.

**Video Maintenance**: Videos are expensive to update. Focus on concepts over specific UI to extend shelf life.
