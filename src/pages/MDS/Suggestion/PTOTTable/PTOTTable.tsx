import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Table,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import { ThumbsDown, ThumbsUp } from '@phosphor-icons/react';
import { useState } from 'react';
import Select from 'react-select';
import { Button } from '@headlessui/react';
import { FunctionalScore, PTOTFinal } from '../../../../types/MDSFinal.ts';
import FilterValueContainer from '../../../../components/Select/FilterValueContainer.tsx';
import CheckboxOption from '../../../../components/Select/CheckboxOption.tsx';
import handleFilterChange from '../../../../components/Tables/handleFilterChange.ts';
import filterSelectStyles from '../../../../components/Select/filterSelectStyles.ts';

// Helper Functions
const getRowSpan = (rowIndex: number, data?: FunctionalScore[]): number => {
  const currentArea = data?.[rowIndex].function_area;
  let span = 1;

  for (let i = rowIndex + 1; i < (data?.length ?? 0); i++) {
    if (data?.[i].function_area === currentArea) {
      span++;
    } else {
      break;
    }
  }

  return span;
};

const hasFooterContent = (table: Table<any>) => {
  return table
    .getFooterGroups()
    .some((group) =>
      group.headers.some(
        (header) => header.column.columnDef.footer !== undefined,
      ),
    );
};

const isFirstInGroup = (
  rowIndex: number,
  id: keyof FunctionalScore,
  rows?: FunctionalScore[],
) => {
  if (rowIndex === 0) return true;
  const prevRow = rows?.[rowIndex - 1];
  const currentRow = rows?.[rowIndex];
  if (!prevRow || !currentRow) return false;
  return prevRow[id] !== currentRow[id];
};

const permanentColumnFilters = ['function_area', 'mds_item'];

export default function PTOTTable({ data }: { data: PTOTFinal }) {
  const [tableData] = useState(data.function_score_all || []);

  const columns: ColumnDef<FunctionalScore>[] = [
    {
      accessorKey: 'function_area',
      header: 'Function Area',
      filterFn: 'arrIncludesSome',
      cell: (info) => {
        const rowIndex = info.row.index;
        if (
          !isFirstInGroup(rowIndex, 'function_area', data.function_score_all)
        ) {
          return null;
        }

        const rowSpan = getRowSpan(rowIndex, data.function_score_all);

        return (
          <td
            rowSpan={rowSpan}
            className="py-2 px-4 border-b border-r border-gray-200 first:border-l-0 align-top bg-white"
          >
            {info.getValue() as string}
          </td>
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
      cell: (info) => (
        <td className="py-2 px-4 border-b border-r border-gray-200">
          {info.getValue() as string}
        </td>
      ),
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'individual_function_score',
      header: 'Function Score',
      cell: (info) => (
        <td className="py-2 px-4 border-b border-r border-gray-200 whitespace-nowrap">
          {info.getValue() as string}
        </td>
      ),
      filterFn: 'arrIncludesSome',
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'suggestion',
      header: 'AI Suggested Conditions',
      cell: (info) => (
        <td className="py-2 px-4 border-b border-r border-gray-200">
          {(info.getValue() as string[])?.join(', ') || ''}
        </td>
      ),
    },
    {
      accessorKey: 'average_function_score',
      header: 'Average Score',
      cell: (info) => {
        const rowIndex = info.row.index;
        if (
          !isFirstInGroup(rowIndex, 'function_area', data.function_score_all)
        ) {
          return null;
        }

        const rowSpan = getRowSpan(rowIndex, data.function_score_all);

        return (
          <td
            rowSpan={rowSpan}
            className="py-2 px-4 border-b border-r border-gray-200 bg-blue-50 align-top"
          >
            {info.getValue() as string}
          </td>
        );
      },
      footer: () => {
        return (
          <td className="py-2 px-4  border-r border-gray-200 bg-blue-50 font-medium">
            Total Score: {data.final_score}
          </td>
        );
      },
    },
    {
      accessorKey: 'review',
      header: 'Review',
      cell: () => (
        <td className="py-2 px-4 border-b border-r border-gray-200 last:border-r-0">
          <div className="flex items-center gap-2">
            <ThumbsUp className="size-5 cursor-pointer hover:text-blue-500" />
            <ThumbsDown className="size-5 cursor-pointer hover:text-red-500" />
          </div>
        </td>
      ),
      footer: () => {
        return (
          <td className="py-2 px-4  border-r border-gray-200 last:border-r-0 font-medium">
            Case Mix Group: {data.mix_group}
          </td>
        );
      },
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
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
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

        <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg mt-3">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="py-2 px-4 border-b border-r border-gray-200 first:border-l-0 last:border-r-0 text-left select-none group whitespace-nowrap text-body-2 bg-gray-50"
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
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row) => {
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      const renderedCell = flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      );
                      return renderedCell;
                    })}
                  </tr>
                );
              })}
            </tbody>

            {tableData.length > 0 && hasFooterContent(table) && (
              <tfoot>
                {table.getFooterGroups().map((footerGroup) => (
                  <tr key={footerGroup.id}>
                    {footerGroup.headers.map((header) => {
                      if (!header.column.columnDef.footer) {
                        return (
                          <td
                            key={header.id}
                            className="py-2 px-4 border-r border-gray-200 first:border-l-0 last:border-r-0"
                          />
                        );
                      }

                      return header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext(),
                          );
                    })}
                  </tr>
                ))}
              </tfoot>
            )}
          </table>
        </div>

        {tableData.length === 0 && <p>No data available</p>}
      </div>
    </div>
  );
}
