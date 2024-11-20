import { NTAEntry } from '../../../../types/MDSFinal.ts';
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
import { Fragment, useState } from 'react';
import getFacetedUniqueValues from '../../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../../common/getFacetedMinMaxValues.ts';
import Select from 'react-select';
import filterSelectStyles from '../../../../components/Select/filterSelectStyles.ts';
import FilterValueContainer from '../../../../components/Select/FilterValueContainer.tsx';
import CheckboxOption from '../../../../components/Select/CheckboxOption.tsx';
import handleFilterChange from '../../../../components/Tables/handleFilterChange.ts';
import { Button } from '@headlessui/react';
import clsx from 'clsx';
import EvidenceModal from '../EvidenceModal.tsx';
import { ThumbsDown, ThumbsUp } from '@phosphor-icons/react';

const permanentColumnFilters = ['comorbidity', 'is_mds_table'];

function getNTACategory(score: number) {
  if (score === 0) {
    return 'NF';
  }
  if (score < 3) {
    return 'NE';
  }
  if (score < 6) {
    return 'ND';
  }
  if (score < 9) {
    return 'NC';
  }
  if (score < 12) {
    return 'NB';
  }
  return 'NA';
}

export default function NTATable({ data }: { data: NTAEntry[] }) {
  const columns: ColumnDef<NTAEntry>[] = [
    {
      accessorKey: 'comorbidity',
      header: 'Comorbidity',
      filterFn: 'arrIncludesSome',
      cell: (info) => {
        return (
          <p className="whitespace-normal max-w-[30vw]">
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
      accessorKey: 'is_mds_table',
      accessorFn: (row) => (row.is_mds_table ? 'Yes' : 'No'),
      header: 'Is Already in MDS Table',
      cell: (info) => {
        return <p className="whitespace-nowrap">{info.getValue() as string}</p>;
      },
      filterFn: 'arrIncludesSome',
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'new_icd10',
      accessorFn: (row) => row.new_icd10?.map((d) => d.icd10) || [],
      cell: (info) => {
        return (
          <p className="whitespace-nowrap">
            {info.row.original.new_icd10?.map((d, index, array) => {
              return (
                <Fragment key={d.icd10}>
                  <EvidenceModal icd10={d} />
                  {index < array.length - 1 && ', '}
                </Fragment>
              );
            })}
          </p>
        );
      },
      header: 'AI Suggested Conditions',
      footer: (info) => {
        const total = info.table
          .getRowModel()
          .rows.filter((row) => row.original.is_mds_table)
          .reduce((sum, row) => sum + row.original.score, 0);
        return (
          <p className="whitespace-nowrap text-left">
            Current score: {total} ({getNTACategory(total)})
          </p>
        );
      },
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
      footer: (info) => {
        const total = info.table
          .getRowModel()
          .rows.filter((row) => !row.original.is_mds_table)
          .reduce((sum, row) => sum + row.original.score, 0);
        return <p className="whitespace-nowrap text-left">+ {total}</p>;
      },
    },
    {
      accessorKey: 'score',
      header: 'Score',

      footer: (info) => {
        const total = info.table
          .getRowModel()
          .rows.reduce((sum, row) => sum + row.original.score, 0);
        return (
          <p className="whitespace-nowrap text-left">
            Projected score: {total} ({getNTACategory(total)})
          </p>
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
    data: data,
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
    <div className="py-5 px-5 flex flex-col gap-5 ">
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
                          'py-2 border-b-[1.5px] border-stroke dark:border-strokedark',
                          cell.column.columnDef.meta?.wrap,
                        )}
                      >
                        {
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          ) as string
                        }
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            {data.length > 0 &&
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
        {data.length === 0 && <p>No ICD-10 Codes</p>}
      </div>
    </div>
  );
}
