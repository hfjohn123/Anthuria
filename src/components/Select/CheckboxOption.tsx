import { components, OptionProps } from 'react-select';

const CheckboxOption = (
  props: OptionProps<{
    label: string;
    value: string;
  }>,
) => (
  <components.Option
    {...props}
    className={'Option-' + props.label.replace(' ', '-')}
  >
    <input type="checkbox" checked={props.isSelected} onChange={() => null} />{' '}
    <label>{props.label}</label>
  </components.Option>
);

export default CheckboxOption;
