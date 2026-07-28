import * as React from 'react';

import { formatIsoToDisplayInput, parseDisplayDateInput } from '../../utils/dateFormat';
import { Input } from './input';
import { cn } from './utils';

export interface DateInputProps extends Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'onChange'> {
  /** ISO date string (yyyy-mm-dd). */
  value: string;
  onChange: (isoValue: string) => void;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, className, placeholder = 'DD/MM/YYYY', onBlur, ...props }, ref) => {
    const [text, setText] = React.useState(() => formatIsoToDisplayInput(value));
    const [invalid, setInvalid] = React.useState(false);

    React.useEffect(() => {
      setText(formatIsoToDisplayInput(value));
      setInvalid(false);
    }, [value]);

    const commit = (raw: string) => {
      if (!raw.trim()) {
        onChange('');
        setInvalid(false);
        return;
      }

      const iso = parseDisplayDateInput(raw);
      if (iso === null) {
        setInvalid(true);
        return;
      }

      setInvalid(false);
      onChange(iso);
      setText(formatIsoToDisplayInput(iso));
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={text}
        aria-invalid={invalid}
        className={cn(invalid && 'border-destructive', className)}
        onChange={(e) => {
          setText(e.target.value);
          setInvalid(false);
        }}
        onBlur={(e) => {
          commit(e.target.value);
          onBlur?.(e);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit(text);
          }
        }}
        {...props}
      />
    );
  },
);

DateInput.displayName = 'DateInput';

export { DateInput };
