import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { Input } from '@headlessui/react';
import Select from 'react-select';
import filterSelectStyles from '../../../components/Select/filterSelectStyles.ts';
import filterValueContainer from '../../../components/Select/FilterValueContainer.tsx';
import CheckboxOption from '../../../components/Select/CheckboxOption.tsx';
import handleFilterChange from '../../../components/Tables/handleFilterChange.ts';
import AutosizeInput from 'react-18-input-autosize';
import DatePicker from 'react-datepicker';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import SortUpIcon from '../../../images/icon/sort-up.svg';
import SortDownIcon from '../../../images/icon/sort-down.svg';
import { Fragment, useState, useEffect } from 'react';
import PageNavigation from '../../../components/Tables/PageNavigation.tsx';
import { EventFinal } from '../../../types/EventFinal.ts';
import ProgressTracking from './ProgressTracking.tsx';
import ProgressNote from './ProgressNote.tsx';
import getFacetedUniqueValues from '../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../common/getFacetedMinMaxValues.ts';
import HyperLink from '../../../components/Basic/HyerLink.tsx';
import dateRangeFilterFn from '../../../common/dateRangeFilterFn.ts';
import NumberCards from '../../../components/Cards/NumberCards.tsx';
import clsx from 'clsx';

const permenentColumnFilters = ['facility_name', 'occurrence'];

const renderSubComponent = ({
  row,
  now,
}: {
  row: Row<EventFinal>;
  now: Date;
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 px-3 text-sm py-4 flex flex-col gap-5">
      <ProgressTracking row={row} now={now} />
      <ProgressNote row={row} />
    </div>
  );
};
export default function EventTrackerTable({
  data,
  now,
}: {
  data: EventFinal[];
  now: Date;
}) {
  const [additionalFilters, setAdditionalFilters] = useState<{
    label: string;
    value: string;
  } | null>(null);

  const columns: ColumnDef<EventFinal>[] = [
    {
      accessorKey: 'facility_name',
      header: 'Facility',
      meta: {
        wrap: false,
        type: 'categorical',
      },
      filterFn: 'arrIncludesSome',
    },
    {
      accessorKey: 'patient_name',
      cell: (info) => {
        if (info.row.original.upstream === 'MTX') {
          return (
            <>
              <HyperLink
                className="patient_link"
                tooltip_content={'View Patient in MaxtrixCare'}
                href={`https://clearviewhcm.matrixcare.com/core/selectResident.action?residentID=${info.row.original.patient_id}`}
              >
                {info.row.getValue('patient_name')}
              </HyperLink>
              <p className="text-body-2">
                {info.row.getValue('facility_name')}
              </p>
            </>
          );
        }
        if (info.row.original.upstream === 'PCC') {
          return (
            <>
              <HyperLink
                className="patient_link"
                tooltip_content={'View Patient in PCC'}
                href={`https://www19.pointclickcare.com/admin/client/clientlist.jsp?ESOLtabtype=C&ESOLglobalclientsearch=Y&ESOLclientid=${info.row.original.patient_id}&ESOLfacid=${info.row.original.internal_facility_id.split('_').pop()}&ESOLsave=P`}
              >
                {info.row.getValue('patient_name')}
              </HyperLink>
              <p className="text-body-2">
                {info.row.getValue('facility_name')}
              </p>
            </>
          );
        }
        return info.renderValue();
      },
      header: 'Patient',
      filterFn: 'includesString',
      meta: {
        wrap: 'pre',
        type: 'text',
      },
    },
    {
      accessorKey: 'occurrence',
      cell: (info) => {
        return (
          <>
            <p>{info.row.getValue('occurrence')}</p>
            <p className="text-body-2">#{info.row.original.event_id}</p>
          </>
        );
      },
      header: 'Occurrence',
      filterFn: 'arrIncludesSome',
      meta: { wrap: false, type: 'categorical' },
    },
    {
      accessorKey: 'occurrence_date',
      header: 'Occurrence Date',
      accessorFn: (row) => new Date(row.occurrence_date),
      cell: (info) => {
        const date = info.getValue() as Date;
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString(
          navigator.language,
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        )}`;
      },
      filterFn: dateRangeFilterFn,
      meta: {
        wrap: false,
        type: 'daterange',
      },
    },
    {
      accessorKey: 'created_by',
      header: 'Created By',
      filterFn: 'arrIncludesSome',
      meta: {
        wrap: false,
        type: 'categorical',
      },
    },
    {
      accessorKey: 'progress_notes',
      accessorFn: (row) => {
        return row.progress_notes.map((s) => s.note);
      },
      header: 'Progress Notes',
      filterFn: 'includesString',
      meta: {
        wrap: true,
        type: 'text',
      },
    },
    {
      accessorKey: 'open_tasks',
      accessorFn: (row) => {
        return row.tasks
          .filter((t) => t.status !== 'Closed')
          .map((s) => s.task);
      },
      cell: (info) => {
        return <p>{(info.getValue() as string[]).length} Tasks</p>;
      },
      header: 'Open Tasks',
      filterFn: 'arrIncludesSome',
      sortingFn: (rowA, rowB, columnId) => {
        return (rowA.getValue(columnId) as string[]).length <
          (rowB.getValue(columnId) as string[]).length
          ? -1
          : 1;
      },
      meta: {
        wrap: true,
        type: 'categorical',
      },
    },
    {
      accessorKey: 'due_tasks',
      accessorFn: (row) => {
        return row.tasks
          .filter((t) => t.status !== 'Closed')
          .filter(
            (t) =>
              new Date(t.due) < new Date(now.getTime() + 1000 * 60 * 60 * 24),
          )
          .map((s) => s.task);
      },
      cell: (info) => {
        return (
          <p className="text-red-warning font-semibold">
            {(info.getValue() as string[]).length} Tasks
          </p>
        );
      },
      header: 'Due Today',
      sortingFn: (rowA, rowB, columnId) => {
        return (rowA.getValue(columnId) as string[]).length <
          (rowB.getValue(columnId) as string[]).length
          ? -1
          : 1;
      },
      filterFn: 'arrIncludesSome',
      meta: {
        wrap: true,
        type: 'categorical',
      },
    },
  ];

  const eventTackerUserVisibilitySettings = localStorage.getItem(
    'eventTackerUserVisibilitySettings',
  );
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
    sorting: [
      {
        id: 'due_tasks',
        desc: true,
      },
    ],
    columnFilters: [],
    columnPinning: {
      left: [],
      right: [],
    },
    columnOrder: [],
    columnVisibility: eventTackerUserVisibilitySettings
      ? JSON.parse(eventTackerUserVisibilitySettings)
      : window.screen.width < 1024
        ? {
            facility_name: false,
            occurrence: true,
            patient_name: true,
            occurrence_date: true,
            created_by: true,
            open_tasks: true,
            due_tasks: true,
            progress_notes: false,
          }
        : {
            facility_name: false,
            occurrence: true,
            patient_name: true,
            occurrence_date: true,
            created_by: true,
            open_tasks: true,
            due_tasks: true,
            progress_notes: false,
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
    getRowCanExpand: () => true,
    autoResetPageIndex: false,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    autoResetExpanded: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for numeric range filter
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    localStorage.setItem(
      'eventTackerUserVisibilitySettings',
      JSON.stringify(tableState.columnVisibility),
    );
  }, [tableState.columnVisibility]);

  useEffect(() => {
    setTableState((prev) => ({
      ...prev,
      pagination: {
        pageIndex: 0,
        pageSize: prev.pagination.pageSize,
      },
    }));
  }, [tableState.columnFilters, tableState.globalFilter]);

  return (
    <>
      <div className="grid xl:grid-cols-4 grid-cols-3 sm:gap-3">
        {Array.from(
          table.getColumn('occurrence')?.getFacetedUniqueValues().keys() ?? [],
        ).map((word) => (
          <NumberCards
            key={word}
            className={clsx(
              'col-span-1',
              'cursor-pointer',
              (
                (tableState.columnFilters.find(({ id }) => id === 'occurrence')
                  ?.value as string[]) || []
              ).includes(word)
                ? 'bg-slate-200 dark:bg-slate-600 '
                : 'bg-white dark:bg-boxdark hover:bg-slate-100 hover:dark:bg-slate-700',
            )}
            value={
              table
                .getColumn('occurrence')
                ?.getFacetedUniqueValues()
                .get(word) || 0
            }
            title={word}
            onClick={() => {
              let filter =
                (tableState.columnFilters.find(({ id }) => id === 'occurrence')
                  ?.value as string[]) || [];
              if (filter.includes(word)) {
                filter = filter.filter((f) => f !== word);
              } else {
                filter.push(word);
              }
              if (filter.length === 0) {
                setTableState((prev) => ({
                  ...prev,
                  columnFilters: prev.columnFilters.filter(
                    ({ id }) => id !== 'occurrence',
                  ),
                }));
                return;
              }
              setTableState((prev) => ({
                ...prev,
                columnFilters: [
                  ...prev.columnFilters.filter(({ id }) => id !== 'occurrence'),
                  {
                    id: 'occurrence',
                    value: filter,
                  },
                ],
              }));
            }}
          />
        ))}
      </div>

      <div className="col-span-12 bg-white dark:bg-boxdark shadow-default  ">
        <div className="flex items-center border-b border-stroke">
          <MagnifyingGlassIcon className="size-5 text-body dark:text-bodydark mx-1" />
          <Input
            onChange={(e) => {
              setTableState((prev) => ({
                ...prev,
                globalFilter: e.target.value,
              }));
            }}
            value={tableState.globalFilter}
            placeholder="Global Search"
            className=" w-full py-2 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <div className="flex p-1 gap-1.5 flex-wrap">
          {permenentColumnFilters.map((filter) => (
            <Select
              classNames={{ ...filterSelectStyles }}
              key={filter}
              placeholder={table.getColumn(filter)?.columnDef.header as string}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={{
                IndicatorSeparator: () => null,
                ValueContainer: filterValueContainer,
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
              onChange={(selected, action) =>
                handleFilterChange(selected, action, setTableState)
              }
            />
          ))}
          {tableState.columnFilters
            .filter((f) => !permenentColumnFilters.includes(f.id))
            .map((filter) =>
              table.getColumn(filter.id)?.columnDef.meta?.type ===
              'categorical' ? (
                <Select
                  classNames={{ ...filterSelectStyles }}
                  key={filter.id}
                  placeholder={
                    table.getColumn(filter.id)?.columnDef?.header as string
                  }
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  defaultMenuIsOpen={true}
                  autoFocus={true}
                  components={{
                    IndicatorSeparator: () => null,
                    ValueContainer: filterValueContainer,
                    Option: CheckboxOption,
                  }}
                  isClearable={true}
                  isMulti={true}
                  value={
                    tableState.columnFilters.find((f) => f.id === filter.id)
                      ? (
                          tableState.columnFilters.find(
                            (f) => f.id === filter.id,
                          )?.value as string[]
                        ).map((s) => ({
                          label: s,
                          value: s,
                        }))
                      : []
                  }
                  name={filter.id}
                  options={Array.from(
                    table
                      ?.getColumn(filter.id)
                      ?.getFacetedUniqueValues()
                      ?.keys() ?? [],
                  ).map((key) => ({
                    label: key,
                    value: key,
                  }))}
                  onChange={(selected, action) => {
                    handleFilterChange(selected, action, setTableState);
                  }}
                  onMenuClose={() => {
                    (
                      tableState.columnFilters.find((f) => f.id === filter.id)
                        ?.value as string[]
                    ).length === 0 &&
                      setTableState((prev) => ({
                        ...prev,
                        columnFilters: prev.columnFilters.filter(
                          (f) => f.id !== filter.id,
                        ),
                      }));
                  }}
                />
              ) : (table.getColumn(filter.id)?.columnDef?.meta?.type || '') ===
                'text' ? (
                <div className="text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 rounded-lg border border-stroke dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  <span className="text-nowrap">
                    {table.getColumn(filter.id)?.columnDef.header as string}{' '}
                    includes
                  </span>
                  <AutosizeInput
                    inputStyle={{
                      outline: 'none',
                      background: 'transparent',
                    }}
                    className="text-sm"
                    onChange={(e: { target: { value: string } }) => {
                      setTableState((prev) => ({
                        ...prev,
                        columnFilters: prev.columnFilters.map((f) =>
                          f.id === filter.id
                            ? {
                                ...f,
                                value: e.target.value,
                              }
                            : f,
                        ),
                      }));
                    }}
                    autoFocus={true}
                    onBlur={() => {
                      (
                        tableState.columnFilters.find((f) => f.id === filter.id)
                          ?.value as string
                      ).length === 0 &&
                        setTableState((prev) => ({
                          ...prev,
                          columnFilters: prev.columnFilters.filter(
                            (f) => f.id !== filter.id,
                          ),
                        }));
                    }}
                    minWidth="30"
                    value={
                      (tableState.columnFilters.find((f) => f.id === filter.id)
                        ?.value as string) || ''
                    }
                  />
                  <button
                    onClick={() => {
                      setTableState((prev) => ({
                        ...prev,
                        columnFilters: prev.columnFilters.filter(
                          (f) => f.id !== filter.id,
                        ),
                      }));
                    }}
                    className="fill-[rgb(204,204,204)]"
                  >
                    <svg
                      height="20"
                      width="20"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
                    </svg>
                  </button>
                </div>
              ) : table.getColumn(filter.id)?.columnDef.meta?.type ===
                'daterange' ? (
                <div className="text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 py-0.5 rounded-lg border border-stroke outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  <span className="text-nowrap">
                    {table.getColumn(filter.id)?.columnDef.header as string}
                  </span>
                  <DatePicker
                    className="outline-0 w-full bg-transparent "
                    autoFocus={true}
                    selectsRange
                    startDate={
                      (
                        tableState as {
                          columnFilters: { id: string; value: any }[];
                        }
                      ).columnFilters.find((f) => f.id === filter.id)?.value[0]
                    }
                    endDate={
                      (
                        tableState as {
                          columnFilters: { id: string; value: any }[];
                        }
                      ).columnFilters.find((f) => f.id === filter.id)?.value[1]
                    }
                    onChange={([start, end]: [Date | null, Date | null]) => {
                      end && end.setHours(23, 59, 59, 999);
                      setTableState((prev) => ({
                        ...prev,
                        columnFilters: prev.columnFilters.map((f) =>
                          f.id === filter.id
                            ? {
                                ...f,
                                value: [start || null, end || null],
                              }
                            : f,
                        ),
                      }));
                    }}
                    minDate={
                      new Date(
                        table
                          .getColumn(filter.id)
                          ?.getFacetedMinMaxValues()
                          ?.flat()
                          ?.filter((d) => d !== null)[0] ?? '',
                      )
                    }
                    maxDate={
                      new Date(
                        table
                          .getColumn(filter.id)
                          ?.getFacetedMinMaxValues()
                          ?.flat()
                          ?.filter((d) => d !== null)[
                          (table
                            .getColumn(filter.id)
                            ?.getFacetedMinMaxValues()
                            ?.flat()
                            ?.filter((d) => d !== null)?.length ?? 1) - 1
                        ] ?? '',
                      )
                    }
                    onBlur={() => {
                      (
                        tableState.columnFilters.find(
                          (f) => f.id === filter.id,
                        ) as { id: string; value: any }
                      )?.value.length === 0 &&
                        setTableState((prev) => ({
                          ...prev,
                          columnFilters: prev.columnFilters.filter(
                            (f) => f.id !== filter.id,
                          ),
                        }));
                    }}
                  />
                  <button
                    onClick={() =>
                      setTableState((prev) => ({
                        ...prev,
                        columnFilters: prev.columnFilters.filter(
                          (f) => f.id !== filter.id,
                        ),
                      }))
                    }
                    className="fill-[rgb(204,204,204)]"
                  >
                    <svg
                      height="20"
                      width="20"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
                    </svg>
                  </button>
                </div>
              ) : null,
            )}
          <Select
            classNames={{ ...filterSelectStyles }}
            placeholder="Add Filter"
            isMulti={false}
            closeMenuOnSelect={true}
            hideSelectedOptions={true}
            components={{ IndicatorSeparator: () => null }}
            value={additionalFilters}
            options={table
              .getAllColumns()
              .filter(
                (c) =>
                  !tableState.columnFilters.find((f) => f.id === c.id) &&
                  !permenentColumnFilters.includes(c.id),
              )
              .map((c) => ({
                label: c.columnDef.header as string,
                value: c.id,
              }))}
            onChange={(newValue) => {
              setTableState((prev) => ({
                ...prev,
                columnFilters: [
                  ...prev.columnFilters,
                  {
                    id: (newValue?.value as string) ?? '',
                    value:
                      table.getColumn(newValue?.value as string)?.columnDef.meta
                        ?.type === 'categorical' ||
                      table.getColumn(newValue?.value as string)?.columnDef.meta
                        ?.type === 'daterange'
                        ? []
                        : '',
                  },
                ],
              }));
              setAdditionalFilters(null);
            }}
          />
          {tableState.columnFilters.length > 0 && (
            <button
              className="text-sm"
              onClick={() =>
                setTableState((prev) => ({ ...prev, columnFilters: [] }))
              }
            >
              Clear all
            </button>
          )}
        </div>
        <div className="block overflow-x-auto max-w-full overflow-y-hidden ">
          <table className="w-full border-b-2 border-b-stroke">
            <thead className="bg-slate-50 dark:bg-graydark">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className="py-3 px-3 border-b-2 border-stroke dark:border-strokedark text-left select-none group whitespace-nowrap "
                        onClick={header.column.getToggleSortingHandler()}
                        role="button"
                      >
                        {header.isPlaceholder ? null : (
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{
                              asc: (
                                <img
                                  src={SortUpIcon}
                                  alt="Sort Up Icon"
                                  className="inline size-5"
                                />
                              ),
                              desc: (
                                <img
                                  src={SortDownIcon}
                                  alt="Sort Down Icon"
                                  className="inline size-5"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ??
                              null ??
                              {
                                asc: (
                                  <img
                                    src={SortUpIcon}
                                    alt="Sort Up Icon"
                                    className=" size-5 hidden group-hover:inline "
                                  />
                                ),
                                desc: (
                                  <img
                                    src={SortDownIcon}
                                    alt="Sort Down Icon"
                                    className=" size-5 hidden group-hover:inline"
                                  />
                                ),
                              }[
                                header.column.getNextSortingOrder() as string
                              ] ??
                              null}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                return (
                  <Fragment key={row.id}>
                    <tr className="border-t-stroke border-t ">
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td
                            key={cell.id}
                            className={`py-2 px-3 w-[${cell.column.getSize() || 'auto'}] text-sm ${cell.column.columnDef.meta?.wrap == 'pre' ? 'whitespace-pre-wrap' : cell.column.columnDef.meta?.wrap ? '' : 'whitespace-nowrap'} ${row.getIsExpanded() ? 'bg-slate-100 dark:bg-slate-700' : 'table_row'}`}
                            role="button"
                            onClick={row.getToggleExpandedHandler()}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {row.getIsExpanded() && (
                      <tr>
                        <td colSpan={row.getVisibleCells().length}>
                          {renderSubComponent({
                            row,
                            now,
                          })}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <PageNavigation table={table} tableState={tableState} />
      </div>
    </>
  );
}
