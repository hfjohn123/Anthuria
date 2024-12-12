import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function DebouncedInputText({
  required = false,
  size,
  className,
  value,
  setValue,
  debounceDelay = 500,
  placeholder = '',
}: {
  required?: boolean;
  size?: string;
  className?: string;
  value: string;
  setValue: (event: { target: { value: string } }) => void;
  debounceDelay?: number;
  placeholder?: string;
}) {
  const [debouncedValue, setDebouncedValue] = useState<string>(value);

  useEffect(() => {
    // Create a timeout to update the debounced value
    const timeoutId = setTimeout(() => {
      setValue({ target: { value: debouncedValue } });
    }, debounceDelay); // 500ms delay

    // Cleanup timeout on each inputValue change or component unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [debouncedValue]); // Effect runs when inputValue changes

  return (
    <InputText
      type="search"
      value={debouncedValue}
      placeholder={placeholder}
      onChange={(e) => setDebouncedValue(e.target.value)}
      required={required}
      size={size}
      className={clsx('border-0', className)}
    />
  );
}
