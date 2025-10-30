import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GenerationMetadataDisplay } from "./GenerationMetadataDisplay";

describe("GenerationMetadataDisplay", () => {
  it("displays latency, tokens, and cost", () => {
    render(
      <GenerationMetadataDisplay
        metadata={{
          latency_ms: 3500,
          token_count: 1250,
          estimated_cost: 0.0125,
        }}
      />
    );

    expect(screen.getByText("3.5s")).toBeInTheDocument();
    expect(screen.getByText("1,250")).toBeInTheDocument();
    expect(screen.getByText("$0.0125")).toBeInTheDocument();
  });

  it("displays N/A for missing metrics", () => {
    render(
      <GenerationMetadataDisplay
        metadata={{}}
      />
    );

    const naElements = screen.getAllByText("N/A");
    expect(naElements.length).toBeGreaterThan(0);
  });

  it("displays LLM token breakdown when available", () => {
    render(
      <GenerationMetadataDisplay
        metadata={{
          llm_token_usage: {
            prompt_tokens: 500,
            completion_tokens: 750,
            total_tokens: 1250,
          },
        }}
      />
    );

    expect(screen.getByText("Token Breakdown")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("750")).toBeInTheDocument();
  });

  it("displays stage breakdown when available", () => {
    render(
      <GenerationMetadataDisplay
        metadata={{
          latency_ms: 5000,
          stage_latencies: {
            parsing: 500,
            generating: 3000,
            assembling: 1500,
          },
        }}
      />
    );

    expect(screen.getByText("Stage Breakdown")).toBeInTheDocument();
    expect(screen.getByText("parsing")).toBeInTheDocument();
    expect(screen.getByText("0.50s")).toBeInTheDocument();
    expect(screen.getByText("generating")).toBeInTheDocument();
    expect(screen.getByText("3.00s")).toBeInTheDocument();
  });

  it("uses llm_token_usage total when available instead of token_count", () => {
    render(
      <GenerationMetadataDisplay
        metadata={{
          token_count: 999,
          llm_token_usage: {
            prompt_tokens: 500,
            completion_tokens: 750,
            total_tokens: 1250,
          },
        }}
      />
    );

    // Should display llm_token_usage.total_tokens (1,250) not token_count (999)
    expect(screen.getByText("1,250")).toBeInTheDocument();
    expect(screen.queryByText("999")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <GenerationMetadataDisplay
        metadata={{}}
        className="custom-class"
      />
    );

    const card = container.querySelector(".custom-class");
    expect(card).toBeInTheDocument();
  });

  it("formats large numbers with commas", () => {
    render(
      <GenerationMetadataDisplay
        metadata={{
          token_count: 123456,
        }}
      />
    );

    expect(screen.getByText("123,456")).toBeInTheDocument();
  });

  it("shows decimal places for cost", () => {
    render(
      <GenerationMetadataDisplay
        metadata={{
          estimated_cost: 0.00001,
        }}
      />
    );

    expect(screen.getByText("$0.0000")).toBeInTheDocument();
  });
});
