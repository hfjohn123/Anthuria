import { useSearch } from '@tanstack/react-router';
import { isBoolean } from 'lodash';
import { ColumnFiltersState } from '@tanstack/react-table';

const useInitializeTableFilters = () => {
  const search = useSearch({ strict: false });
  const initialFilters: ColumnFiltersState = [];

  Object.entries(search).forEach(([key, value]) => {
    if (value !== undefined && value !== null && !isBoolean(value)) {
      if (value === 'yesterday') {
        value = [new Date(Date.now() - 1000 * 60 * 60 * 24), new Date()];
      } else if (value === 'last_3_days') {
        value = [new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), new Date()];
      } else if (value === 'last_7_days') {
        value = [new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), new Date()];
      } else if (
        (value as string).startsWith('[') &&
        (value as string).endsWith(']')
      ) {
        value = (value as string)
          .substring(1, (value as string).length - 1)
          .split(',');
        if (
          !isNaN(parseInt((value as string[])[0])) &&
          new Date(parseInt((value as string[])[0])).getTime() > 0
        ) {
          value = (value as string[]).map(
            (v) => new Date(parseInt(v as string)),
          );
        }
      }
      initialFilters.push({
        id: key,
        value: value,
      });
    }
  });
  return initialFilters;
};

export default useInitializeTableFilters;
