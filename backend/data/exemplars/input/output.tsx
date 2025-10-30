import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input label text */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  hint?: string;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

/**
 * Input component with label, error, and hint text support
 *
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 *   hint="We'll never share your email"
 * />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, type = 'text', id, className, required, disabled, ...props }, ref) => {
    // Generate unique IDs for accessibility
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-label)] mb-1.5"
          >
            {label}
            {required && <span className="text-[var(--color-error)] ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            w-full px-3 py-2
            text-sm text-[var(--color-text)]
            bg-[var(--color-background)]
            border rounded-md
            transition-colors
            placeholder:text-[var(--color-placeholder)]
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:cursor-not-allowed disabled:opacity-50
            ${error
              ? 'border-[var(--color-borderError)] focus:ring-[var(--color-borderError)]'
              : 'border-[var(--color-border)] focus:border-[var(--color-borderFocus)] focus:ring-[var(--color-borderFocus)]'
            }
            ${className || ''}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-required={required}
          disabled={disabled}
          {...props}
        />

        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-xs text-[var(--color-error)]"
            role="alert"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={hintId}
            className="mt-1.5 text-xs text-[var(--color-hint)]"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
