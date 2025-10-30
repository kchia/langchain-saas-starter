import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /** Checkbox label text */
  label?: string;
  /** Whether checkbox is checked */
  checked?: boolean;
  /** Whether checkbox is in indeterminate state */
  indeterminate?: boolean;
  /** Called when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Checkbox component with label and indeterminate state support
 *
 * @example
 * <Checkbox
 *   label="Accept terms and conditions"
 *   checked={accepted}
 *   onCheckedChange={setAccepted}
 * />
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      checked = false,
      indeterminate = false,
      onCheckedChange,
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const checkboxId = id || React.useId();

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Handle indeterminate state
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked);
    };

    return (
      <div className={`flex items-center ${className || ''}`}>
        <input
          ref={inputRef}
          id={checkboxId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="
            peer
            h-4 w-4
            rounded
            border-2
            transition-colors
            cursor-pointer
            disabled:cursor-not-allowed
            disabled:opacity-50
            border-[var(--color-border)]
            checked:bg-[var(--color-backgroundChecked)]
            checked:border-[var(--color-borderChecked)]
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            focus:ring-[var(--color-borderChecked)]
          "
          aria-checked={indeterminate ? 'mixed' : checked}
          aria-disabled={disabled}
          role="checkbox"
          {...props}
        />

        {label && (
          <label
            htmlFor={checkboxId}
            className={`
              ml-2
              text-sm
              select-none
              cursor-pointer
              peer-disabled:cursor-not-allowed
              peer-disabled:opacity-50
              text-[var(--color-label)]
              peer-disabled:text-[var(--color-labelDisabled)]
            `}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/**
 * CheckboxGroup component for managing multiple checkboxes
 */
export interface CheckboxGroupProps {
  /** Array of checkbox options */
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  /** Currently selected values */
  value?: string[];
  /** Called when selection changes */
  onChange?: (value: string[]) => void;
  /** Group label */
  label?: string;
  /** Whether all checkboxes are disabled */
  disabled?: boolean;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value = [],
  onChange,
  label,
  disabled,
}) => {
  const handleChange = (optionValue: string, checked: boolean) => {
    const newValue = checked
      ? [...value, optionValue]
      : value.filter((v) => v !== optionValue);
    onChange?.(newValue);
  };

  return (
    <div role="group" aria-label={label}>
      {label && (
        <div className="text-sm font-medium text-[var(--color-label)] mb-2">
          {label}
        </div>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={value.includes(option.value)}
            onCheckedChange={(checked) => handleChange(option.value, checked)}
            disabled={disabled || option.disabled}
          />
        ))}
      </div>
    </div>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';
