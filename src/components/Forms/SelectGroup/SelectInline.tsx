import { useState } from 'react';

function SelectInline({
  options,
  placeholder,
  selectedOption,
  setSelectedOption,
  className,
}: {
  options: string[];
  placeholder?: string;
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  className?: string;
}) {
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  return (
    <div className="relative z-20 bg-transparent dark:bg-form-input">
      <select
        value={selectedOption}
        onChange={(e) => {
          setSelectedOption(e.target.value);
        }}
        className={`relative z-20 appearance-none bg-transparent outline-none transition text-primary font-medium text-wrap ${className}`}
        onBlur={() => setIsOptionSelected(false)}
        onMouseDown={() => setIsOptionSelected(true)}
        onFocus={() => setIsOptionSelected(true)}
        onMouseLeave={() => setIsOptionSelected(false)}
      >
        {placeholder && (
          <option value="" disabled className="text-body dark:text-bodydark">
            {placeholder}
          </option>
        )}
        {options &&
          options.map((option) => (
            <option
              key={option}
              value={option}
              className="text-body dark:text-bodydark"
            >
              {option}
            </option>
          ))}
      </select>
    </div>
  );
}

export default SelectInline;
