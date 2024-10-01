import { Table, RowData } from '@tanstack/react-table';
import { getMemoOptions, memo } from '@tanstack/react-table';

export default function getFacetedMinMaxValues<TData extends RowData>(): (
  table: Table<TData>,
  columnId: string,
) => () => undefined | [any, any] {
  return (table, columnId) =>
    memo(
      () => [table.getColumn(columnId)?.getFacetedRowModel()],
      (facetedRowModel) => {
        if (!facetedRowModel) return undefined;

        const uniqueValues = facetedRowModel.flatRows
          .flatMap((flatRow) => flatRow.getUniqueValues(columnId) ?? [])
          .filter((v) => v !== null);

        if (!uniqueValues.length) return;

        let facetedMinValue = uniqueValues[0]!;
        let facetedMaxValue = uniqueValues[uniqueValues.length - 1]!;

        for (const value of uniqueValues) {
          if (value < facetedMinValue) facetedMinValue = value;
          else if (value > facetedMaxValue) facetedMaxValue = value;
        }

        return [facetedMinValue, facetedMaxValue];
      },
      getMemoOptions(table.options, 'debugTable', 'getFacetedMinMaxValues'),
    );
}
