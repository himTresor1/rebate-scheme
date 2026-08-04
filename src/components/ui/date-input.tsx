import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

import { formatIsoToDisplayInput, parseDisplayDateInput } from '../../utils/dateFormat';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar } from './calendar';
import { cn } from './utils';

export interface DateInputProps extends Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'onChange'> {
  /** ISO date string (yyyy-mm-dd). */
  value: string;
  onChange: (isoValue: string) => void;
}

function isoToLocalDate(iso: string): Date | undefined {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  const [, yyyy, mm, dd] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function localDateToIso(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, className, placeholder = 'DD/MM/YYYY', onBlur, disabled, ...props }, ref) => {
    const [text, setText] = React.useState(() => formatIsoToDisplayInput(value));
    const [invalid, setInvalid] = React.useState(false);
    const [pickerOpen, setPickerOpen] = React.useState(false);

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
      <div className={cn('relative', className)}>
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={text}
          aria-invalid={invalid}
          disabled={disabled}
          className={cn('w-full pr-9', invalid && 'border-destructive')}
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
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label="Open calendar"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={isoToLocalDate(value)}
              onSelect={(date) => {
                if (!date) return;
                const iso = localDateToIso(date);
                setInvalid(false);
                onChange(iso);
                setText(formatIsoToDisplayInput(iso));
                setPickerOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

DateInput.displayName = 'DateInput';

export { DateInput };
