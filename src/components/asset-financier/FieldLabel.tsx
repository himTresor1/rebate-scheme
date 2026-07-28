import { cn } from '../ui/utils';

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
  htmlFor?: string;
  as?: 'label' | 'span';
}

/** Standard label for rebate application fields — red * when required, (Optional) when optional. */
export function FieldLabel({
  children,
  required,
  optional,
  className,
  htmlFor,
  as = 'label',
}: FieldLabelProps) {
  const Component = as;

  return (
    <Component
      htmlFor={as === 'label' ? htmlFor : undefined}
      className={cn(
        'text-sm font-medium text-gray-700',
        as === 'label' && 'block mb-1',
        as === 'span' && 'text-gray-500 font-normal',
        className,
      )}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-0.5" aria-hidden="true">
          *
        </span>
      )}
      {optional && <span className="font-normal text-gray-500 ml-1">(Optional)</span>}
    </Component>
  );
}
