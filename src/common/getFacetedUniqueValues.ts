import { Table, RowData } from '@tanstack/react-table';
import { getMemoOptions, memo } from '@tanstack/react-table';

export default function getFacetedUniqueValues<TData extends RowData>(): (
  table: Table<TData>,
  columnId: string,
) => () => Map<any, number> {
  return (table, columnId) =>
    memo(
      () => [table.getColumn(columnId)?.getFacetedRowModel()],
      (facetedRowModel) => {
        if (!facetedRowModel) return new Map();

        const facetedUniqueValues = new Map<any, number>();

        for (const row of facetedRowModel.flatRows) {
          const value = row.getValue(columnId);
          if (Array.isArray(value)) {
            for (const v of value) {
              facetedUniqueValues.set(v, (facetedUniqueValues.get(v) ?? 0) + 1);
            }
          } else if (value) {
            facetedUniqueValues.set(
              value,
              (facetedUniqueValues.get(value) ?? 0) + 1,
            );
          }
        }
        return facetedUniqueValues;
      },
      getMemoOptions(
        table.options,
        'debugTable',
        `getFacetedUniqueValues_${columnId}`,
      ),
    );
}
