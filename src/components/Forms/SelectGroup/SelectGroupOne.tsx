import { useState, forwardRef } from 'react';
import Option from '../../../types/Option.ts';
const SelectGroupOne = forwardRef(function SelectGroupOne(
  {
    options,
    label,
    placeholder,
    required = false,
    className,
    labelLeft = false,
    handleSelectOption,
    selectedOption,
  }: {
    options: string[] | Option[];
    label?: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
    labelLeft?: boolean;
    handleSelectOption?: (option: string) => void;
    selectedOption?: string;
  },
  ref?: React.Ref<HTMLSelectElement>,
) {
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  return (
    <div
      className={`${labelLeft ? 'flex items-center gap-2' : ''} ${className}`}
    >
      <label className="font-medium text-nowrap">{label}</label>

      <div className="relative z-20 dark:bg-form-input group min-w-max">
        <select
          value={selectedOption}
          ref={ref}
          onChange={(e) => {
            handleSelectOption && handleSelectOption(e.target.value);
            changeTextColor();
          }}
          className={`relative z-20 appearance-none rounded-lg border border-stroke bg-white py-1 px-3 pr-10 outline-none focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
            isOptionSelected ? 'text-black dark:text-white' : ''
          } `}
          required={required}
        >
          {placeholder && (
            <option value="" disabled className="text-body dark:text-bodydark">
              {placeholder}
            </option>
          )}
          {options &&
            options.map((option) => {
              if (typeof option === 'string') {
                return (
                  <option
                    key={option}
                    value={option}
                    className="text-body dark:text-bodydark"
                  >
                    {option}
                  </option>
                );
              } else {
                return (
                  <option
                    key={option.key}
                    value={option.value}
                    className="text-body dark:text-bodydark"
                  >
                    {option.display_name}
                  </option>
                );
              }
            })}
        </select>

        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2 hidden group-hover:block sm:block pointer-events-none">
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                fill=""
              ></path>
            </g>
          </svg>
        </span>
      </div>
    </div>
  );
});

export default SelectGroupOne;
