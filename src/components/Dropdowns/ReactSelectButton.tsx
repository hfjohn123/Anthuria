import Select, { components, DropdownIndicatorProps, GroupBase, OptionProps, ValueContainerProps } from 'react-select';
import { ReactElement } from 'react';
import PropTypes from 'prop-types';

const Option = (
  props: OptionProps<{
    label: string;
    value: string;
  }>
) => (
  <components.Option {...props}>
    <input type="checkbox" checked={props.isSelected} onChange={() => null} />{' '}
    <label>{props.label}</label>
  </components.Option>
);
ReactSelectButton.propTypes = {
  children: PropTypes.node.isRequired,
  // ... other prop types
};

const ValueContainer = ({
                            children,
                            ...props
                          }: ValueContainerProps<{
    label: string;
    value: string;
  }>): ReactElement => {
    const [, input] = children as ReactElement[];
    return (
      <components.ValueContainer {...props}>
        <div>
          {input}
        </div>
      </components.ValueContainer>
    );
  };

export default function ReactSelectButton({ children, ...props }): JSX.Element {

  const DropdownIndicator: React.FC<DropdownIndicatorProps<{ label: string; value: string; }, boolean, GroupBase<{
    label: string;
    value: string;
  }>>> = props => {
    return (
      <components.DropdownIndicator {...props}>
        {children}
      </components.DropdownIndicator>
    );
  };


  return <Select
    components={{ ValueContainer, DropdownIndicator, IndicatorSeparator: null, Option }} {...props}
    menuPosition="absolute"
    classNames={{
      indicatorsContainer: () => '!p-0 ',
      dropdownIndicator: () => 'dark:hover:!text-white',
      control: () => '!border-0 !bg-transparent',
      menu: () => 'dark:bg-form-input min-w-max max-w-max right-0',
      option: () => '!bg-transparent !text-body dark:!text-bodydark',
      valueContainer: () => '!size-0 !p-0'
    }}

  />;

}