'use client';

import * as React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from 'cn';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'checked'> {
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    const isIndeterminate = checked === 'indeterminate';
    const isChecked = checked === true;

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = isIndeterminate;
      }
    }, [isIndeterminate]);

    return (
      <label
        className={cn(
          'relative inline-flex items-center justify-center cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          type="checkbox"
          ref={inputRef}
          checked={isChecked}
          disabled={disabled}
          onChange={(e) => {
            onCheckedChange?.(e.target.checked);
          }}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            'size-4 rounded-[4px] border border-[#C8C5BE] transition-all flex items-center justify-center bg-white shadow-none',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-[#163728]/30 peer-focus-visible:border-[#163728]',
            (isChecked || isIndeterminate)
              ? 'bg-[#163728] border-[#163728] text-[#F9F8F5]'
              : 'hover:border-[#8E8B85]',
            className
          )}
        >
          {isChecked && <Check className="size-3 stroke-[2.5]" />}
          {isIndeterminate && <Minus className="size-3 stroke-[2.5]" />}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
