import DefaultLayout from '../../../layout/DefaultLayout.tsx';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import SortDownIcon from '../../../images/icon/sort-down.svg';
import SortUpIcon from '../../../images/icon/sort-up.svg';
import { Tooltip } from 'react-tooltip';
import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import Loader from '../../../common/Loader';
import AutosizeInput from 'react-18-input-autosize';
import 'react-datepicker/dist/react-datepicker.css';
import CheckboxOption from '../../../components/Select/CheckboxOption.tsx';
import Select, { ActionMeta, ClassNamesConfig, MultiValue } from 'react-select';
import FilterValueContainer from '../../../components/Select/FilterValueContainer.tsx';
import {
  ColumnDef,
  ColumnDefTemplate,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  HeaderContext,
  Row,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import getFacetedUniqueValues from '../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../common/getFacetedMinMaxValues.ts';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import DatePicker from 'react-datepicker';
import Modal from '../../../components/Modal/Modal.tsx';
import { EventFinal } from '../../../types/EventFinal.ts';
import HyperLink from '../../../components/Basic/HyerLink.tsx';
import EventTrackerData from '../../Test/Data/EventTrackerData.ts';
import ProgressNote from './ProgressNote.tsx';
import ProgressTracking from './ProgressTracking.tsx';

const selectStyles: ClassNamesConfig<{
  label: string;
  value: string;
}> = {
  control: (state) =>
    state.hasValue
      ? '!border-stroke  dark:!border-white dark:bg-form-input !min-h-min !rounded-lg !text-sm'
      : '!border-stroke dark:!border-white dark:bg-form-input !border-dashed !min-h-min !rounded-lg !text-sm',
  singleValue: () => 'dark:text-white ',
  valueContainer: () => '!py-0 !pr-0',
  dropdownIndicator: (state) =>
    state.hasValue
      ? '!hidden'
      : state.isFocused
        ? 'dark:text-white dark:hover:text-white !p-0'
        : '!p-0',
  indicatorsContainer: () => '!p-0',
  clearIndicator: (state) =>
    state.isFocused ? 'dark:text-white dark:hover:text-white !p-0' : '!p-0',
  input: () => '!py-0',
  menu: () => 'dark:bg-form-input min-w-max max-w-max',
  option: () => '!bg-transparent !text-body dark:!text-bodydark',
};

const dateRangeFilterFn = (
  row: Row<EventFinal>,
  columnId: string,
  filterValue: [Date, Date],
) => {
  const value = new Date(row.getValue(columnId) as string | number | Date);
  return (
    filterValue[0] <= value &&
    new Date(
      new Date(filterValue[1]).setDate(new Date(filterValue[1]).getDate() + 1),
    ) >= value
  );
};

const renderSubComponent = ({ row }: { row: Row<EventFinal> }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 px-4 text-sm py-4 flex flex-col gap-5">
      <ProgressTracking row={row} />
      <ProgressNote row={row} />
    </div>
  );
};
const permenentColumnFilters = ['facility_name', 'occurrence'];
export default function EventTracker() {
  const { route, user_data } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [additionalFilters, setAdditionalFilters] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  // const { isPending, isError, data, error } = useQuery({
  //   queryKey: ['trigger-words', route],
  //   queryFn: () => axios.get(`${route}/trigger_final`).then((res) => res.data),
  // });
  const data = EventTrackerData();
  const columns = useMemo<ColumnDef<EventFinal>[]>(
    () => [
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
          if (user_data.email == 'athenaw.design@gmail.com') {
            return 'John Doe';
          } else {
            if (info.row.original.upstream === 'MTX') {
              return (
                <>
                  <HyperLink
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
        cell: (info) => {
          const date = new Date(info.getValue() as string | number | Date);
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
    ],
    [],
  );
  const handleFilterChange = (
    selected: MultiValue<{
      label: string;
      value: string;
    }>,
    {
      name,
    }: ActionMeta<{
      label: string;
      value: string;
    }>,
  ) => {
    if (selected.length === 0) {
      setTableState((prev) => ({
        ...prev,
        columnFilters: prev.columnFilters.filter((f) => f.id !== name),
      }));
      return;
    }
    setTableState((prev) => ({
      ...prev,
      columnFilters: prev.columnFilters
        .filter((f) => f.id !== name)
        .concat({
          id: name || '',
          value: selected.map((s) => s.value),
        }),
    }));
  };
  if (localStorage.getItem('clearStorage') !== '1') {
    localStorage.removeItem('recent');
    localStorage.removeItem('eventTackerUserVisibilitySettings');
    localStorage.setItem('clearStorage', '1');
  }
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
    sorting: [],
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
            facility_name: true,
            patient_name: true,
            created_date: false,
            created_by: false,
            progress_notes: false,
          }
        : {
            facility_name: true,
            patient_name: true,
            created_date: true,
            created_by: true,
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

  // if (isPending) {
  //   return <Loader />;
  // }
  // if (isError) {
  //   return <div>Error: {error.message}</div>;
  // }
  return (
    <DefaultLayout title={'Clinical Pulse'}>
      <h1 className="text-2xl font-bold mt-3 sm:mt-0">Open Event</h1>
      <div className="grid grid-cols-12 mt-2">
        <div className=" mt-5 col-span-12 bg-white dark:bg-boxdark shadow-default  ">
          <div className="flex items-center border-b border-stroke">
            <MagnifyingGlassIcon className="size-5 text-body dark:text-bodydark mx-1" />
            <input
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

            <Modal
              isOpen={showSettingsModal}
              setIsOpen={setShowSettingsModal}
              title={'Clinical Pulse Settings'}
              button={<Cog6ToothIcon />}
              classNameses={{
                button: 'size-6 mr-2 text-gray-900 hover:text-primary',
              }}
            >
              <div>
                <label>Column Visibility</label>
                <Select
                  options={table
                    .getAllColumns()
                    .map((c) => {
                      return {
                        value: c.id,
                        label: c.columnDef.header,
                      };
                    })
                    .filter(({ value }) => value !== 'status')}
                  isMulti
                  hideSelectedOptions={false}
                  isClearable={false}
                  isSearchable={false}
                  closeMenuOnSelect={false}
                  classNames={{ control: () => 'w-90' }}
                  value={Object.entries(tableState.columnVisibility)
                    .filter(([, v]) => v)
                    .map(([k]) => {
                      return {
                        label: table.getColumn(k)?.columnDef.header,
                        value: k,
                      };
                    })}
                  onChange={(
                    selected: MultiValue<{
                      label:
                        | ColumnDefTemplate<HeaderContext<EventFinal, unknown>>
                        | undefined;
                      value: string;
                    }>,
                  ) => {
                    setTableState((prev) => ({
                      ...prev,
                      columnVisibility: {
                        ...table
                          .getAllColumns()
                          .reduce((acc, c) => ({ ...acc, [c.id]: false }), {}),
                        ...selected.reduce(
                          (acc, c) => ({ ...acc, [c.value]: true }),
                          {},
                        ),
                      },
                    }));
                  }}
                />
              </div>
            </Modal>
          </div>
          <div className="flex p-1 gap-1.5 flex-wrap">
            {permenentColumnFilters.map((filter) => (
              <Select
                classNames={{ ...selectStyles }}
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
                onChange={handleFilterChange}
              />
            ))}
            {tableState.columnFilters
              .filter((f) => !permenentColumnFilters.includes(f.id))
              .map((filter) =>
                table.getColumn(filter.id)?.columnDef.meta?.type ===
                'categorical' ? (
                  <Select
                    classNames={{ ...selectStyles }}
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
                      ValueContainer: FilterValueContainer,
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
                    onChange={handleFilterChange}
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
                ) : (table.getColumn(filter.id)?.columnDef?.meta?.type ||
                    '') === 'text' ? (
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
                          tableState.columnFilters.find(
                            (f) => f.id === filter.id,
                          )?.value as string
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
                        (tableState.columnFilters.find(
                          (f) => f.id === filter.id,
                        )?.value as string) || ''
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
                        ).columnFilters.find((f) => f.id === filter.id)
                          ?.value[0]
                      }
                      endDate={
                        (
                          tableState as {
                            columnFilters: { id: string; value: any }[];
                          }
                        ).columnFilters.find((f) => f.id === filter.id)
                          ?.value[1]
                      }
                      onChange={([start, end]: [Date | null, Date | null]) => {
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
              classNames={{ ...selectStyles }}
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
                        table.getColumn(newValue?.value as string)?.columnDef
                          .meta?.type === 'categorical' ||
                        table.getColumn(newValue?.value as string)?.columnDef
                          .meta?.type === 'daterange'
                          ? []
                          : '',
                    },
                  ],
                }));
                // setColumnFilters([...columnFilters, {
                //   // @ts-expect-error Error already handled
                //   id: newValue.value as string,
                //   value: []
                // }]);
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
                              className={`py-2 px-3 w-[${cell.column.getSize() || 'auto'}] text-sm ${cell.column.columnDef.meta?.wrap == 'pre' ? 'whitespace-pre-wrap' : cell.column.columnDef.meta?.wrap ? '' : 'whitespace-nowrap'} ${row.getIsExpanded() && 'bg-slate-100 dark:bg-slate-700'}`}
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
                          {/* 2nd row is a custom 1 cell row */}
                          <td colSpan={row.getVisibleCells().length}>
                            {renderSubComponent({
                              row,
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
          <div className="flex items-center gap-2 px-2 py-2  w-full text-sm sm:text-base ">
            <button
              className="border rounded p-1 disabled:opacity-30 hidden sm:block"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<<'}
            </button>
            <button
              className="border rounded p-1 disabled:opacity-30"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<'}
            </button>
            <button
              className="border rounded p-1 disabled:opacity-30"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>'}
            </button>
            <button
              className="border rounded p-1 disabled:opacity-30 hidden sm:block"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>>'}
            </button>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <div>Page</div>
              <strong>
                {tableState.pagination.pageIndex + 1} of{' '}
                {table.getPageCount().toLocaleString()}
              </strong>
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap text-sm sm:text-base">
              | Go to page:
              <input
                type="number"
                onChange={(e) => {
                  const page = e.target.value
                    ? Math.min(
                        Number(e.target.value) - 1,
                        table.getPageCount() - 1,
                      )
                    : 0;
                  table.setPageIndex(page);
                }}
                value={tableState.pagination.pageIndex + 1}
                className="border border-stroke p-1 rounded w-6 sm:w-16 bg-transparent"
              />
            </span>
            <select
              value={tableState.pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="bg-transparent"
            >
              {[10, 20, 30, 50, 100, 200].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
