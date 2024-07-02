import { components, ValueContainerProps } from 'react-select';
import { ReactElement } from 'react';

const FilterValueContainer = ({
  children,
  ...props
}: ValueContainerProps<{
  label: string;
  value: string;
}>): ReactElement => {
  const [, input] = children as ReactElement[];
  const currentValues = props.getValue();
  return (
    <components.ValueContainer {...props}>
      <div>
        <span>
          {props.selectProps.placeholder}
          {currentValues.length > 0 || props.selectProps.menuIsOpen
            ? ' is'
            : ''}{' '}
          {currentValues.map((val) => val.label).join(', ')}{' '}
          {currentValues.length > 0 && props.selectProps.menuIsOpen ? ',' : ''}
        </span>
        {input}
      </div>
    </components.ValueContainer>
  );
};

export default FilterValueContainer;
