import { FilterFn } from '@tanstack/react-table';
import { stemmer } from 'stemmer';

const stemmedFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  if (!value) return false;

  // Convert both the filter value and cell value to stems
  const stemmedFilter = stemmer(filterValue.toLowerCase());
  const stemmedValue = stemmer(String(value).toLowerCase());

  return stemmedValue.includes(stemmedFilter);
};

export default stemmedFilter;
