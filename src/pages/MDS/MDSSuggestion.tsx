import { Bot } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { CaretRight, ThumbsUp } from '@phosphor-icons/react';
import {
  MDSFinal,
  NTAICD10,
  ProgressNoteAndSummary,
} from '../../types/MDSFinal.ts';
import clsx from 'clsx';
import { Fragment, useState } from 'react';
import {
  Button,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
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
import getFacetedUniqueValues from '../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../common/getFacetedMinMaxValues.ts';
import Select from 'react-select';
import filterSelectStyles from '../../components/Select/filterSelectStyles.ts';
import FilterValueContainer from '../../components/Select/FilterValueContainer.tsx';
import CheckboxOption from '../../components/Select/CheckboxOption.tsx';
import handleFilterChange from '../../components/Tables/handleFilterChange.ts';
import NTAMDSModal from './NTAMDSModal.tsx';
import MDSCommentModal from './MDSCommentModal.tsx';

const permanentColumnFilters = ['icd10', 'comorbidity'];

export default function MDSSuggestion({
  new_nta_icd10,
  new_slp_icd10,
  new_bims_icd10,
  bims_score,
}: {
  new_nta_icd10: NTAICD10[];
  new_slp_icd10: NTAICD10[];
  new_bims_icd10: string[];
  bims_score: number;
}) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const columns: ColumnDef<NTAICD10>[] = [
    {
      accessorKey: 'icd10',
      header: 'Potential ICD-10 Code',
      filterFn: 'arrIncludesSome',
      cell: (info) => {
        return <p className="whitespace-nowrap">{info.getValue() as string}</p>;
      },
      meta: {
        type: 'categorical',
      },
    },
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
      accessorKey: 'progress_note',
      accessorFn: (row) => row.progress_note,
      cell: (info) => {
        return (
          <div className="max-w-[30vw]">
            <p className="line-clamp-3 whitespace-normal">
              {(info.getValue() as ProgressNoteAndSummary[]).map(
                ({ highlights, explanation }, index) => (
                  <Fragment key={index}>
                    <span
                      data-tooltip-id="explanation-tooltip"
                      data-tooltip-content={explanation}
                      className="whitespace-normal"
                    >
                      Highlights: {highlights}
                    </span>
                    {index <
                      (info.getValue() as ProgressNoteAndSummary[]).length -
                        1 && <br />}
                  </Fragment>
                ),
              )}
            </p>
            <NTAMDSModal
              progressNoteAndSummary={
                info.getValue() as ProgressNoteAndSummary[]
              }
            />
            <Tooltip
              id="explanation-tooltip"
              className="whitespace-normal sm:max-w-[40vw] max-w-[95vw]"
            />
          </div>
        );
      },
      header: 'Progress Note/Explanation',
    },
    {
      accessorKey: 'review',
      accessorFn: (row) => {
        return {
          is_thumb_up: row.is_thumb_up,
          comment: row.comment,
        };
      },
      header: 'Review',
      cell: (info) => {
        const { is_thumb_up, comment } = info.getValue() as {
          is_thumb_up: boolean;
          comment: string;
        };
        return (
          <div className=" flex items-center flex-nowrap gap-2 ">
            {is_thumb_up ? (
              <ThumbsUp
                className="size-4 text-meta-3 cursor-pointer"
                weight="fill"
              />
            ) : (
              <ThumbsUp
                className="size-4 cursor-pointer"
                // onClick={() =>
                //   putComment.mutate({
                //     progress_note_id: row.original.progress_note_id,
                //     trigger_word: trigger_word,
                //     comment: '',
                //     is_thumb_up: true,
                //   })
                // }
              />
            )}
            <MDSCommentModal comment={comment} is_thumb_up={is_thumb_up} />
          </div>
        );
      },
    },
    {
      accessorKey: 'action',
      header: 'Actions',
      cell: () => {
        return <p className="whitespace-nowrap">Coming Soon</p>;
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
    data: new_nta_icd10,
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

  const [tableStateSlp, setTableStateSlp] = useState<TableState>({
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
  const tableSlp = useReactTable({
    data: new_slp_icd10,
    columns,
    state: tableStateSlp,
    onStateChange: setTableStateSlp,
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
    <div className="flex flex-col gap-3 py-4 px-3 w-full ">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold underline">Suggestions</h3>
        <Bot
          data-tooltip-id="bot-tooltip"
          data-tooltip-content="Suggestions generated by AI from Progress Note"
          className="size-6 focus:outline-none"
        />
      </div>
      <Tooltip id="bot-tooltip" />
      <div className="flex flex-col">
        <Disclosure>
          <DisclosureButton className="group">
            <div className="flex items-center py-2 gap-2 hover:bg-[#E6F3FF] ">
              <CaretRight className="ease-in-out transition-all duration-200  group-data-[open]:rotate-90" />
              <h3 className="text-base font-semibold">NTA</h3>
            </div>
          </DisclosureButton>
          <DisclosurePanel
            transition
            className="origin-top transition duration-200 ease-out data-[closed]:-translate-y-3 data-[closed]:opacity-0"
          >
            <div className="py-5 px-5 ">
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
                            tableState.columnFilters.find(
                              (f) => f.id === filter,
                            )?.value as string[]
                          ).map((s) => ({
                            label: s,
                            value: s,
                          }))
                        : []
                    }
                    name={filter}
                    options={Array.from(
                      table
                        ?.getColumn(filter)
                        ?.getFacetedUniqueValues()
                        ?.keys() ?? [],
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
                  {table.getRowModel().rows.map((row, index) => {
                    return (
                      <tr
                        key={row.id}
                        className={clsx(index > 2 && !expanded && 'hidden')}
                      >
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
              {new_nta_icd10.length > 3 && (
                <Button
                  className="text-primary self-start"
                  onClick={() => setExpanded((prev) => !prev)}
                >
                  {expanded ? 'Show Less' : 'Show More'}
                </Button>
              )}
            </div>
          </DisclosurePanel>
        </Disclosure>
        <Disclosure>
          <DisclosureButton className="group ">
            <div className="flex items-center py-2 gap-2 hover:bg-[#E6F3FF] ">
              <CaretRight className="ease-in-out transition-all duration-200  group-data-[open]:rotate-90" />
              <h3 className="text-base font-semibold">SLP</h3>
            </div>
          </DisclosureButton>
          <DisclosurePanel
            transition
            className="origin-top transition duration-200 ease-out data-[closed]:-translate-y-3 data-[closed]:opacity-0"
          >
            <div className="flex flex-col gap-5 px-5 py-5">
              <div className="flex">
                <div className="basis-1/2">
                  <h3 className="font-bold">BIMS Score:</h3>
                  <p>{bims_score}</p>
                </div>
                <div>
                  <h3 className="font-bold">Existing ICD-10:</h3>
                  <p>No existing ICD-10</p>
                </div>
              </div>
              <div>
                <div className="w-full flex items-center mt-1 gap-3">
                  {permanentColumnFilters.map((filter) => (
                    <Select
                      classNames={{ ...filterSelectStyles }}
                      key={filter}
                      placeholder={
                        tableSlp.getColumn(filter)?.columnDef.header as string
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
                        tableStateSlp.columnFilters.find((f) => f.id === filter)
                          ? (
                              tableStateSlp.columnFilters.find(
                                (f) => f.id === filter,
                              )?.value as string[]
                            ).map((s) => ({
                              label: s,
                              value: s,
                            }))
                          : []
                      }
                      name={filter}
                      options={Array.from(
                        tableSlp
                          ?.getColumn(filter)
                          ?.getFacetedUniqueValues()
                          ?.keys() ?? [],
                      ).map((key) => ({
                        label: key,
                        value: key,
                      }))}
                      onChange={(selected, action) => {
                        handleFilterChange(selected, action, setTableState);
                      }}
                    />
                  ))}
                  {tableStateSlp.columnFilters.length > 0 && (
                    <Button
                      color="secondary"
                      onClick={() =>
                        setTableState((prev) => ({
                          ...prev,
                          columnFilters: [],
                        }))
                      }
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <table className="mt-3 w-full">
                  <thead>
                    {tableSlp.getHeaderGroups().map((headerGroup) => (
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
                    {tableSlp.getRowModel().rows.map((row, index) => {
                      return (
                        <tr
                          key={row.id}
                          className={clsx(index > 2 && !expanded && 'hidden')}
                        >
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
                {new_slp_icd10.length == 0 && <p>No ICD-10 Codes</p>}
                {new_slp_icd10.length > 3 && (
                  <Button
                    className="text-primary self-start"
                    onClick={() => setExpanded((prev) => !prev)}
                  >
                    {expanded ? 'Show Less' : 'Show More'}
                  </Button>
                )}
              </div>
            </div>
          </DisclosurePanel>
        </Disclosure>
      </div>
    </div>
  );
}
