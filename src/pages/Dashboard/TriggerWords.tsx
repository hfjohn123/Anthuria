import DefaultLayout from '../../layout/DefaultLayout';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import SortDownIcon from '../../images/icon/sort-down.svg';
import SortUpIcon from '../../images/icon/sort-up.svg';
import { ReactElement, useContext, useMemo, useState } from 'react';
import Loader from '../../common/Loader';
import ReactSelectButton from '../../components/Dropdowns/ReactSelectButton.tsx';
import AutosizeInput from 'react-18-input-autosize';
import 'react-datepicker/dist/react-datepicker.css';

import Select, {
  ActionMeta,
  ClassNamesConfig,
  components,
  MultiValue,
  OptionProps,
  ValueContainerProps
} from 'react-select';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState, TableState,
  useReactTable
} from '@tanstack/react-table';
import { AuthContext } from '../../components/AuthWrapper.tsx';
import DatePicker from 'react-datepicker';
// import NumberCards from "../../components/Cards/NumberCards.tsx";

type TriggerFinal = {
  facility_id: string;
  created_date: Date;
  report_date: Date;
  patient_id: string;
  progress_note: string;
  progress_note_id: string;
  revision_date: Date;
  summary: string;
  trigger_id: string;
  status: string;
  created_by: string;
};

const selectStyles: ClassNamesConfig<{
  label: string;
  value: string;
}> = {
  control: (state) => state.hasValue ? '!border-stroke  dark:!border-white dark:bg-form-input !min-h-min !rounded-lg !text-sm' : '!border-stroke dark:!border-white dark:bg-form-input !border-dashed !min-h-min !rounded-lg !text-sm',
  singleValue: () => 'dark:text-white ',
  valueContainer: () => '!py-0 !pr-0',
  dropdownIndicator: (state) =>
    state.hasValue ? '!hidden' :
      state.isFocused ? 'dark:text-white dark:hover:text-white !p-0' : '!p-0',
  indicatorsContainer: () => '!p-0',
  clearIndicator: (state) =>
    state.isFocused ? 'dark:text-white dark:hover:text-white !p-0' : '!p-0',
  input: () => '!py-0',
  menu: () => 'dark:bg-form-input min-w-max max-w-max',
  option: () => '!bg-transparent !text-body dark:!text-bodydark'
};


const ValueContainer = ({
                          children,
                          ...props
                        }: ValueContainerProps<{
  label: string;
  value: string;
}>): ReactElement => {
  const [, input] = children as ReactElement[];
  const currentValues = props.getValue();
  return (
    <components.ValueContainer {...props}>
      <div>
        <span>{props.selectProps.placeholder}{currentValues.length > 0 || props.selectProps.menuIsOpen ? ' is' : ''} {currentValues.map(val => val.label).join(', ')} {currentValues.length > 0 && props.selectProps.menuIsOpen ? ',' : ''}</span>
        {input}
      </div>
    </components.ValueContainer>
  );
};
const Option = (
  props: OptionProps<{
    label: string;
    value: string;
  }>
) => (
  <components.Option {...props}>
    <input type="checkbox" checked={props.isSelected} onChange={() => null} />{' '}
    <label>{props.label}</label>
  </components.Option>
);

const dateRangeFilterFn = (row: Row<TriggerFinal>, columnId: string, filterValue: [Date, Date]) => {
  const value = new Date(row.getValue(columnId) as string | number | Date);
  return filterValue[0] <= value && new Date(new Date(filterValue[1]).setDate(new Date(filterValue[1]).getDate() + 1)) >= value;
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
        Fall
        <div className="font-bold mt-2.5">Generated Date: </div>
        {row.getValue('report_date')}
      </div>
    </div>
  );
};
const permenentColumnFilters = ['facility_id', 'created_by'];

const allInVisble = {
  facility_id: false,
  patient_id: false,
  progress_note: false,
  progress_note_id: false,
  created_date: false,
  summary: false,
  trigger_id: false,
  created_by: false,
  report_date: false,
  revision_date: false,
  status: false
};

export default function TriggerWords() {
  const { route } = useContext(AuthContext);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [additionalFilters, setAdditionalFilters] = useState<{ label: string, value: string } | null>(null);
  const [tableState, setTableState] = useState<TableState>({
    globalFilter: {},
    columnSizing: {},
    columnSizingInfo: {
      startOffset: null,
      startSize: null,
      deltaOffset: null,
      deltaPercentage: null,
      isResizingColumn: false,
      columnSizingStart: []
    },
    rowSelection: {},
    rowPinning: {
      top: [],
      bottom: []
    },
    expanded: {},
    grouping: [],
    sorting: [],
    columnFilters: [],
    columnPinning: {
      left: [],
      right: []
    },
    columnOrder: [],
    columnVisibility: {
      facility_id: true,
      patient_id: true,
      progress_note: false,
      progress_note_id: true,
      created_date: true,
      summary: false,
      trigger_id: false,
      created_by: false,
      report_date: false,
      revision_date: false,
      status: true
    },
    pagination: {
      pageIndex: 0,
      pageSize: 10
    }
  });

  function setColumnFilters(prev: ColumnFiltersState) {
    setTableState((prev) => ({
      ...prev,
      columnFilters: newColumnFilter
    }));
  }

  const sorting = tableState.sorting;
  const columnFilters = tableState.columnFilters;
  const columnVisibility = tableState.columnVisibility;

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['trigger-words', route],
    queryFn: () => axios.get(`${route}/trigger_final`).then((res) => res.data)
  });
  const {
    isPending: isUserSettingPending,
    isError: isUserSettingError,
    data: userSettingData,
    error: userSettingError
  } = useQuery({
    queryKey: ['user-settings', route],
    queryFn: () => axios.get(`${route}/trigger_user_settings`).then((res) => res.data)
  });
  const columns = useMemo<ColumnDef<TriggerFinal>[]>(
    () => [
      {
        accessorKey: 'facility_id',
        header: 'Facility',
        meta: {
          size: '120px',
          type: 'categorical'
        },
        filterFn: 'arrIncludesSome'
      },
      {
        accessorKey: 'patient_id',
        header: 'Patient ID',
        filterFn: 'includesString',
        meta: {
          size: '200px',
          type: 'text'
        }
      },
      {
        accessorKey: 'progress_note',
        header: 'Progress Note',
        filterFn: 'includesString',
        meta: {
          type: 'text'
        }
      },
      {
        accessorKey: 'progress_note_id',
        header: 'Progress Note ID',
        meta: {
          size: '200px',
          type: 'categorical'
        },
        sortingFn: 'text',
        sortDescFirst: false,
        filterFn: (row, columnId, filterValue) => {
          const value = row.getValue(columnId) as string;
          return filterValue.includes(value);
        }

      },
      {
        accessorKey: 'revision_date',
        header: 'Revision Date',
        meta: {
          type: 'daterange'
        },
        filterFn: dateRangeFilterFn
      },
      {
        accessorKey: 'summary',
        header: 'Summary',
        filterFn: 'includesString',
        meta: {
          type: 'text'
        }


      },
      {
        accessorKey: 'trigger_id',
        header: 'Trigger ID',
        filterFn: (row, columnId, filterValue) => {
          const value = row.getValue(columnId) as string;
          return filterValue.includes(value);
        },
        meta: {
          type: 'categorical'
        }


      },
      {
        accessorKey: 'report_date',
        header: 'Report Date',
        filterFn: dateRangeFilterFn,
        meta: {
          type: 'daterange'
        }
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
          type: 'daterange'
        }
      },
      {
        accessorKey: 'created_by',
        header: 'Created By',
        filterFn: 'arrIncludesSome',
        meta: {
          type: 'categorical'
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: {
          size: '200px',
          type: 'categorical'
        },
        filterFn: 'arrIncludesSome'
      }

    ],
    []
  );
  const handleFilterChange = (selected: MultiValue<{
    label: string;
    value: string;
  }>, { name }: ActionMeta<{
    label: string;
    value: string;
  }>) => {
    if (selected.length === 0) {
      setColumnFilters(prevColumnFilters => {
        return prevColumnFilters.filter((f) => f.id !== name);
      });
      return;
    }
    setColumnFilters((prev) => {
      return [...prev.filter((f) => f.id !== name), { id: name || '', value: selected.map((s) => s.value) }];
    });
  };

  const [columnVisibility, setColumnVisibility] = useState({
    facility_id: true,
    patient_id: true,
    progress_note: false,
    progress_note_id: true,
    created_date: true,
    summary: false,
    trigger_id: false,
    created_by: false,
    report_date: false,
    revision_date: false,
    status: true
  });

  const table = useReactTable({
    data,
    columns,
    state: tableState,
    onSortingChange: setSorting,
    getRowCanExpand: () => true,
    // onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedUniqueValues: getFacetedUniqueValues(), // generate unique values for select filter/autocomplete
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for numeric range filter
    getSortedRowModel: getSortedRowModel()
  });
// const saveUserSettings = useMutation({
//   mutationFn: () => {
//     return axios.post('/user_settings', {
//       settings: columnVisibility
//     });
//   }
// })


  if (isPending || isUserSettingPending) {
    return <Loader />;
  }
  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  console.log(table.getState());

  return (
    <DefaultLayout title={'Clinical Pulse'}>
      <div className="grid grid-cols-12 ">
        <div className=" mt-5 col-span-12 bg-white dark:bg-boxdark shadow-default ">
          <div className="flex items-center border-b border-stroke">
            <MagnifyingGlassIcon
              className="size-5 text-body dark:text-bodydark mx-1" />
            <input
              onChange={(e) => {
                setColumnFilters([{ id: 'patient_id', value: e.target.value }]);
              }}
              value={columnFilters.find((filter) => filter.id === 'patient_id')?.value as string || ''}
              placeholder="Search Patient's name or ID"
              className=" w-full py-2 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {/* @ts-expect-error Error Unspecific API */}
            <ReactSelectButton options={table._getColumnDefs().map((c) => ({ value: c.accessorKey, label: c.header }))}
                               isMulti hideSelectedOptions={false}
                               isClearable={false}
                               isSearchable={false}
                               closeMenuOnSelect={false}
                               value={Object.entries(columnVisibility).filter(([, v]) => v).map(([k]) => {
                                 // @ts-expect-error Error Unspecific API
                                 return { label: columns.find((c) => c.accessorKey === k)?.header, value: k };
                               })}
                               onChange={(selected: { label: string; value: string }[]) => {
                                 setColumnVisibility(() => {
                                   return {
                                     ...allInVisble,
                                     ...selected.reduce((acc, curr) => {
                                       // @ts-expect-error Error Unspecific API
                                       acc[curr.value] = true;
                                       return acc;
                                     }, {} as Record<keyof typeof columnVisibility, boolean>)
                                   };
                                 });
                               }}>

              <Cog6ToothIcon className="size-6"
              />
            </ReactSelectButton>
          </div>
          <div className="flex p-1 gap-1.5 flex-wrap">
            {permenentColumnFilters.map((filter) => (
              <Select classNames={{ ...selectStyles }}
                      key={filter}
                // @ts-expect-error Error Unspecific API
                      placeholder={columns.find((c) => c.accessorKey === filter)?.header}
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      components={{ IndicatorSeparator: () => null, ValueContainer, Option }}
                      isClearable={true}
                      isMulti={true}
                      value={(columnFilters.find((f) => f.id === filter)) ? ((columnFilters.find((f) => f.id === filter)?.value as string[]).map((s) => ({
                        label: s,
                        value: s
                      }))) : []}
                      name={filter}
                // @ts-expect-error Error already handled
                      options={(table && table.getColumn(filter)) ? Array.from(table.getColumn(filter).getFacetedUniqueValues().keys()).map((key) => ({
                        label: key,
                        value: key
                      })) : []}
                      onChange={handleFilterChange}
              />
            ))}
            {columnFilters.filter((f) => !permenentColumnFilters.includes(f.id) && f.id !== 'patient_id').map((filter) => (
              // @ts-expect-error Error already handled
              columns.find((c) => c.accessorKey === filter.id)?.meta.type === 'categorical' ?
                <Select classNames={{ ...selectStyles }}
                        key={filter.id}
                  // @ts-expect-error Error Unspecific API
                        placeholder={columns.find((c) => c.accessorKey === filter.id)?.header}
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        defaultMenuIsOpen={true}
                        autoFocus={true}
                        components={{ IndicatorSeparator: () => null, ValueContainer, Option }}
                        isClearable={true}
                        isMulti={true}
                        value={(columnFilters.find((f) => f.id === filter.id)) ? ((columnFilters.find((f) => f.id === filter.id)?.value as string[]).map((s) => ({
                          label: s,
                          value: s
                        }))) : []}
                        name={filter.id}
                  // @ts-expect-error Error already handled
                        options={(table && table.getColumn(filter.id)) ? Array.from(table.getColumn(filter.id).getFacetedUniqueValues().keys()).map((key) => ({
                          label: key,
                          value: key
                        })) : []}
                        onChange={handleFilterChange}
                        onMenuClose={() => {
                          (columnFilters.find((f) => f.id === filter.id)?.value as string[]).length === 0 &&
                          setColumnFilters(columnFilters.filter((f) => f.id !== filter.id));
                        }}
                  // @ts-expect-error Error already handled
                /> : columns.find((c) => c.accessorKey === filter.id)?.meta.type === 'text' ?
                  <div
                    className="text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 rounded-lg border border-stroke dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <span
                      // @ts-expect-error Error already handled
                      className="text-nowrap">{columns.find((c) => c.accessorKey === filter.id)?.header} includes</span>
                    <AutosizeInput
                      inputStyle={{ outline: 'none', background: 'transparent' }}
                      className="text-sm"
                      onChange={(e: { target: { value: string; }; }) => {
                        setColumnFilters([...columnFilters.filter((f) => f.id !== filter.id), {
                          id: filter.id,
                          value: e.target.value
                        }]);
                      }}
                      autoFocus={true}
                      onBlur={() => {
                        (columnFilters.find((f) => f.id === filter.id)?.value as string[]).length === 0 &&
                        setColumnFilters(columnFilters.filter((f) => f.id !== filter.id));
                      }}
                      minWidth="30"
                      value={columnFilters.find((f) => f.id === filter.id)?.value as string || ''}
                    />
                    <button
                      onClick={() => setColumnFilters(columnFilters.filter((f) => f.id !== filter.id))}
                      className="fill-[rgb(204,204,204)]">
                      <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"
                      >
                        <path
                          d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
                      </svg>
                    </button>
                  </div> :
                  // @ts-expect-error Error already handled
                  columns.find((c) => c.accessorKey === filter.id)?.meta.type === 'daterange' ? <div
                    className="text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 py-0.5 rounded-lg border border-stroke outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <span
                      // @ts-expect-error Error already handled
                      className="text-nowrap">{columns.find((c) => c.accessorKey === filter.id)?.header}</span>
                    <DatePicker
                      className="outline-0 w-full bg-transparent "
                      autoFocus={true}
                      selectsRange

                      // @ts-expect-error Error already handled
                      startDate={columnFilters.find((f) => f.id === filter.id)?.value[0]}
                      // @ts-expect-error Error already handled
                      endDate={columnFilters.find((f) => f.id === filter.id)?.value[1]}
                      onChange={([start, end]: [Date | null, Date | null]) => {
                        setColumnFilters([
                          ...columnFilters.filter((f) => f.id !== filter.id),
                          {
                            id: filter.id,
                            value: [start || null, end || null]
                          }
                        ]);
                      }}
                      // @ts-expect-error Error already handled
                      minDate={new Date(table.getColumn(filter.id)?.getFacetedMinMaxValues()?.flat()?.filter((d) => d !== null)[0])}
                      // @ts-expect-error Error already handled
                      maxDate={new Date(table.getColumn(filter.id)?.getFacetedMinMaxValues()?.flat()?.filter((d) => d !== null)[table.getColumn(filter.id)?.getFacetedMinMaxValues()?.flat()?.filter((d) => d !== null).length - 1])}
                      onBlur={() => {
                        (columnFilters.find((f) => f.id === filter.id)?.value as Date[]).length === 0 &&
                        setColumnFilters(columnFilters.filter((f) => f.id !== filter.id));
                      }}
                    />
                    <button
                      onClick={() => setColumnFilters(columnFilters.filter((f) => f.id !== filter.id))}
                      className="fill-[rgb(204,204,204)]">
                      <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"
                      >
                        <path
                          d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
                      </svg>
                    </button>
                  </div> : null
            ))}
            <Select classNames={{ ...selectStyles }}
                    placeholder="Add Filter"
                    closeMenuOnSelect={true}
                    hideSelectedOptions={true}
                    components={{ IndicatorSeparator: () => null }}
                    value={additionalFilters}
              // @ts-expect-error Error already handled
                    options={table._getColumnDefs().filter((c) => !permenentColumnFilters.includes(c.accessorKey) && c.accessorKey !== 'patient_id').map((c) => ({
                      label: c.header,
                      // @ts-expect-error Error already handled
                      value: c.accessorKey
                    }))}
                    onChange={(newValue) => {
                      setColumnFilters([...columnFilters, {
                        // @ts-expect-error Error already handled
                        id: newValue.value as string,
                        value: []
                      }]);
                      setAdditionalFilters(null);
                    }}

            />
            {columnFilters.length > 0 &&
              <button className="text-sm" onClick={() => setColumnFilters([])}>Clear all</button>}
          </div>

          <table className="border-collapse w-full">
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
                      className="py-3 border-b-2 border-stroke dark:border-strokedark text-left select-none group first:pl-3"
                      onClick={header.column.getToggleSortingHandler()}
                      role="button"
                      style={{
                        width: header.column.columnDef.meta?.size || 'auto'
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}{{
                            asc: <img src={SortUpIcon} alt="Sort Up Icon" className="inline size-5" />,
                            desc: <img src={SortDownIcon} alt="Sort Down Icon" className="inline size-5" />
                          }[header.column.getIsSorted() as string] ?? null ??
                          {
                            asc: <img src={SortUpIcon} alt="Sort Up Icon"
                                      className=" size-5 hidden group-hover:inline " />,
                            desc: <img src={SortDownIcon} alt="Sort Down Icon"
                                       className=" size-5 hidden group-hover:inline" />
                          }[header.column.getNextSortingOrder() as string] ?? null}
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
                <>
                  <tr key={row.id} className="border-t-stroke border-t ">
                    {/*<td*/}
                    {/*  className="py-2"*/}
                    {/*  role="button"*/}
                    {/*  onClick={row.getToggleExpandedHandler()}*/}
                    {/*>*/}
                    {/*  {row.getIsExpanded() ? (*/}
                    {/*    <ChevronDownIcon className="text-body dark:text-bodydark size-6 inline pb-1" />*/}
                    {/*  ) : (*/}
                    {/*    <ChevronRightIcon className="text-body dark:text-bodydark size-6 inline pb-1" />*/}
                    {/*  )}*/}
                    {/*</td>*/}
                    {row.getVisibleCells().map((cell, idx) => {
                      if (cell.column.id === 'status') {
                        if (row.getIsExpanded()) {
                          return <td key={cell.id}
                                     className={`py-3 bg-slate-100 flex items-center gap-2 flex-nowrap ${idx === 0 ? 'pl-3' : ''} `}>
                            <div className={`bg-red-500 rounded size-3`}></div>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>;

                        }
                        return (
                          <td key={cell.id}
                              className={`py-3 flex items-center gap-2 flex-nowrap ${idx === 0 ? 'pl-3' : ''} `}>
                            <div className={`bg-red-500 rounded size-3`}></div>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      }
                      if (row.getIsExpanded()) {
                        return (
                          <td key={cell.id} className={`py-2 bg-slate-100 ${idx === 0 ? 'pl-3' : ''} `}
                              onClick={row.getToggleExpandedHandler()} role="button">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      }

                      return (
                        <td
                          key={cell.id}
                          className={`py-2 ${idx === 0 ? 'pl-3' : ''} `}
                          role="button"
                          onClick={row.getToggleExpandedHandler()}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {row.getIsExpanded() && (
                    <tr>
                      <td colSpan={row.getVisibleCells().length + 1}>
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
    </DefaultLayout>
  );
}
