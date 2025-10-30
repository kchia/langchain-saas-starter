import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg+div]:pl-7',
  {
    variants: {
      variant: {
        info: 'bg-[var(--color-info-background)] border-[var(--color-info-border)] text-[var(--color-info-text)] [&>svg]:text-[var(--color-info-icon)]',
        success: 'bg-[var(--color-success-background)] border-[var(--color-success-border)] text-[var(--color-success-text)] [&>svg]:text-[var(--color-success-icon)]',
        warning: 'bg-[var(--color-warning-background)] border-[var(--color-warning-border)] text-[var(--color-warning-text)] [&>svg]:text-[var(--color-warning-icon)]',
        error: 'bg-[var(--color-error-background)] border-[var(--color-error-border)] text-[var(--color-error-text)] [&>svg]:text-[var(--color-error-icon)]',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

// Default icons for each variant
const InfoIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const defaultIcons = {
  info: <InfoIcon />,
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  error: <ErrorIcon />,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Alert variant */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /** Alert title */
  title?: string;
  /** Alert message content */
  children?: React.ReactNode;
  /** Custom icon (optional) */
  icon?: React.ReactNode;
  /** Close handler (makes alert dismissible) */
  onClose?: () => void;
}

/**
 * Alert component for displaying important messages
 *
 * @example
 * <Alert variant="success" title="Success">
 *   Your changes have been saved successfully.
 * </Alert>
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, children, icon, onClose, className, ...props }, ref) => {
    const ariaLive = variant === 'error' ? 'assertive' : 'polite';
    const displayIcon = icon || defaultIcons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        aria-live={ariaLive}
        aria-atomic="true"
        className={alertVariants({ variant, className })}
        {...props}
      >
        {displayIcon}
        <div className="flex-1">
          {title && (
            <h5 className="mb-1 font-semibold leading-none tracking-tight">
              {title}
            </h5>
          )}
          {children && (
            <div className="text-sm [&_p]:leading-relaxed">
              {children}
            </div>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2"
            aria-label="Dismiss alert"
          >
            <CloseIcon />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

/**
 * Alert title component
 */
export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-semibold leading-none tracking-tight ${className || ''}`}
    {...props}
  />
));

AlertTitle.displayName = 'AlertTitle';

/**
 * Alert description component
 */
export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className || ''}`}
    {...props}
  />
));

AlertDescription.displayName = 'AlertDescription';
