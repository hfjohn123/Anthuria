import { ActionMeta, MultiValue } from 'react-select';

const handleFilterChange = (
  selected: MultiValue<{
    label: string;
    value: string;
  }>,
  {
    name,
  }: ActionMeta<{
    label: string;
    value: string;
  }>,
  setTableState: (tableState: any) => void,
) => {
  if (selected.length === 0) {
    setTableState((prev: { columnFilters: any[] }) => ({
      ...prev,
      columnFilters: prev.columnFilters.filter((f) => f.id !== name),
    }));
    return;
  }
  setTableState((prev: { columnFilters: any[] }) => ({
    ...prev,
    columnFilters: prev.columnFilters
      .filter((f) => f.id !== name)
      .concat({
        id: name || '',
        value: selected.map((s) => s.value),
      }),
  }));
};

export default handleFilterChange;
