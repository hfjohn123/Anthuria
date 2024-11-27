import { FilterFn } from '@tanstack/react-table';
import stemFiltering from '../../common/stemFiltering.ts';
const stemmedFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  if (!value) return false;

  // Split both the filter value and cell value into words
  return stemFiltering(String(value), filterValue);
};

export default stemmedFilter;
