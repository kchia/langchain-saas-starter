/**
 * Tests for RateLimitAlert component
 * Epic 003 Story 3.3: Rate Limiting
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RateLimitAlert } from '../RateLimitAlert';

describe('RateLimitAlert', () => {
  describe('Display and Content', () => {
    it('should render alert with rate limit message', () => {
      render(
        <RateLimitAlert
          retryAfter={30}
          message="You have exceeded the rate limit for this endpoint."
        />
      );

      expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument();
      expect(
        screen.getByText('You have exceeded the rate limit for this endpoint.')
      ).toBeInTheDocument();
    });

    it('should use default message when not provided', () => {
      render(<RateLimitAlert retryAfter={30} />);

      expect(screen.getByText('You have exceeded the rate limit.')).toBeInTheDocument();
    });

    it('should display endpoint when provided', () => {
      render(
        <RateLimitAlert
          retryAfter={30}
          endpoint="/api/v1/extract"
        />
      );

      expect(screen.getByText('/api/v1/extract')).toBeInTheDocument();
    });

    it('should not display endpoint section when not provided', () => {
      render(<RateLimitAlert retryAfter={30} />);

      expect(screen.queryByText('Endpoint:')).not.toBeInTheDocument();
    });
  });

  describe('Countdown Display', () => {
    it('should format seconds correctly for values under 60', () => {
      render(<RateLimitAlert retryAfter={30} />);

      expect(screen.getByText(/Please wait 30 seconds before trying again/)).toBeInTheDocument();
    });

    it('should use singular "second" for 1 second', () => {
      render(<RateLimitAlert retryAfter={1} />);

      expect(screen.getByText(/Please wait 1 second before trying again/)).toBeInTheDocument();
    });

    it('should format minutes correctly', () => {
      render(<RateLimitAlert retryAfter={60} />);

      expect(screen.getByText(/Please wait 1 minute before trying again/)).toBeInTheDocument();
    });

    it('should format minutes and seconds correctly', () => {
      render(<RateLimitAlert retryAfter={90} />);

      expect(screen.getByText(/Please wait 1m 30s before trying again/)).toBeInTheDocument();
    });

    it('should format multiple minutes correctly', () => {
      render(<RateLimitAlert retryAfter={180} />);

      expect(screen.getByText(/Please wait 3 minutes before trying again/)).toBeInTheDocument();
    });

    it('should format multiple minutes with seconds', () => {
      render(<RateLimitAlert retryAfter={125} />);

      expect(screen.getByText(/Please wait 2m 5s before trying again/)).toBeInTheDocument();
    });
  });

  describe('Dismissible Behavior', () => {
    it('should render dismiss button when onDismiss is provided', () => {
      const onDismiss = vi.fn();
      render(<RateLimitAlert retryAfter={30} onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      expect(dismissButton).toBeInTheDocument();
    });

    it('should not render dismiss button when onDismiss is not provided', () => {
      render(<RateLimitAlert retryAfter={30} />);

      const dismissButton = screen.queryByRole('button', { name: /dismiss/i });
      expect(dismissButton).not.toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      
      render(<RateLimitAlert retryAfter={30} onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have alert role', () => {
      render(<RateLimitAlert retryAfter={30} />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have proper aria attributes', () => {
      render(<RateLimitAlert retryAfter={30} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
      expect(alert).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have descriptive text for countdown', () => {
      render(<RateLimitAlert retryAfter={30} />);

      expect(
        screen.getByText(/This page will automatically retry when the waiting period is over/)
      ).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should display alert icon', () => {
      const { container } = render(<RateLimitAlert retryAfter={30} />);

      // Check for AlertCircle icon
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should display clock icon in countdown section', () => {
      const { container } = render(<RateLimitAlert retryAfter={30} />);

      // Check for Clock icon - there should be 2 SVGs (AlertCircle + Clock)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });

    it('should have warning variant styling', () => {
      render(<RateLimitAlert retryAfter={30} />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toMatch(/yellow/); // Warning uses yellow colors
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero retryAfter', () => {
      render(<RateLimitAlert retryAfter={0} />);

      expect(screen.getByText(/Please wait 0 seconds before trying again/)).toBeInTheDocument();
    });

    it('should handle very large retryAfter values', () => {
      render(<RateLimitAlert retryAfter={3600} />); // 1 hour

      expect(screen.getByText(/Please wait 60 minutes before trying again/)).toBeInTheDocument();
    });
  });
});
