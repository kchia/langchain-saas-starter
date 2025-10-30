import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from './card'

describe('Card', () => {
  describe('Component Rendering', () => {
    it('renders card with children', () => {
      render(
        <Card>
          <CardContent>Test content</CardContent>
        </Card>
      )
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('renders CardHeader with title and description', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
        </Card>
      )
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('renders CardFooter', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      )
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Card variant="default">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('border-gray-200')
      expect(card).toHaveClass('bg-white')
    })

    it('renders outlined variant', () => {
      const { container } = render(<Card variant="outlined">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('border-gray-200')
      expect(card).toHaveClass('bg-white')
    })

    it('renders elevated variant with shadow', () => {
      const { container } = render(<Card variant="elevated">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('shadow-sm')
    })

    it('renders interactive variant with hover styles', () => {
      const { container } = render(<Card variant="interactive">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('hover:border-gray-300')
      expect(card).toHaveClass('cursor-pointer')
      expect(card).toHaveClass('transition-colors')
    })
  })

  describe('Padding Options', () => {
    it('applies small padding to CardHeader', () => {
      const { container } = render(
        <Card>
          <CardHeader padding="sm">Content</CardHeader>
        </Card>
      )
      const header = container.querySelector('div > div') as HTMLElement
      expect(header).toHaveClass('p-4')
    })

    it('applies medium padding to CardHeader by default', () => {
      const { container } = render(
        <Card>
          <CardHeader>Content</CardHeader>
        </Card>
      )
      const header = container.querySelector('div > div') as HTMLElement
      expect(header).toHaveClass('p-6')
    })

    it('applies large padding to CardHeader', () => {
      const { container } = render(
        <Card>
          <CardHeader padding="lg">Content</CardHeader>
        </Card>
      )
      const header = container.querySelector('div > div') as HTMLElement
      expect(header).toHaveClass('p-8')
    })

    it('applies small padding to CardContent', () => {
      const { container } = render(
        <Card>
          <CardContent padding="sm">Content</CardContent>
        </Card>
      )
      const content = container.querySelector('div > div') as HTMLElement
      expect(content).toHaveClass('p-4')
      expect(content).toHaveClass('pt-0')
    })

    it('applies medium padding to CardContent by default', () => {
      const { container } = render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      )
      const content = container.querySelector('div > div') as HTMLElement
      expect(content).toHaveClass('p-6')
      expect(content).toHaveClass('pt-0')
    })

    it('applies large padding to CardContent', () => {
      const { container } = render(
        <Card>
          <CardContent padding="lg">Content</CardContent>
        </Card>
      )
      const content = container.querySelector('div > div') as HTMLElement
      expect(content).toHaveClass('p-8')
      expect(content).toHaveClass('pt-0')
    })
  })

  describe('Accessibility', () => {
    it('has button role for interactive variant', () => {
      const { container } = render(<Card variant="interactive">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveAttribute('role', 'button')
    })

    it('is keyboard accessible for interactive variant', () => {
      const { container } = render(<Card variant="interactive">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveAttribute('tabIndex', '0')
    })

    it('does not have button role for non-interactive variants', () => {
      const { container } = render(<Card variant="outlined">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).not.toHaveAttribute('role')
    })

    it('is not keyboard accessible for non-interactive variants', () => {
      const { container } = render(<Card variant="outlined">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).not.toHaveAttribute('tabIndex')
    })

    it('handles Enter key press on interactive card', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      const { container } = render(
        <Card variant="interactive" onClick={handleClick}>
          Content
        </Card>
      )
      const card = container.firstChild as HTMLElement
      
      card.focus()
      await user.keyboard('{Enter}')
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles Space key press on interactive card', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      const { container } = render(
        <Card variant="interactive" onClick={handleClick}>
          Content
        </Card>
      )
      const card = container.firstChild as HTMLElement
      
      card.focus()
      await user.keyboard(' ')
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>
      )
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
    })

    it('merges custom className with variant styles', () => {
      const { container } = render(
        <Card variant="elevated" className="custom-class">
          Content
        </Card>
      )
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
      expect(card).toHaveClass('shadow-sm')
    })
  })

  describe('Display Names', () => {
    it('has correct display name for Card', () => {
      expect(Card.displayName).toBe('Card')
    })

    it('has correct display name for CardHeader', () => {
      expect(CardHeader.displayName).toBe('CardHeader')
    })

    it('has correct display name for CardContent', () => {
      expect(CardContent.displayName).toBe('CardContent')
    })

    it('has correct display name for CardTitle', () => {
      expect(CardTitle.displayName).toBe('CardTitle')
    })

    it('has correct display name for CardDescription', () => {
      expect(CardDescription.displayName).toBe('CardDescription')
    })

    it('has correct display name for CardFooter', () => {
      expect(CardFooter.displayName).toBe('CardFooter')
    })
  })
})
