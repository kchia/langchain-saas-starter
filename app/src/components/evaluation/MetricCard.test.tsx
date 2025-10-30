/**
 * Tests for MetricCard component.
 */

import { render, screen } from "@testing-library/react";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("renders with percentage format", () => {
    render(
      <MetricCard
        label="Success Rate"
        value={0.85}
        format="percentage"
        target={0.8}
        description="Pipeline success rate"
      />
    );

    expect(screen.getByText("Success Rate")).toBeInTheDocument();
    expect(screen.getByText("85.0%")).toBeInTheDocument();
    expect(screen.getByText("Pipeline success rate")).toBeInTheDocument();
    expect(screen.getByText(/Target: ≥ 80.0%/)).toBeInTheDocument();
  });

  it("renders with number format", () => {
    render(
      <MetricCard label="Dataset Size" value={15} format="number" />
    );

    expect(screen.getByText("Dataset Size")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("renders with seconds format", () => {
    render(
      <MetricCard
        label="Latency"
        value={5.5}
        format="seconds"
        target={20}
        inverted
      />
    );

    expect(screen.getByText("Latency")).toBeInTheDocument();
    expect(screen.getByText("5.5s")).toBeInTheDocument();
    expect(screen.getByText(/Target: < 20.0s/)).toBeInTheDocument();
  });

  it("renders with milliseconds format", () => {
    render(
      <MetricCard label="Latency" value={3500} format="milliseconds" />
    );

    expect(screen.getByText("3500ms")).toBeInTheDocument();
  });

  it("renders without target", () => {
    render(<MetricCard label="Test Metric" value={42} />);

    expect(screen.getByText("Test Metric")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.queryByText(/Target/)).not.toBeInTheDocument();
  });

  it("renders without description", () => {
    render(<MetricCard label="Test Metric" value={42} target={50} />);

    expect(screen.getByText("Test Metric")).toBeInTheDocument();
    expect(screen.queryByText(/description/)).not.toBeInTheDocument();
  });
});
