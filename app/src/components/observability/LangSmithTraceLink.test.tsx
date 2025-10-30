import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LangSmithTraceLink } from "./LangSmithTraceLink";

describe("LangSmithTraceLink", () => {
  it("renders link with trace URL", () => {
    render(
      <LangSmithTraceLink
        traceUrl="https://smith.langchain.com/o/default/projects/p/test/r/123"
      />
    );

    const link = screen.getByRole("link", { name: /View Trace/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://smith.langchain.com/o/default/projects/p/test/r/123");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("returns null when no trace URL provided", () => {
    const { container } = render(<LangSmithTraceLink />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when trace URL is empty string", () => {
    const { container } = render(<LangSmithTraceLink traceUrl="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders with custom variant and size", () => {
    render(
      <LangSmithTraceLink
        traceUrl="https://smith.langchain.com/trace/123"
        variant="default"
        size="lg"
      />
    );

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
  });

  it("includes external link icon", () => {
    render(
      <LangSmithTraceLink
        traceUrl="https://smith.langchain.com/trace/123"
      />
    );

    // Check for the ExternalLink icon (Lucide icon)
    const link = screen.getByRole("link");
    const svg = link.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <LangSmithTraceLink
        traceUrl="https://smith.langchain.com/trace/123"
        className="custom-class"
      />
    );

    // The className is passed to the Button which wraps the link
    const link = screen.getByRole("link");
    expect(link).toHaveClass("custom-class");
  });
});
