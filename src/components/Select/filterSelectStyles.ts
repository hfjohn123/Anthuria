import { ClassNamesConfig } from 'react-select';

const filterSelectStyles: ClassNamesConfig<{
  label: string;
  value: string;
}> = {
  control: (state) =>
    state.hasValue
      ? ' !bg-transparent  dark:!border-white !border-body  !min-h-min !rounded-lg !text-sm'
      : '!border-stroke  !bg-transparent !min-h-min !rounded-lg !text-sm',
  singleValue: () => 'dark:text-white ',
  valueContainer: () => '!py-0 !pr-0',
  dropdownIndicator: (state) =>
    state.hasValue
      ? '!hidden'
      : state.isFocused
        ? 'dark:text-white dark:hover:text-white !p-0'
        : '!p-0',
  indicatorsContainer: () => '!p-0',
  clearIndicator: (state) =>
    state.isFocused ? 'dark:text-white dark:hover:text-white !p-0' : '!p-0',
  input: () => '!py-0',
  menu: () => 'dark:bg-form-input min-w-max max-w-max z-999',
  option: () => '!bg-transparent !text-body dark:!text-bodydark',
};

export default filterSelectStyles;
