import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricCard } from './MetricCard'
import { Users, Clock } from 'lucide-react'

describe('MetricCard', () => {
  describe('Component Rendering', () => {
    it('renders metric card with required props', () => {
      render(
        <MetricCard
          title="Components"
          value={12}
        />
      )
      expect(screen.getByText('Components')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
    })

    it('renders metric card with string value', () => {
      render(
        <MetricCard
          title="Cache Hit Rate"
          value="78%"
        />
      )
      expect(screen.getByText('Cache Hit Rate')).toBeInTheDocument()
      expect(screen.getByText('78%')).toBeInTheDocument()
    })

    it('renders metric card with subtitle', () => {
      render(
        <MetricCard
          title="Components"
          value={12}
          subtitle="+3 this week"
        />
      )
      expect(screen.getByText('+3 this week')).toBeInTheDocument()
    })

    it('renders metric card with trend', () => {
      render(
        <MetricCard
          title="Components"
          value={12}
          trend="+25%"
        />
      )
      expect(screen.getByText('+25%')).toBeInTheDocument()
    })

    it('renders metric card with icon', () => {
      const { container } = render(
        <MetricCard
          title="Components"
          value={12}
          icon={Users}
        />
      )
      // lucide-react icons render as SVG
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders all optional props together', () => {
      const { container } = render(
        <MetricCard
          title="Components"
          value={12}
          subtitle="+3 this week"
          trend="+25%"
          icon={Users}
        />
      )
      expect(screen.getByText('Components')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('+3 this week')).toBeInTheDocument()
      expect(screen.getByText('+25%')).toBeInTheDocument()
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Trend Colors', () => {
    it('applies success color for positive trend', () => {
      render(
        <MetricCard
          title="Components"
          value={12}
          trend="+25%"
        />
      )
      const trendElement = screen.getByText('+25%')
      expect(trendElement).toHaveClass('text-success')
    })

    it('applies destructive color for negative trend', () => {
      render(
        <MetricCard
          title="Avg Time"
          value="48s"
          trend="-12%"
        />
      )
      const trendElement = screen.getByText('-12%')
      expect(trendElement).toHaveClass('text-destructive')
    })

    it('applies muted color for neutral trend', () => {
      render(
        <MetricCard
          title="Rate"
          value="50%"
          trend="0%"
        />
      )
      const trendElement = screen.getByText('0%')
      expect(trendElement).toHaveClass('text-muted-foreground')
    })
  })

  describe('Accessibility', () => {
    it('has accessible label for value', () => {
      render(
        <MetricCard
          title="Components"
          value={12}
        />
      )
      const valueElement = screen.getByText('12')
      expect(valueElement).toHaveAttribute('aria-label', 'Components: 12')
    })

    it('has accessible label for trend', () => {
      render(
        <MetricCard
          title="Components"
          value={12}
          trend="+25%"
        />
      )
      const trendElement = screen.getByText('+25%')
      expect(trendElement).toHaveAttribute('aria-label', 'Trend: +25%')
    })

    it('hides icon from screen readers', () => {
      const { container } = render(
        <MetricCard
          title="Components"
          value={12}
          icon={Users}
        />
      )
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('uses semantic HTML', () => {
      render(
        <MetricCard
          title="Components"
          value={12}
          subtitle="+3 this week"
          trend="+25%"
        />
      )
      // All text content should be in <p> tags
      const paragraphs = screen.getAllByText(/Components|12|\+3 this week|\+25%/, { selector: 'p' })
      expect(paragraphs.length).toBeGreaterThan(0)
    })
  })

  describe('Card Variant', () => {
    it('uses elevated card variant', () => {
      const { container } = render(
        <MetricCard
          title="Components"
          value={12}
        />
      )
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('shadow-sm')
    })

    it('has hover shadow transition', () => {
      const { container } = render(
        <MetricCard
          title="Components"
          value={12}
        />
      )
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('hover:shadow-md')
      expect(card).toHaveClass('transition-shadow')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <MetricCard
          title="Components"
          value={12}
          className="custom-class"
        />
      )
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
    })

    it('merges custom className with default styles', () => {
      const { container } = render(
        <MetricCard
          title="Components"
          value={12}
          className="custom-class"
        />
      )
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
      expect(card).toHaveClass('shadow-sm')
    })
  })

  describe('Display Name', () => {
    it('has correct display name', () => {
      expect(MetricCard.displayName).toBe('MetricCard')
    })
  })

  describe('Different Icon Types', () => {
    it('renders different icon types correctly', () => {
      const { container: container1 } = render(
        <MetricCard
          title="Users"
          value={12}
          icon={Users}
        />
      )
      const { container: container2 } = render(
        <MetricCard
          title="Time"
          value="48s"
          icon={Clock}
        />
      )
      
      expect(container1.querySelector('svg')).toBeInTheDocument()
      expect(container2.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('renders with zero value', () => {
      render(
        <MetricCard
          title="Errors"
          value={0}
        />
      )
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('renders with empty string value', () => {
      render(
        <MetricCard
          title="Status"
          value=""
        />
      )
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('renders with very long title', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines'
      render(
        <MetricCard
          title={longTitle}
          value={12}
        />
      )
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('renders with very long value', () => {
      render(
        <MetricCard
          title="Components"
          value="1,234,567,890"
        />
      )
      expect(screen.getByText('1,234,567,890')).toBeInTheDocument()
    })
  })
})
