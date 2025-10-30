import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TokenExport } from "./TokenExport";
import type { TokenData } from "./TokenEditor";

describe("TokenExport", () => {
  const mockTokens: TokenData = {
    colors: {
      primary: { value: "#3B82F6", confidence: 0.92 },
      secondary: { value: "#10B981", confidence: 0.88 }
    },
    typography: {
      fontFamily: { value: "Inter", confidence: 0.75 },
      fontSize: { value: "16px", confidence: 0.9 },
      fontWeight: { value: "500", confidence: 0.85 }
    },
    spacing: {
      padding: { value: "16px", confidence: 0.85 }
    }
  };

  const mockMetadata = {
    method: "screenshot" as const,
    timestamp: "2024-01-01T00:00:00Z",
    averageConfidence: 0.87
  };

  // Mock clipboard API
  const mockClipboard = {
    writeText: vi.fn()
  };

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: mockClipboard
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders export component", () => {
      render(<TokenExport tokens={mockTokens} />);

      expect(screen.getByTestId("token-export")).toBeInTheDocument();
      expect(screen.getByText("Export Tokens")).toBeInTheDocument();
    });

    it("shows format toggle buttons", () => {
      render(<TokenExport tokens={mockTokens} />);

      expect(screen.getByRole("button", { name: "JSON" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "CSS" })).toBeInTheDocument();
    });

    it("shows download and copy buttons", () => {
      render(<TokenExport tokens={mockTokens} />);

      expect(
        screen.getByRole("button", { name: /download json/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /copy to clipboard/i })
      ).toBeInTheDocument();
    });
  });

  describe("Format Toggle", () => {
    it("defaults to JSON format", () => {
      render(<TokenExport tokens={mockTokens} />);

      const jsonButton = screen.getByRole("button", { name: "JSON" });
      // JSON button should have default variant (visually active)
      expect(jsonButton).toBeInTheDocument();
    });

    it("switches to CSS format", async () => {
      const user = userEvent.setup();
      render(<TokenExport tokens={mockTokens} />);

      const cssButton = screen.getByRole("button", { name: "CSS" });
      await user.click(cssButton);

      // Should show CSS download button
      expect(
        screen.getByRole("button", { name: /download css/i })
      ).toBeInTheDocument();
    });
  });

  describe("JSON Export", () => {
    it("displays JSON code", () => {
      render(<TokenExport tokens={mockTokens} />);

      // Check for JSON structure in code block
      expect(screen.getByText(/"colors":/)).toBeInTheDocument();
      expect(screen.getByText(/"primary":/)).toBeInTheDocument();
      expect(screen.getByText(/"#3B82F6"/)).toBeInTheDocument();
    });

    it("includes metadata in JSON", () => {
      render(<TokenExport tokens={mockTokens} metadata={mockMetadata} />);

      expect(screen.getByText(/"_metadata":/)).toBeInTheDocument();
      expect(screen.getByText(/"screenshot"/)).toBeInTheDocument();
    });
  });

  describe("CSS Export", () => {
    it("displays CSS code", async () => {
      const user = userEvent.setup();
      render(<TokenExport tokens={mockTokens} />);

      const cssButton = screen.getByRole("button", { name: "CSS" });
      await user.click(cssButton);

      // Check for CSS structure
      expect(screen.getByText(/:root {/)).toBeInTheDocument();
      expect(screen.getByText(/--color-primary: #3B82F6;/)).toBeInTheDocument();
      expect(screen.getByText(/--font-family: Inter;/)).toBeInTheDocument();
    });

    it("includes metadata in CSS comments", async () => {
      const user = userEvent.setup();
      render(<TokenExport tokens={mockTokens} metadata={mockMetadata} />);

      const cssButton = screen.getByRole("button", { name: "CSS" });
      await user.click(cssButton);

      expect(screen.getByText(/Extracted via: screenshot/)).toBeInTheDocument();
      expect(screen.getByText(/Average confidence: 87%/)).toBeInTheDocument();
    });
  });

  describe("Download Functionality", () => {
    it("downloads JSON file", async () => {
      const user = userEvent.setup();

      // Mock URL.createObjectURL and related methods
      global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
      global.URL.revokeObjectURL = vi.fn();

      const createElementSpy = vi.spyOn(document, "createElement");
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as unknown as Node);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as unknown as Node);

      render(<TokenExport tokens={mockTokens} />);

      const downloadButton = screen.getByRole("button", {
        name: /download json/i
      });
      await user.click(downloadButton);

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("downloads CSS file with correct filename", async () => {
      const user = userEvent.setup();

      global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
      global.URL.revokeObjectURL = vi.fn();

      let downloadedFilename = "";
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tag) => {
          const element = document.createElement(tag);
          if (tag === "a") {
            Object.defineProperty(element, "download", {
              set: (value) => {
                downloadedFilename = value;
              },
              get: () => downloadedFilename
            });
          }
          return element;
        });

      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as unknown as Node);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as unknown as Node);

      render(<TokenExport tokens={mockTokens} />);

      // Switch to CSS
      const cssButton = screen.getByRole("button", { name: "CSS" });
      await user.click(cssButton);

      const downloadButton = screen.getByRole("button", {
        name: /download css/i
      });
      await user.click(downloadButton);

      expect(downloadedFilename).toBe("tokens.css");

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe("Copy to Clipboard", () => {
    it("copies JSON to clipboard", async () => {
      const user = userEvent.setup();
      render(<TokenExport tokens={mockTokens} />);

      const copyButton = screen.getByRole("button", {
        name: /copy to clipboard/i
      });
      await user.click(copyButton);

      expect(mockClipboard.writeText).toHaveBeenCalled();
      const copiedText = mockClipboard.writeText.mock.calls[0][0];
      expect(copiedText).toContain('"colors"');
      expect(copiedText).toContain("#3B82F6");
    });

    it("shows success message after copy", async () => {
      const user = userEvent.setup();
      render(<TokenExport tokens={mockTokens} />);

      const copyButton = screen.getByRole("button", {
        name: /copy to clipboard/i
      });
      await user.click(copyButton);

      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });

    it("copies CSS to clipboard when in CSS mode", async () => {
      const user = userEvent.setup();
      render(<TokenExport tokens={mockTokens} />);

      // Switch to CSS
      const cssButton = screen.getByRole("button", { name: "CSS" });
      await user.click(cssButton);

      const copyButton = screen.getByRole("button", {
        name: /copy to clipboard/i
      });
      await user.click(copyButton);

      expect(mockClipboard.writeText).toHaveBeenCalled();
      const copiedText = mockClipboard.writeText.mock.calls[0][0];
      expect(copiedText).toContain(":root {");
      expect(copiedText).toContain("--color-primary");
    });
  });

  describe("Empty Tokens", () => {
    it("handles empty tokens gracefully", () => {
      const emptyTokens: TokenData = {
        colors: {},
        typography: {},
        spacing: {}
      };

      render(<TokenExport tokens={emptyTokens} />);

      expect(screen.getByTestId("token-export")).toBeInTheDocument();
      expect(screen.getByText(/"colors":/)).toBeInTheDocument();
    });
  });
});
