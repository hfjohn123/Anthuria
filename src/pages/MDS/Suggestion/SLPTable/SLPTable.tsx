import {
  SLPItem_General,
  SLPItem_comorbidities_present,
  ProgressNoteAndSummary,
  SLPEntry,
} from '../../../../types/MDSFinal.ts';
import { Fragment, useState } from 'react';
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
import Select from 'react-select';
import filterSelectStyles from '../../../../components/Select/filterSelectStyles.ts';
import FilterValueContainer from '../../../../components/Select/FilterValueContainer.tsx';
import CheckboxOption from '../../../../components/Select/CheckboxOption.tsx';
import handleFilterChange from '../../../../components/Tables/handleFilterChange.ts';
import { Button } from '@headlessui/react';
import clsx from 'clsx';
import EvidenceModal from '../EvidenceModal.tsx';

const permanentColumnFilters = ['condition', 'is_mds'];

export default function SLPTable({
  data,
}: {
  data: (SLPItem_General | SLPItem_comorbidities_present)[];
}) {
  const columns: ColumnDef<SLPItem_General | SLPItem_comorbidities_present>[] =
    [
      {
        accessorKey: 'condition',
        header: 'Condition',
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
        accessorKey: 'is_mds',
        accessorFn: (row) => (row.is_mds ? 'Yes' : 'No'),
        header: 'Is Already in MDS Table',
        cell: (info) => {
          return (
            <p className="whitespace-nowrap">{info.getValue() as string}</p>
          );
        },
        filterFn: 'arrIncludesSome',
        meta: {
          type: 'categorical',
        },
      },
      {
        accessorKey: 'slp_entry',
        accessorFn: (row) => row.slp_entry,
        cell: (info) => {
          const value = info.getValue() as Array<
            ProgressNoteAndSummary | SLPEntry
          >;
          if (value && value.length > 0) {
            if (info.row.original.condition === 'Comorbidities Present') {
              return (
                <>
                  {value.map((entry, index) => {
                    entry = entry as SLPEntry;
                    return (
                      <Fragment key={entry.comorbidity}>
                        {entry.new_icd10 && entry.new_icd10.length > 0 ? (
                          <EvidenceModal
                            icd10={{
                              icd10: entry.comorbidity,
                              progress_note: entry.new_icd10.flatMap(
                                (d) => d.progress_note,
                              ),
                              is_thumb_up: null,
                              comment: null,
                            }}
                          />
                        ) : (
                          <span>{entry.comorbidity}</span>
                        )}
                        {index < value.length - 1 && ' | '}
                      </Fragment>
                    );
                  })}
                </>
              );
            } else {
              return (
                <EvidenceModal
                  icd10={{
                    icd10: 'Suggestion',
                    progress_note: value as ProgressNoteAndSummary[],
                    is_thumb_up: null, // or some default value
                    comment: null, // or some default value
                  }}
                />
              );
            }
          }
          return null;
        },
        header: 'AI Suggested Conditions',
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
    <div className="flex flex-col gap-5 px-5 py-5">
      {/*<div className="flex justify-between">*/}
      {/*  <div>*/}
      {/*    <h3 className="font-bold">Cognitive Impairment</h3>*/}
      {/*    <SLPDetail data={data.cognitive_impairment} />*/}
      {/*  </div>*/}
      {/*  <div>*/}
      {/*    <h3 className="font-bold">Acute Neurologic Condition</h3>*/}
      {/*    <SLPDetail data={data.acute_neurologic_condition} />*/}
      {/*  </div>*/}
      {/*  <div>*/}
      {/*    <h3 className="font-bold">Mechanically Altered Diet</h3>*/}

      {/*    <SLPDetail data={data.mechanically_altered_diet} />*/}
      {/*  </div>*/}
      {/*  <div>*/}
      {/*    <h3 className="font-bold">Swallowing Disorder</h3>*/}
      {/*    <SLPDetail data={data.swallowing_disorder} />*/}
      {/*  </div>*/}
      {/*</div>*/}
      <div>
        <h3 className="font-bold">Comorbidities Present</h3>
        {/*{!objIsEmpty(data.comorbidities_present) ? (*/}
        <>
          <div className="w-full flex items-center gap-3 mt-1">
            {permanentColumnFilters.map((filter) => (
              <Select
                classNames={{ ...filterSelectStyles }}
                key={filter}
                placeholder={
                  table.getColumn(filter)?.columnDef.header as string
                }
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
          </table>
          {/*{data.comorbidities_present.slp_entry?.length === 0 && (*/}
          {/*  <p>No ICD-10 Codes</p>*/}
          {/*)}*/}
        </>
        {/*) : (*/}
        {/*  <p>No Record</p>*/}
        {/*)}*/}
      </div>
    </div>
  );
}
