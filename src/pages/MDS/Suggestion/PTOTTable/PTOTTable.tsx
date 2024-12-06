import { FunctionalScore, PTOTFinal } from '../../../../types/MDSFinal.ts';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  TableState,
  useReactTable,
} from '@tanstack/react-table';

import { ThumbsDown, ThumbsUp } from '@phosphor-icons/react';
import getFacetedUniqueValues from '../../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../../common/getFacetedMinMaxValues.ts';
import { useState } from 'react';
import Select from 'react-select';
import filterSelectStyles from '../../../../components/Select/filterSelectStyles.ts';
import FilterValueContainer from '../../../../components/Select/FilterValueContainer.tsx';
import CheckboxOption from '../../../../components/Select/CheckboxOption.tsx';
import handleFilterChange from '../../../../components/Tables/handleFilterChange.ts';
import { Button } from '@headlessui/react';
import clsx from 'clsx';

const permanentColumnFilters = ['function_area', 'mds_item'];

const isFirstInGroup = (
  rows: FunctionalScore[],
  rowIndex: number,
  id: string,
) => {
  if (rowIndex === 0) return true;
  const prevRow = rows[rowIndex - 1];
  const currentRow = rows[rowIndex];
  return prevRow[id] !== currentRow[id];
};

export default function PTOTTable({ data }: { data: PTOTFinal }) {
  console.log(data);
  const [tableData] = useState(data.function_score_all || []);
  const columns: ColumnDef<FunctionalScore>[] = [
    {
      accessorKey: 'function_area',
      header: 'Function Area',
      filterFn: 'arrIncludesSome',
      cell: (info) => {
        const rowIndex = info.row.index;
        if (
          !isFirstInGroup(data.function_score_all, rowIndex, 'function_area')
        ) {
          return null;
        }

        return (
          <p className="whitespace-normal with-border">
            {info.getValue() as string}
          </p>
        );
      },
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'mds_item',
      header: 'MDS Item',
      filterFn: 'arrIncludesSome',
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'individual_function_score',
      header: 'Function Score',
      cell: (info) => {
        return <p className="whitespace-nowrap">{info.getValue() as string}</p>;
      },
      filterFn: 'arrIncludesSome',
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'suggestion',
      cell: (info) => {
        return <p className="whitespace-nowrap"></p>;
      },
      header: 'AI Suggested Conditions',
      // footer: (info) => {
      //   const total = info.table
      //     .getRowModel()
      //     .rows.filter((row) => row.original.is_mds_table)
      //     .reduce((sum, row) => sum + row.original.score, 0);
      //   return (
      //     <p className="whitespace-nowrap text-left">
      //       Current score: {total} ({getNTACategory(total)})
      //     </p>
      //   );
      // },
    },
    {
      accessorKey: 'average_function_score',
      header: 'Average Score',
      cell: (info) => {
        const rowIndex = info.row.index;
        if (
          !isFirstInGroup(data.function_score_all, rowIndex, 'function_area')
        ) {
          return null;
        }

        return (
          <td className="whitespace-normal ">{info.getValue() as string}</td>
        );
      },
      // footer: (info) => {
      //   const total = info.table
      //     .getRowModel()
      //     .rows.reduce((sum, row) => sum + row.original.score, 0);
      //   return (
      //     <p className="whitespace-nowrap text-left">
      //       Projected score: {total} ({getNTACategory(total)})
      //     </p>
      //   );
      // },
    },
    {
      accessorKey: 'review',
      header: 'Review',
      cell: () => {
        return (
          <div className="flex items-center gap-2">
            <ThumbsUp className="size-5" />
            <ThumbsDown className="size-5" />
          </div>
        );
      },
      // footer: (info) => {
      //   const total = info.table
      //     .getRowModel()
      //     .rows.filter((row) => !row.original.is_mds_table)
      //     .reduce((sum, row) => sum + row.original.score, 0);
      //   return <p className="whitespace-nowrap text-left">+ {total}</p>;
      // },
    },
  ];
  const [tableState, setTableState] = useState<TableState>({
    globalFilter: '',
    columnSizing: {},
    columnSizingInfo: {
      startOffset: null,
      startSize: null,
      deltaOffset: null,
      deltaPercentage: null,
      isResizingColumn: false,
      columnSizingStart: [],
    },
    rowSelection: {},
    rowPinning: {
      top: [],
      bottom: [],
    },
    expanded: {},
    grouping: [],
    sorting: [],
    columnFilters: [],
    columnPinning: {
      left: [],
      right: [],
    },
    columnOrder: [],
    columnVisibility: {
      icd10: true,
      comorbidity: true,
      progress_note: true,
      review: true,
      action: true,
    },
    pagination: {
      pageIndex: 0,
      pageSize: 30,
    },
  });

  const table = useReactTable({
    data: tableData,
    columns,
    state: tableState,
    onStateChange: setTableState,
    autoResetExpanded: false,
    getRowCanExpand: () => true,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for numeric range filter
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <div>
        <span className="font-bold">Clinical Category:</span>
        <p>{data.clinical_category}</p>
      </div>
      <div>
        <div className="w-full flex items-center gap-3 mt-1">
          {permanentColumnFilters.map((filter) => (
            <Select
              classNames={{ ...filterSelectStyles }}
              key={filter}
              placeholder={table.getColumn(filter)?.columnDef.header as string}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={{
                IndicatorSeparator: () => null,
                ValueContainer: FilterValueContainer,
                Option: CheckboxOption,
              }}
              isClearable={true}
              isMulti={true}
              value={
                tableState.columnFilters.find((f) => f.id === filter)
                  ? (
                      tableState.columnFilters.find((f) => f.id === filter)
                        ?.value as string[]
                    ).map((s) => ({
                      label: s,
                      value: s,
                    }))
                  : []
              }
              name={filter}
              options={Array.from(
                table?.getColumn(filter)?.getFacetedUniqueValues()?.keys() ??
                  [],
              ).map((key) => ({
                label: key,
                value: key,
              }))}
              onChange={(selected, action) => {
                handleFilterChange(selected, action, setTableState);
              }}
            />
          ))}
          {tableState.columnFilters.length > 0 && (
            <Button
              color="secondary"
              onClick={() =>
                setTableState((prev) => ({ ...prev, columnFilters: [] }))
              }
            >
              Clear all
            </Button>
          )}
        </div>
        <table className="mt-3 w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="py-2 border-y-[1.5px] border-stroke dark:border-strokedark text-left select-none group whitespace-nowrap text-body-2"
                    >
                      {header.isPlaceholder ? null : (
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="w-full">
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        className={clsx(
                          'py-2 has-[with-border]:border-b-[1.5px] border-stroke dark:border-strokedark',
                          cell.column.columnDef.meta?.wrap,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            {tableData.length > 0 &&
              table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
          </tfoot>
        </table>
        {tableData.length === 0 && <p>No ICD-10 Codes</p>}
      </div>
    </div>
  );
}
