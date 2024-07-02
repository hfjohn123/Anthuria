import DefaultLayout from '../../layout/DefaultLayout';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import SortDownIcon from '../../images/icon/sort-down.svg';
import SortUpIcon from '../../images/icon/sort-up.svg';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Loader from '../../common/Loader';
import ReactSelectButton from '../../components/Dropdowns/ReactSelectButton.tsx';
import AutosizeInput from 'react-18-input-autosize';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from '../../components/Modal.tsx';
import CheckboxOption from '../../components/Select/CheckboxOption.tsx';
import Select, { ActionMeta, ClassNamesConfig, MultiValue } from 'react-select';
import FilterValueContainer from '../../components/Select/FilterValueContainer.tsx';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import { AuthContext } from '../../components/AuthWrapper.tsx';
import DatePicker from 'react-datepicker';
import { Field, Input, Label } from '@headlessui/react';

type TriggerFinal = {
  progress_note_id: number;
  internal_facility_id: string;
  facility_name: string;
  patient_name: string;
  patient_id: string;
  created_by: string;
  created_date: Date;
  revision_by: string;
  revision_date: Date;
  progress_note: string;
  summary: string;
  trigger_words: string[];
  update_time: Date;
  status: string;
};

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
  row: Row<TriggerFinal>,
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

const renderSubComponent = ({ row }: { row: Row<TriggerFinal> }) => {
  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 px-4 justify-evenly py-4">
      {/*<div>{row.getValue('revision_date')}</div>*/}
      <div className="basis-2/5">
        <div className="font-bold"> Progress Note:</div>
        {row.getValue('progress_note')}
        <div className="font-bold mt-2.5"> Progress Note ID:</div>
        {row.getValue('progress_note_id')}
        <div className="font-bold mt-2.5"> Created By:</div>
        {row.getValue('created_by')}
      </div>
      <div className="basis-2/5">
        <div className="font-bold">Summary:</div>
        {row.getValue('summary')}
        <div className="font-bold mt-2.5">Trigger:</div>
        {(row.getValue('trigger_words') as string[])
          .join(', ')
          .replaceAll('_', ' ')}
        <div className="font-bold mt-2.5">Created Date: </div>
        {row.getValue('created_date')}
      </div>
    </div>
  );
};
const permenentColumnFilters = ['facility_name', 'created_by'];

export default function TriggerWords() {
  const { route, user_applications_locations } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { locations } = user_applications_locations.find(
    (d) => d['id'] === 'trigger_words',
  ) || { locations: [] };
  const [additionalFilters, setAdditionalFilters] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [triggerType, setTriggerType] = useState('Predefined');
  const [isOpen, setIsOpen] = useState(false);
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['trigger-words', route],
    queryFn: () => axios.get(`${route}/trigger_final`).then((res) => res.data),
  });
  const updateStatus = useMutation({
    mutationFn: ({
      progress_note_id,
      update_time,
      status,
    }: {
      progress_note_id: number;
      update_time: Date;
      status: string;
    }) =>
      axios.put(`${route}/trigger_final_status`, {
        progress_note_id,
        update_time,
        status,
      }),
    onMutate: async ({
      progress_note_id,
      update_time,
      status,
    }: {
      progress_note_id: number;
      update_time: Date;
      status: string;
    }) => {
      await queryClient.cancelQueries({ queryKey: ['trigger-words', route] });
      const previousData = queryClient.getQueryData<TriggerFinal[]>([
        'trigger-words',
        route,
      ]);
      if (previousData) {
        const newData = [];
        for (let i = 0; i < previousData.length; i++) {
          if (
            previousData[i].progress_note_id === progress_note_id &&
            previousData[i].update_time === update_time
          ) {
            newData.push({
              ...previousData[i],
              status: status,
            });
          } else {
            newData.push(previousData[i]);
          }
        }
        queryClient.setQueryData(['trigger-words', route], newData);
      }
      return { previousData };
    },
    onError: (_error, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['trigger-words', route],
          context.previousData,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trigger-words', route] });
    },
  });
  const { data: temporaryData } = useQuery({
    queryKey: ['temporary-data', route],
    queryFn: () =>
      axios.get(`${route}/trigger_temporary_final`).then((res) => res.data),
  });

  const [newTriggerWord, setNewTriggerWord] = useState<{
    trigger_word: string;
    internal_facility_id: string[];
    date_range: [Date, Date];
  }>({
    trigger_word: '',
    internal_facility_id: [],
    date_range: [new Date(), new Date()],
  });

  const columns = useMemo<ColumnDef<TriggerFinal>[]>(
    () => [
      {
        accessorKey: 'facility_name',
        header: 'Facility',
        meta: {
          // size: '120px',
          type: 'categorical',
        },
        filterFn: 'arrIncludesSome',
      },
      {
        accessorKey: 'patient_name',
        header: 'Patient',
        filterFn: 'includesString',
        meta: {
          // size: '130px',
          type: 'text',
        },
      },
      {
        accessorKey: 'progress_note_id',
        header: 'Progress Note ID',
        meta: {
          // size: '160px',
          type: 'categorical',
        },
        sortingFn: 'text',
        sortDescFirst: false,
        filterFn: (row, columnId, filterValue) => {
          const value = row.getValue(columnId) as string;
          return filterValue.includes(value);
        },
      },
      {
        accessorKey: 'created_date',
        header: 'Created Date',
        cell: (info) => {
          const date = new Date(info.getValue() as string | number | Date);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        },
        filterFn: dateRangeFilterFn,
        meta: {
          type: 'daterange',
        },
      },
      {
        accessorKey: 'created_by',
        header: 'Created By',
        filterFn: 'arrIncludesSome',
        meta: {
          type: 'categorical',
        },
      },
      {
        accessorKey: 'revision_date',
        header: 'Revision Date',
        meta: {
          type: 'daterange',
        },
        filterFn: dateRangeFilterFn,
      },
      {
        accessorKey: 'revision_by',
        header: 'Revision By',
        meta: {
          type: 'categorical',
        },
        filterFn: 'arrIncludesSome',
      },
      {
        accessorKey: 'trigger_words',
        accessorFn: (d) => d.trigger_words,
        header: 'Trigger Words',
        cell: (info) => {
          return (info.getValue() as string[]).join(', ').replaceAll('_', ' ');
        },
        filterFn: (row, columnId, filterValue) => {
          const value = row.getValue(columnId) as string[];
          return value.some((d) =>
            d.includes(filterValue.replaceAll(' ', '_')),
          );
        },
        meta: {
          type: 'text',
        },
      },
      {
        accessorKey: 'progress_note',
        header: 'Progress Note',
        filterFn: 'includesString',
        meta: {
          type: 'text',
        },
      },
      {
        accessorKey: 'summary',
        header: 'Summary',
        filterFn: 'includesString',
        meta: {
          type: 'text',
        },
      },
      {
        accessorKey: 'update_time',
        header: 'Update Time',
        meta: { type: 'daterange' },
        filterFn: dateRangeFilterFn,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: {
          size: '200px',
          type: 'categorical',
        },
        filterFn: 'arrIncludesSome',
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

  const table = useReactTable({
    data: triggerType === 'Predefined' ? data : temporaryData,
    columns,
    getRowCanExpand: () => true,
    // onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedUniqueValues: getFacetedUniqueValues(), // generate unique values for select filter/autocomplete
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for numeric range filter
    getSortedRowModel: getSortedRowModel(),
  });
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
      facility_name: true,
      patient_name: true,
      progress_note_id: true,
      created_date: true,
      created_by: false,
      revision_by: false,
      revision_date: false,
      trigger_words: true,
      progress_note: false,
      summary: false,
      update_time: false,
      status: true,
    },
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
  });
  table.setOptions((prev) => ({
    ...prev,
    state: tableState,
    onStateChange: setTableState,
  }));
  useEffect(() => {
    const usersettings = localStorage.getItem('usersettings');
    if (usersettings) {
      setTableState(JSON.parse(usersettings));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('usersettings', JSON.stringify(tableState));
  }, [tableState]);
  const parentRef = useRef<HTMLDivElement>(null);
  const { rows } =
    data && table.getRowModel() ? table.getRowModel() : { rows: [] };
  // console.log(table.getRowModel().rows.length);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 55.33,
    overscan: 20,
  });

  if (isPending) {
    return <Loader />;
  }
  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <DefaultLayout title={'Clinical Pulse'}>
      <div className="grid grid-cols-12 ">
        <div className="col-span-12 sm:col-span-9 flex items-center">
          <span className="text-xl lg:text-2xl font-bold gap-1 ">
            Trigger Word Type:
          </span>
          <Select
            components={{ IndicatorSeparator: () => null }}
            isSearchable={false}
            isMulti={false}
            options={[
              { label: 'Predefined', value: 'Predefined' },
              { label: 'Temporary', value: 'Temporary' },
            ]}
            value={{ label: triggerType, value: triggerType }}
            onChange={(e) => setTriggerType(e?.value ?? 'Predefined')}
            classNames={{
              control: () =>
                '!bg-transparent !border-0 text-xl lg:text-2xl font-bold !shadow-none',
              valueContainer: () => '!pr-0',
              dropdownIndicator: () => '!pl-0',
              singleValue: () => '!text-body dark:!text-bodydark',
            }}
          />
        </div>
        <Modal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          title="Create a New Trigger Word"
          classNameses={{
            title: 'dark:text-bodydark1',
            button:
              'text-primary dark:text-secondary col-span-12 lg:col-span-3 lg:justify-self-end justify-self-start self-center',
          }}
        >
          <form>
            <div className="flex flex-col gap-4">
              <Field>
                <Label className="text-sm dark:text-bodydark2">
                  New Trigger Word
                </Label>
                <Input
                  required
                  value={newTriggerWord.trigger_word}
                  onChange={(e) => {
                    setNewTriggerWord((prev) => ({
                      ...prev,
                      trigger_word: e.target.value,
                    }));
                  }}
                  className="block py-1.5 border border-stroke rounded outline-none indent-2.5 w-full focus:shadow-filter focus:shadow-blue-400 dark:bg-boxdark dark:text-bodydark1"
                  type="text"
                />
              </Field>
              <Field>
                <Label className="text-sm dark:text-bodydark2">Facility</Label>
                <Select
                  required
                  isMulti
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{ Option: CheckboxOption }}
                  value={newTriggerWord.internal_facility_id
                    .filter((value) =>
                      locations.some(
                        ({ internal_facility_id }) =>
                          internal_facility_id === value,
                      ),
                    )
                    .map((value) => ({
                      label:
                        locations.find(
                          ({ internal_facility_id }) =>
                            internal_facility_id === value,
                        )?.facility_name || '',
                      value,
                    }))}
                  onChange={(e) => {
                    setNewTriggerWord((prev) => ({
                      ...prev,
                      internal_facility_id: e.map(({ value }) => value),
                    }));
                  }}
                  options={locations.map(
                    ({ internal_facility_id, facility_name }) => ({
                      label: facility_name,
                      value: internal_facility_id,
                    }),
                  )}
                  classNames={{
                    control: () =>
                      '!border-stroke dark:bg-boxdark dark:text-bodydark1',
                  }}
                />
              </Field>
              <Field>
                <Label className="block text-sm dark:text-bodydark2">
                  Date Range
                </Label>
                <DatePicker
                  startDate={new Date()}
                  endDate={new Date()}
                  required
                  wrapperClassName="w-full"
                  className="dark:bg-boxdark indent-2.5 py-1.5 border border-stroke rounded w-full outline-none focus:shadow-filter focus:shadow-blue-400 dark:text-bodydark1"
                />
              </Field>
              <div className="flex gap-4">
                <button
                  type="reset"
                  className="dark:text-bodydark1"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white dark:text-bodydark1 rounded p-2"
                  onClick={() => setIsOpen(false)}
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </Modal>

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
            {/* @ts-expect-error Error Unspecific API */}
            <ReactSelectButton
              options={table
                ._getColumnDefs()
                .map((c) => ({ value: c.accessorKey, label: c.header }))}
              isMulti
              hideSelectedOptions={false}
              isClearable={false}
              isSearchable={false}
              closeMenuOnSelect={false}
              value={Object.entries(tableState.columnVisibility)
                .filter(([, v]) => v)
                .map(([k]) => {
                  // @ts-expect-error Error Unspecific API
                  return {
                    label: columns.find((c) => c.accessorKey === k)?.header,
                    value: k,
                  };
                })}
              onChange={(selected: { label: string; value: string }[]) => {
                setTableState((prev) => ({
                  ...prev,
                  columnVisibility: {
                    // @ts-expect-error Error Unspecific API
                    ...columns.reduce(
                      (acc, c) => ({ ...acc, [c.accessorKey]: false }),
                      {},
                    ),
                    ...selected.reduce(
                      (acc, c) => ({ ...acc, [c.value]: true }),
                      {},
                    ),
                  },
                }));
              }}
            >
              <Cog6ToothIcon className="size-6" />
            </ReactSelectButton>
          </div>
          <div className="flex p-1 gap-1.5 flex-wrap">
            {permenentColumnFilters.map((filter) => (
              <Select
                classNames={{ ...selectStyles }}
                key={filter}
                // @ts-expect-error Error Unspecific API
                placeholder={
                  columns.find((c) => c.accessorKey === filter)?.header
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
                  // tableState.columnFilters.filter((c) => c.id === filter).flat().map((c) => ({
                  //   label: c.value,
                  //   value: c.value
                  // }))}
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
                // @ts-expect-error Error already handled
                options={
                  table && table.getColumn(filter)
                    ? Array.from(
                        table.getColumn(filter).getFacetedUniqueValues().keys(),
                      ).map((key) => ({
                        label: key,
                        value: key,
                      }))
                    : []
                }
                onChange={handleFilterChange}
              />
            ))}
            {tableState.columnFilters
              .filter((f) => !permenentColumnFilters.includes(f.id))
              .map((filter) =>
                // @ts-expect-error Error already handled
                columns.find((c) => c.accessorKey === filter.id)?.meta.type ===
                'categorical' ? (
                  <Select
                    classNames={{ ...selectStyles }}
                    key={filter.id}
                    // @ts-expect-error Error Unspecific API
                    placeholder={
                      columns.find((c) => c.accessorKey === filter.id)?.header
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
                    // @ts-expect-error Error already handled
                    options={
                      table && table.getColumn(filter.id)
                        ? Array.from(
                            table
                              .getColumn(filter.id)
                              .getFacetedUniqueValues()
                              .keys(),
                          ).map((key) => ({
                            label: key,
                            value: key,
                          }))
                        : []
                    }
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
                    // @ts-expect-error Error already handled
                  />
                ) : columns.find((c) => c.accessorKey === filter.id)?.meta
                    .type === 'text' ? (
                  <div className="text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 rounded-lg border border-stroke dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                    <span
                      // @ts-expect-error Error already handled
                      className="text-nowrap"
                    >
                      {columns.find((c) => c.accessorKey === filter.id)?.header}{' '}
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
                        // setColumnFilters([...columnFilters.filter((f) => f.id !== filter.id), {
                        //   id: filter.id,
                        //   value: e.target.value
                        // }]);
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
                ) : // @ts-expect-error Error already handled
                columns.find((c) => c.accessorKey === filter.id)?.meta.type ===
                  'daterange' ? (
                  <div className="text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 py-0.5 rounded-lg border border-stroke outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                    <span
                      // @ts-expect-error Error already handled
                      className="text-nowrap"
                    >
                      {columns.find((c) => c.accessorKey === filter.id)?.header}
                    </span>
                    <DatePicker
                      className="outline-0 w-full bg-transparent "
                      autoFocus={true}
                      selectsRange
                      // @ts-expect-error Error already handled
                      startDate={
                        tableState.columnFilters.find((f) => f.id === filter.id)
                          ?.value[0]
                      }
                      // @ts-expect-error Error already handled
                      endDate={
                        tableState.columnFilters.find((f) => f.id === filter.id)
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
                        // setColumnFilters([
                        //   ...columnFilters.filter((f) => f.id !== filter.id),
                        //   {
                        //     id: filter.id,
                        //     value: [start || null, end || null]
                        //   }
                        // ]);
                      }}
                      // @ts-expect-error Error already handled
                      minDate={
                        new Date(
                          table
                            .getColumn(filter.id)
                            ?.getFacetedMinMaxValues()
                            ?.flat()
                            ?.filter((d) => d !== null)[0],
                        )
                      }
                      // @ts-expect-error Error already handled
                      maxDate={
                        new Date(
                          table
                            .getColumn(filter.id)
                            ?.getFacetedMinMaxValues()
                            ?.flat()
                            ?.filter((d) => d !== null)[
                            table
                              .getColumn(filter.id)
                              ?.getFacetedMinMaxValues()
                              ?.flat()
                              ?.filter((d) => d !== null).length - 1
                          ],
                        )
                      }
                      onBlur={() => {
                        // @ts-expect-error Error already handled
                        tableState.columnFilters.find((f) => f.id === filter.id)
                          ?.value.length === 0 &&
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
              closeMenuOnSelect={true}
              hideSelectedOptions={true}
              components={{ IndicatorSeparator: () => null }}
              value={additionalFilters}
              // @ts-expect-error Error already handled
              options={columns
                .filter(
                  (c) =>
                    !tableState.columnFilters.find(
                      (f) => f.id === c.accessorKey,
                    ) && !permenentColumnFilters.includes(c.accessorKey),
                )
                .map((c) => ({
                  label: c.header,
                  // @ts-expect-error Error already handled
                  value: c.accessorKey,
                }))}
              onChange={(newValue) => {
                setTableState((prev) => ({
                  ...prev,
                  columnFilters: [
                    ...prev.columnFilters,
                    {
                      // @ts-expect-error Error already handled
                      id: newValue.value as string,
                      // @ts-expect-error Error already handled
                      value:
                        columns.find((c) => c.accessorKey === newValue?.value)
                          ?.meta?.type === 'categorical' ||
                        columns.find((c) => c.accessorKey === newValue?.value)
                          ?.meta?.type === 'daterange'
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
          <div
            ref={parentRef}
            className="overflow-x-auto max-w-full overflow-y-hidden "
          >
            <table className="border-collapse w-full ">
              <thead className="bg-slate-50 dark:bg-graydark">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {/*<th className="w-3">*/}
                    {/*</th>*/}
                    {headerGroup.headers.map((header) => {
                      return (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          className="py-3 px-3 border-b-2 border-stroke dark:border-strokedark text-left select-none group"
                          onClick={header.column.getToggleSortingHandler()}
                          role="button"
                          style={{
                            width: header.column.columnDef.meta?.size || 'auto',
                          }}
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
                {virtualizer.getVirtualItems().map((virtualRow, index) => {
                  const row = rows[virtualRow.index] as Row<TriggerFinal>;
                  return (
                    <>
                      <tr key={row.id} className="border-t-stroke border-t ">
                        {row.getVisibleCells().map((cell) => {
                          if (cell.column.id === 'status') {
                            if (row.getIsExpanded()) {
                              return (
                                <td
                                  key={cell.id}
                                  className={`py-2 bg-slate-100 px-3 `}
                                >
                                  <div className=" flex items-center flex-nowrap">
                                    {cell.getValue() === 'Needs review' && (
                                      <div className="size-3 rounded bg-primary"></div>
                                    )}
                                    {cell.getValue() === 'Pending' && (
                                      <div className="size-3 rounded bg-warning"></div>
                                    )}
                                    {cell.getValue() === 'Done' && (
                                      <div className="size-3 rounded bg-success"></div>
                                    )}
                                    {cell.getValue() === 'Rejected' && (
                                      <div className="size-3 rounded bg-danger"></div>
                                    )}
                                    <Select
                                      classNames={{
                                        control: () =>
                                          '!border-0 !bg-transparent min-w-max',
                                        valueContainer: () => 'min-w-max',
                                      }}
                                      components={{
                                        IndicatorSeparator: () => null,
                                      }}
                                      value={{
                                        label: cell.getValue(),
                                        value: cell.getValue(),
                                      }}
                                      options={[
                                        {
                                          label: 'Needs review',
                                          value: 'Needs review',
                                        },
                                        {
                                          label: 'Pending',
                                          value: 'Pending',
                                        },
                                        {
                                          label: 'Done',
                                          value: 'Done',
                                        },
                                        {
                                          label: 'Rejected',
                                          value: 'Rejected',
                                        },
                                      ]}
                                      isDisabled={
                                        cell.getValue() === 'Temporary'
                                      }
                                      onChange={(e) => {
                                        updateStatus.mutate({
                                          progress_note_id:
                                            row.getValue('progress_note_id'),
                                          update_time:
                                            row.getValue('update_time'),
                                          status: e?.value as string,
                                        });
                                      }}
                                    />
                                  </div>
                                </td>
                              );
                            }
                            return (
                              <td key={cell.id} className={`py-2 px-3 `}>
                                <div className=" flex items-center flex-nowrap ">
                                  {cell.getValue() === 'Needs review' && (
                                    <div className="size-3 rounded bg-primary"></div>
                                  )}
                                  {cell.getValue() === 'Pending' && (
                                    <div className="size-3 rounded bg-warning"></div>
                                  )}
                                  {cell.getValue() === 'Done' && (
                                    <div className="size-3 rounded bg-success"></div>
                                  )}
                                  {cell.getValue() === 'Rejected' && (
                                    <div className="size-3 rounded bg-danger"></div>
                                  )}
                                  <Select
                                    classNames={{
                                      control: () =>
                                        '!border-0 !bg-transparent min-w-max',
                                      valueContainer: () => 'min-w-max',
                                    }}
                                    isDisabled={cell.getValue() === 'Temporary'}
                                    components={{
                                      IndicatorSeparator: () => null,
                                    }}
                                    value={{
                                      label: cell.getValue(),
                                      value: cell.getValue(),
                                    }}
                                    options={[
                                      {
                                        label: 'Needs review',
                                        value: 'Needs review',
                                      },
                                      {
                                        label: 'Pending',
                                        value: 'Pending',
                                      },
                                      {
                                        label: 'Done',
                                        value: 'Done',
                                      },
                                      {
                                        label: 'Rejected',
                                        value: 'Rejected',
                                      },
                                    ]}
                                    onChange={(e) => {
                                      updateStatus.mutate({
                                        progress_note_id:
                                          row.getValue('progress_note_id'),
                                        update_time:
                                          row.getValue('update_time'),
                                        status: e?.value as string,
                                      });
                                    }}
                                  />
                                </div>
                              </td>
                            );
                          }
                          if (row.getIsExpanded()) {
                            return (
                              <td
                                key={cell.id}
                                className={`py-2 bg-slate-100 px-3 `}
                                onClick={row.getToggleExpandedHandler()}
                                role="button"
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </td>
                            );
                          }
                          return (
                            <td
                              key={cell.id}
                              className={`py-2 px-3`}
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
                            {renderSubComponent({ row })}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
