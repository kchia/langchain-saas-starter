# Epic 005: Advanced Integrations (MCP & Design Tools)

**Priority:** P2 - INNOVATION & DIFFERENTIATION
**Estimated Effort:** 3-4 days
**Value:** Modernizes integrations and expands market reach
**Bootcamp Requirement:** Week 7 - Model Context Protocol (MCP)

## Problem Statement

ComponentForge currently processes static screenshots, but modern design workflows use live tools like Figma, Sketch, and code editors. Adopting Model Context Protocol (MCP) and direct tool integrations will:
- Eliminate screenshot friction
- Enable real-time sync with design tools
- Provide competitive advantage
- Demonstrate cutting-edge architecture

## Success Metrics

- **MCP Server:** Figma integration via MCP protocol
- **Live Sync:** Real-time updates from Figma to ComponentForge
- **Bidirectional Sync:** Push generated components back to design tools
- **VS Code Extension:** In-editor component generation
- **API Integrations:** 3+ design tool integrations (Figma, Sketch, Penpot)

## User Stories

### Story 5.1: MCP Server for Figma Integration
**As a designer**, I want ComponentForge to read directly from Figma so I don't need to take screenshots.

**Acceptance Criteria:**
- [ ] Implement MCP server exposing Figma operations
- [ ] Authenticate with Figma API using OAuth
- [ ] Expose resources: files, frames, components, styles
- [ ] Expose tools: get_design_tokens, get_component_tree, export_frame
- [ ] Handle Figma webhooks for real-time updates
- [ ] Deploy MCP server as standalone service

**MCP Server Architecture:**
```python
# backend/src/mcp/figma_server.py
from mcp.server import Server, Resource, Tool
from figma_api import FigmaClient

class FigmaServer(Server):
    def __init__(self, figma_token: str):
        super().__init__(name="figma-integration")
        self.client = FigmaClient(figma_token)

    @Resource(uri="figma://files/{file_id}")
    async def get_figma_file(self, file_id: str):
        """Get Figma file metadata and structure."""
        return await self.client.get_file(file_id)

    @Resource(uri="figma://files/{file_id}/styles")
    async def get_design_system(self, file_id: str):
        """Extract design tokens from Figma styles."""
        file = await self.client.get_file(file_id)
        styles = await self.client.get_file_styles(file_id)

        return {
            "colors": self._extract_colors(styles),
            "typography": self._extract_typography(styles),
            "effects": self._extract_effects(styles)
        }

    @Tool()
    async def extract_component_tokens(self, file_id: str, node_id: str):
        """Extract design tokens from a specific Figma component."""
        node = await self.client.get_node(file_id, node_id)

        return {
            "colors": self._parse_fills(node),
            "spacing": self._parse_layout(node),
            "typography": self._parse_text(node),
            "borders": self._parse_strokes(node),
            "effects": self._parse_effects(node)
        }

    @Tool()
    async def export_component_image(self, file_id: str, node_id: str):
        """Export Figma component as PNG for vision model."""
        image_url = await self.client.get_image(file_id, node_id, format="png")
        return {"image_url": image_url}
```

**MCP Protocol Definition:**
```json
{
  "name": "figma-integration",
  "version": "1.0.0",
  "resources": [
    {
      "uri": "figma://files/{file_id}",
      "description": "Access Figma file structure",
      "mimeType": "application/json"
    },
    {
      "uri": "figma://files/{file_id}/styles",
      "description": "Extract design system tokens",
      "mimeType": "application/json"
    }
  ],
  "tools": [
    {
      "name": "extract_component_tokens",
      "description": "Extract design tokens from Figma component",
      "inputSchema": {
        "type": "object",
        "properties": {
          "file_id": {"type": "string"},
          "node_id": {"type": "string"}
        }
      }
    },
    {
      "name": "export_component_image",
      "description": "Export component as image for AI analysis",
      "inputSchema": {
        "type": "object",
        "properties": {
          "file_id": {"type": "string"},
          "node_id": {"type": "string"}
        }
      }
    }
  ]
}
```

**Files to Create:**
- `backend/src/mcp/figma_server.py`
- `backend/src/mcp/protocol.json`
- `backend/tests/mcp/test_figma_integration.py`
- `docker-compose.mcp.yml` (standalone MCP service)

---

### Story 5.2: Figma Plugin for One-Click Export
**As a designer**, I want a Figma plugin so I can send components to ComponentForge without leaving Figma.

**Acceptance Criteria:**
- [ ] Build Figma plugin with TypeScript
- [ ] UI: Select frames/components, click "Generate Code"
- [ ] Authenticate with ComponentForge backend
- [ ] Send selected component data via MCP server
- [ ] Display generated code in plugin sidebar
- [ ] Copy to clipboard or save to file

**Figma Plugin UI:**
```typescript
// figma-plugin/src/plugin.tsx
import { useState } from 'react';
import { ComponentForgeClient } from './client';

export function Plugin() {
  const [selectedNodes, setSelectedNodes] = useState<SceneNode[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

    // Get selection from Figma
    const selection = figma.currentPage.selection;

    // Extract design tokens
    const tokens = await extractTokensFromNodes(selection);

    // Call ComponentForge API via MCP
    const client = new ComponentForgeClient();
    const result = await client.generateFromFigma({
      fileId: figma.fileKey,
      nodeIds: selection.map(n => n.id),
      tokens: tokens
    });

    setGeneratedCode(result.code);
    setLoading(false);
  };

  return (
    <div className="plugin-container">
      <h2>ComponentForge</h2>

      <div className="selection">
        <p>{selectedNodes.length} components selected</p>
        <button onClick={() => figma.currentPage.selection}>
          Select Components
        </button>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || selectedNodes.length === 0}
      >
        {loading ? 'Generating...' : 'Generate Code'}
      </button>

      {generatedCode && (
        <div className="code-output">
          <pre>{generatedCode}</pre>
          <button onClick={() => navigator.clipboard.writeText(generatedCode)}>
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}
```

**Figma Plugin Manifest:**
```json
{
  "name": "ComponentForge",
  "id": "component-forge",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/ui.html",
  "editorType": ["figma"],
  "permissions": ["currentpage", "export"],
  "networkAccess": {
    "allowedDomains": ["api.componentforge.dev"]
  }
}
```

**Files to Create:**
- `figma-plugin/src/plugin.tsx`
- `figma-plugin/src/client.ts`
- `figma-plugin/manifest.json`
- `figma-plugin/README.md`

---

### Story 5.3: VS Code Extension
**As a developer**, I want a VS Code extension so I can generate components without leaving my editor.

**Acceptance Criteria:**
- [ ] Build VS Code extension with TypeScript
- [ ] Commands: "Generate Component from Figma", "Generate from Screenshot"
- [ ] Paste screenshot from clipboard
- [ ] Input Figma URL and component ID
- [ ] Generated code inserted at cursor or new file
- [ ] Syntax highlighting and formatting

**VS Code Extension:**
```typescript
// vscode-extension/src/extension.ts
import * as vscode from 'vscode';
import { ComponentForgeClient } from './client';

export function activate(context: vscode.ExtensionContext) {
  // Command: Generate from screenshot
  let generateFromScreenshot = vscode.commands.registerCommand(
    'componentforge.generateFromScreenshot',
    async () => {
      // Get image from clipboard
      const clipboardImage = await vscode.env.clipboard.readText();

      if (!clipboardImage) {
        vscode.window.showErrorMessage('No image in clipboard');
        return;
      }

      // Show progress
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating component...',
        cancellable: false
      }, async (progress) => {
        const client = new ComponentForgeClient();
        const result = await client.generateFromScreenshot(clipboardImage);

        // Insert generated code
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, result.code);
          });
        }

        vscode.window.showInformationMessage('Component generated!');
      });
    }
  );

  // Command: Generate from Figma URL
  let generateFromFigma = vscode.commands.registerCommand(
    'componentforge.generateFromFigma',
    async () => {
      // Prompt for Figma URL
      const figmaUrl = await vscode.window.showInputBox({
        prompt: 'Enter Figma component URL',
        placeHolder: 'https://figma.com/file/abc123...'
      });

      if (!figmaUrl) return;

      // Parse Figma URL
      const { fileId, nodeId } = parseFigmaUrl(figmaUrl);

      // Generate via MCP
      const client = new ComponentForgeClient();
      const result = await client.generateFromFigma({ fileId, nodeId });

      // Create new file with generated code
      const doc = await vscode.workspace.openTextDocument({
        content: result.code,
        language: 'typescriptreact'
      });
      await vscode.window.showTextDocument(doc);
    }
  );

  context.subscriptions.push(generateFromScreenshot, generateFromFigma);
}
```

**Extension Package:**
```json
{
  "name": "componentforge",
  "displayName": "ComponentForge",
  "description": "Generate React components from designs",
  "version": "1.0.0",
  "publisher": "componentforge",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Other"],
  "activationEvents": [
    "onCommand:componentforge.generateFromScreenshot",
    "onCommand:componentforge.generateFromFigma"
  ],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "componentforge.generateFromScreenshot",
        "title": "Generate Component from Screenshot"
      },
      {
        "command": "componentforge.generateFromFigma",
        "title": "Generate Component from Figma"
      }
    ],
    "keybindings": [
      {
        "command": "componentforge.generateFromScreenshot",
        "key": "ctrl+shift+g",
        "mac": "cmd+shift+g"
      }
    ]
  }
}
```

**Files to Create:**
- `vscode-extension/src/extension.ts`
- `vscode-extension/src/client.ts`
- `vscode-extension/package.json`
- `vscode-extension/README.md`

---

### Story 5.4: Sketch Integration
**As a Sketch user**, I want to export components to ComponentForge so I'm not limited to Figma.

**Acceptance Criteria:**
- [ ] Sketch plugin using JavaScript API
- [ ] Export selected artboards/symbols
- [ ] Extract Sketch styles (colors, text styles, layer styles)
- [ ] Convert Sketch format to ComponentForge tokens
- [ ] Generate code and display in plugin panel

**Sketch Plugin:**
```javascript
// sketch-plugin/src/plugin.js
import sketch from 'sketch';
import { ComponentForgeClient } from './client';

export default function() {
  const document = sketch.getSelectedDocument();
  const selection = document.selectedLayers;

  if (selection.isEmpty) {
    sketch.UI.message('Please select components to export');
    return;
  }

  // Extract design tokens from selection
  const tokens = selection.layers.map(layer => ({
    name: layer.name,
    type: layer.type,
    frame: layer.frame,
    style: {
      fills: layer.style.fills,
      borders: layer.style.borders,
      shadows: layer.style.shadows,
      textStyle: layer.style.textStyle
    }
  }));

  // Call ComponentForge API
  const client = new ComponentForgeClient();
  client.generateFromSketch(tokens)
    .then(result => {
      // Show generated code in panel
      showCodePanel(result.code);
    })
    .catch(error => {
      sketch.UI.alert('Error', error.message);
    });
}

function showCodePanel(code) {
  const webview = new sketch.Webview();
  webview.loadHTML(`
    <html>
      <body>
        <h2>Generated Component</h2>
        <pre><code>${code}</code></pre>
        <button onclick="copyCode()">Copy to Clipboard</button>
      </body>
    </html>
  `);
  webview.show();
}
```

**Files to Create:**
- `sketch-plugin/src/plugin.js`
- `sketch-plugin/src/client.js`
- `sketch-plugin/manifest.json`

---

### Story 5.5: Bidirectional Sync - Push Components Back to Figma
**As a design system maintainer**, I want generated code synced back to Figma so designers see implementation status.

**Acceptance Criteria:**
- [ ] Create Figma component from generated React code
- [ ] Sync implementation status: "In Progress", "Implemented", "In Review"
- [ ] Link Figma component to generated code (GitHub, Storybook)
- [ ] Update component properties based on code
- [ ] Webhook triggers on code changes

**Sync Flow:**
```
1. Designer creates component in Figma
2. ComponentForge generates code
3. Code deployed to Storybook
4. ComponentForge updates Figma component:
   - Add "✅ Implemented" tag
   - Add Storybook link to component description
   - Add GitHub link to component properties
5. Developer updates code
6. GitHub webhook triggers ComponentForge
7. ComponentForge updates Figma component status
```

**Implementation:**
```python
# backend/src/integrations/figma_sync.py
class FigmaSync:
    async def update_component_status(
        self,
        file_id: str,
        node_id: str,
        status: str,
        links: dict
    ):
        # Update component description
        await self.client.set_description(
            file_id,
            node_id,
            f"""
            Status: {status}
            Storybook: {links['storybook']}
            GitHub: {links['github']}
            Last Updated: {datetime.now().isoformat()}
            """
        )

        # Add status tag to component
        await self.client.add_tag(file_id, node_id, f"status:{status}")

    async def sync_from_github(self, event: dict):
        """Handle GitHub webhook for code changes."""
        if event['action'] == 'push':
            # Find linked Figma components
            components = await self.db.execute("""
                SELECT figma_file_id, figma_node_id
                FROM components
                WHERE github_path = $1
            """, event['commits'][0]['modified'][0])

            # Update status in Figma
            for component in components:
                await self.update_component_status(
                    component['figma_file_id'],
                    component['figma_node_id'],
                    status="Updated",
                    links={
                        'storybook': f"https://storybook.example.com/{component['name']}",
                        'github': event['commits'][0]['url']
                    }
                )
```

**Files to Create:**
- `backend/src/integrations/figma_sync.py`
- `backend/src/webhooks/github_handler.py`
- `backend/alembic/versions/add_figma_links_table.py`

---

### Story 5.6: Penpot Integration (Open Source Alternative)
**As an open-source advocate**, I want Penpot support so ComponentForge works with open-source design tools.

**Acceptance Criteria:**
- [ ] Penpot API integration
- [ ] Extract design tokens from Penpot files
- [ ] Export Penpot components as images
- [ ] Generate code from Penpot designs
- [ ] Demonstrate commitment to open-source ecosystem

**Penpot Integration:**
```python
# backend/src/integrations/penpot.py
from penpot_api import PenpotClient

class PenpotIntegration:
    def __init__(self, api_token: str):
        self.client = PenpotClient(api_token)

    async def extract_tokens(self, file_id: str, page_id: str):
        """Extract design tokens from Penpot file."""
        file = await self.client.get_file(file_id)
        page = file.pages[page_id]

        return {
            "colors": self._extract_colors(page.colors),
            "typography": self._extract_typography(page.typography),
            "components": self._extract_components(page.components)
        }

    async def export_component(self, file_id: str, shape_id: str):
        """Export Penpot component as PNG."""
        return await self.client.export_shape(
            file_id,
            shape_id,
            format="png",
            scale=2
        )
```

**Files to Create:**
- `backend/src/integrations/penpot.py`
- `backend/tests/integrations/test_penpot.py`

---

## Technical Dependencies

- **MCP:** `mcp`, `mcp-server-python`
- **Figma:** `figma-api`, `figma-js` (plugin)
- **VS Code:** `@types/vscode`, `vscode-extension-tester`
- **Sketch:** `sketch-api`, `sketch-module-web-view`
- **Penpot:** `penpot-python-client`

## Market Differentiation

**Before (Screenshots Only):**
"Upload screenshots to generate components"

**After (Full Integration):**
"Connect ComponentForge to Figma, Sketch, or Penpot. Generate components directly from your design tool with one click. Sync implementation status back to designers."

**Competitive Advantages:**
1. First to use MCP for design tool integration
2. Bidirectional sync (unique feature)
3. Multi-tool support (Figma, Sketch, Penpot)
4. In-editor generation (VS Code extension)
5. Open-source friendly (Penpot support)

## Demo Day Presentation

**Integration Showcase:**
1. **Live Demo:** Generate component from Figma without screenshot
2. **VS Code Demo:** Cmd+Shift+G to generate from clipboard
3. **Sync Demo:** Show component status updated in Figma
4. **Open Source:** "We support Penpot, the open-source Figma alternative"

**Technical Innovation:**
"ComponentForge is the first design-to-code tool using Model Context Protocol, enabling seamless integration with any design tool. Our bidirectional sync keeps designers and developers aligned."

---

## Success Criteria

- [ ] MCP server deployed and operational
- [ ] Figma plugin published to Figma Community
- [ ] VS Code extension published to Marketplace
- [ ] Sketch plugin available for download
- [ ] Penpot integration functional
- [ ] Bidirectional sync working with Figma
- [ ] Documentation: Integration guides for all tools
- [ ] Demo video showing full workflow

## Timeline

- **Day 1:** MCP server + Figma integration
- **Day 2:** Figma plugin + VS Code extension
- **Day 3:** Sketch plugin + Penpot integration
- **Day 4:** Bidirectional sync + demo video

## References

- Bootcamp Week 7: Model Context Protocol
- MCP specification: https://modelcontextprotocol.io/
- Figma Plugin API: https://www.figma.com/plugin-docs/
- VS Code Extension API: https://code.visualstudio.com/api
- Sketch Plugin API: https://developer.sketch.com/
- Penpot API: https://penpot.app/developers
