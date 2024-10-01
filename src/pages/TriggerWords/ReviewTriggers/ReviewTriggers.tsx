import DefaultLayout from '../../../layout/DefaultLayout.tsx';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import SortDownIcon from '../../../images/icon/sort-down.svg';
import SortUpIcon from '../../../images/icon/sort-up.svg';
import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import Loader from '../../../common/Loader';
import AutosizeInput from 'react-18-input-autosize';
import 'react-datepicker/dist/react-datepicker.css';
import CheckboxOption from '../../../components/Select/CheckboxOption.tsx';
import Select, { MultiValue } from 'react-select';
import handleFilterChange from '../../../components/Tables/handleFilterChange.ts';
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
import NumberCards from '../../../components/Cards/NumberCards.tsx';
import clsx from 'clsx';
import Modal from '../../../components/Modal/Modal.tsx';
import { createToast } from '../../../hooks/fireToast.tsx';
import { Button, Field, Input, Label } from '@headlessui/react';
import filterSelectStyles from '../../../components/Select/filterSelectStyles.ts';
import dateRangeFilterFn from '../../../common/dateRangeFilterFn.ts';
import HyperLink from '../../../components/Basic/HyerLink.tsx';
import { DownloadSimple } from '@phosphor-icons/react';
import { TriggerFinal } from '../../../types/TriggerFinal.ts';
import PageNavigation from '../../../components/Tables/PageNavigation.tsx';
import exportExcel from '../../../common/excelExport.ts';
import TriggerNoteDetail from './TriggerNoteDetail.tsx';

const predefinedTriggerWords = [
  'Fall',
  'Unwanted Behavior',
  'Condition Change',
  'Abuse',
  'Neglect',
  'Wound/Ulcer',
  'Weight Change',
];
const PERMANENT_COLUMN_FILTERS = ['facility_name', 'trigger_word'];

const initialTableState: TableState = {
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
  columnVisibility:
    window.screen.width < 1024
      ? {
          facility_name: false,
          patient_name: true,
          progress_note_id: false,
          created_date: false,
          created_by: false,
          revision_by: false,
          revision_date: true,
          trigger_word: true,
          progress_note: false,
          summary: false,
          update_time: false,
          has_events: false,
        }
      : {
          facility_name: true,
          patient_name: true,
          progress_note_id: true,
          created_date: false,
          created_by: false,
          revision_by: false,
          revision_date: true,
          trigger_word: true,
          progress_note: false,
          summary: false,
          update_time: false,
          has_events: true,
        },
  pagination: {
    pageIndex: 0,
    pageSize: 30,
  },
};

const renderSubComponent = ({ row }: { row: Row<TriggerFinal> }) => {
  return <TriggerNoteDetail row={row} />;
};

const initialNewTrigger: {
  trigger_word: string;
  internal_facility_id: string[];
  date_range: [Date, Date];
} = {
  trigger_word: '',
  internal_facility_id: [],
  date_range: [new Date(), new Date()],
};
export default function ReviewTriggers() {
  const { route, user_applications_locations, user_data } =
    useContext(AuthContext);
  const { locations } = user_applications_locations.find(
    (d) => d['id'] === 'trigger_words',
  ) || { locations: [] };
  const [additionalFilters, setAdditionalFilters] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['trigger-words', route],
    queryFn: () => axios.get(`${route}/trigger_final`).then((res) => res.data),
  });

  const addTemporary = useMutation({
    mutationFn: ({
      trigger_word,
      user_id,
      facilities,
      from_to,
    }: {
      trigger_word: string;
      user_id: string;
      facilities: string[];
      from_to: [Date | null, Date | null];
    }) =>
      axios.post(
        `https://triggerword_temporary_api.triedgesandbox.com/create_trigger`,
        {
          trigger_word,
          facilities,
          user_id,
          from_to,
          status: 'temporary',
        },
      ),
    onSuccess: () => {
      createToast(
        'Success',
        'Trigger Word Creation in Progress',
        0,
        'new trigger',
      );
    },
  });

  const [newTriggerWord, setNewTriggerWord] = useState<{
    trigger_word: string;
    internal_facility_id: string[];
    date_range: [Date | null, Date | null];
  }>(initialNewTrigger);

  const columns = useMemo<ColumnDef<TriggerFinal>[]>(
    () => [
      {
        accessorKey: 'facility_name',
        header: 'Facility',
        meta: {
          wrap: false,
          type: 'categorical',
          download: true,
          excelWidth: 20,
        },
        filterFn: 'arrIncludesSome',
      },
      {
        accessorKey: 'patient_name',
        cell: (info) => {
          if (info.row.original.upstream === 'MTX') {
            return (
              <HyperLink
                tooltip_content={'View Patient in MaxtrixCare'}
                href={`https://clearviewhcm.matrixcare.com/core/selectResident.action?residentID=${info.row.original.patient_id}`}
              >
                {info.row.getValue('patient_name')}
              </HyperLink>
            );
          }
          if (info.row.original.upstream === 'PCC') {
            return (
              <HyperLink
                tooltip_content={'View Patient in PCC'}
                href={`https://www19.pointclickcare.com/admin/client/clientlist.jsp?ESOLtabtype=C&ESOLglobalclientsearch=Y&ESOLclientid=${info.row.original.patient_id}&ESOLfacid=${info.row.original.internal_facility_id.split('_').pop()}&ESOLsave=P`}
              >
                {info.row.getValue('patient_name')}
              </HyperLink>
            );
          }
          return info.renderValue();
        },
        header: 'Patient',
        filterFn: 'includesString',
        meta: {
          wrap: false,
          type: 'text',
          download: true,
          excelWidth: 20,
        },
      },
      {
        accessorKey: 'progress_note_id',
        header: 'Progress Note ID',
        meta: {
          wrap: false,
          type: 'text',
          download: true,
          excelWidth: 20,
        },
        sortingFn: 'text',
        sortDescFirst: false,
        filterFn: 'includesString',
      },
      {
        accessorKey: 'created_date',
        header: 'Created Date',
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
        accessorKey: 'revision_date',
        header: 'Revision Date',
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
        meta: {
          wrap: false,
          type: 'daterange',
        },
        filterFn: dateRangeFilterFn,
      },
      {
        accessorKey: 'revision_by',
        header: 'Revision By',
        meta: {
          wrap: false,
          type: 'categorical',
        },
        filterFn: 'arrIncludesSome',
      },
      {
        accessorKey: 'trigger_word',
        header: 'Trigger Words',
        accessorFn: (row) => row.trigger_words.map((d) => d.trigger_word),
        cell: (info) => {
          const value = info.getValue() as string[];
          return value.join(', ');
        },
        filterFn: 'arrIncludesSome',
        meta: {
          wrap: true,
          type: 'categorical',
          download: true,
          excelWidth: 20,
        },
      },
      {
        accessorKey: 'progress_note',
        header: 'Progress Note',
        filterFn: 'includesString',
        meta: {
          wrap: true,
          type: 'text',
          download: true,
          excelWidth: 80,
        },
      },
      {
        accessorKey: 'summary',
        accessorFn: (row) =>
          row.trigger_words
            .map((d) => d.trigger_word + ': ' + d.summary)
            .join('\n\n'),
        header: 'Explanation',
        filterFn: 'includesString',
        meta: {
          wrap: true,
          type: 'text',
          download: true,
          excelWidth: 80,
        },
      },
      {
        accessorKey: 'update_time',
        accessorFn: (row) =>
          new Date(
            Math.max(
              ...row.trigger_words.map((d) =>
                new Date(d.update_time).getTime(),
              ),
            ),
          ).toISOString(),
        header: 'Update Time',
        meta: { type: 'daterange', wrap: false },
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
        sortingFn: 'datetime',
        filterFn: dateRangeFilterFn,
      },
      {
        accessorKey: 'has_events',
        header: 'Events Associated',
        accessorFn: (row) => {
          return row.trigger_words.some((d) => d.event_ids.length > 0)
            ? 'Yes'
            : 'No';
        },
        filterFn: 'arrIncludesSome',
        meta: {
          wrap: false,
          type: 'categorical',
        },
      },
    ],
    [],
  );
  const [tableState, setTableState] = useState<TableState>(initialTableState);

  useEffect(() => {
    if (localStorage.getItem('clearStorage') !== '3') {
      localStorage.removeItem('recent');
      localStorage.removeItem('userVisibilitySettings');
      localStorage.setItem('clearStorage', '3');
    } else {
      const userVisibilitySettings = localStorage.getItem(
        'userVisibilitySettings',
      );
      if (userVisibilitySettings) {
        setTableState((prev) => ({
          ...prev,
          columnVisibility: JSON.parse(userVisibilitySettings),
        }));
      }
    }
  }, []);

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
      'userVisibilitySettings',
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

  if (isPending) {
    return <Loader />;
  }
  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <DefaultLayout title={'Clinical Pulse'}>
      <h1 className="text-2xl font-bold mt-3 sm:mt-0">Review Triggers</h1>
      <div className="grid xl:grid-cols-4 grid-cols-3 sm:gap-3 mt-5">
        {predefinedTriggerWords.map((word) => (
          <NumberCards
            key={word}
            className={clsx(
              'col-span-1',
              'cursor-pointer',
              (
                (tableState.columnFilters.find(
                  ({ id }) => id === 'trigger_word',
                )?.value as string[]) || []
              ).includes(word)
                ? 'bg-slate-200 dark:bg-slate-600 '
                : 'bg-white dark:bg-boxdark hover:bg-slate-100 hover:dark:bg-slate-700',
            )}
            value={
              table
                .getColumn('trigger_word')
                ?.getFacetedUniqueValues()
                .get(word) || 0
            }
            title={word}
            onClick={() => {
              let filter =
                (tableState.columnFilters.find(
                  ({ id }) => id === 'trigger_word',
                )?.value as string[]) || [];
              if (filter.includes(word)) {
                filter = filter.filter((f) => f !== word);
              } else {
                filter.push(word);
              }
              if (filter.length === 0) {
                setTableState((prev) => ({
                  ...prev,
                  columnFilters: prev.columnFilters.filter(
                    ({ id }) => id !== 'trigger_word',
                  ),
                }));
                return;
              }
              setTableState((prev) => ({
                ...prev,
                columnFilters: [
                  ...prev.columnFilters.filter(
                    ({ id }) => id !== 'trigger_word',
                  ),
                  {
                    id: 'trigger_word',
                    value: filter,
                  },
                ],
              }));
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-12 mt-5">
        <div className="col-span-12 sm:col-span-9 flex items-center"></div>
        <Modal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          title="Create a New Trigger Word"
          button={<p>+ Add a New Trigger Word</p>}
          classNameses={{
            title: 'dark:text-bodydark1',
            button:
              'text-primary dark:text-secondary col-span-12 lg:col-span-3 lg:justify-self-end justify-self-start self-center',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTemporary.mutate({
                trigger_word: newTriggerWord.trigger_word,
                facilities: newTriggerWord.internal_facility_id,
                user_id: user_data.email,
                from_to: newTriggerWord.date_range,
              });
              setIsOpen(false);
              setNewTriggerWord(initialNewTrigger);
            }}
          >
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
                    menu: () => 'dark:bg-form-input min-w-max',
                    option: () => 'text-body dark:!text-bodydark',
                  }}
                />
              </Field>
              <Field>
                <Label className="block text-sm dark:text-bodydark2">
                  Date Range
                </Label>
                <DatePicker
                  startDate={newTriggerWord.date_range[0] ?? undefined}
                  endDate={newTriggerWord.date_range[1] ?? undefined}
                  maxDate={
                    newTriggerWord.date_range[1]
                      ? new Date()
                      : new Date(
                          Math.min(
                            new Date().getTime(),
                            newTriggerWord.date_range[0]
                              ? new Date(newTriggerWord.date_range[0]).setDate(
                                  new Date(
                                    newTriggerWord.date_range[0],
                                  ).getDate() + 7,
                                )
                              : new Date().getTime(),
                          ),
                        )
                  }
                  onChange={(e) => {
                    setNewTriggerWord((prev) => ({
                      ...prev,
                      date_range: e,
                    }));
                  }}
                  selectsRange
                  wrapperClassName="w-full"
                  className="dark:bg-boxdark indent-2.5 py-1.5 border border-stroke rounded w-full outline-none focus:shadow-filter focus:shadow-blue-400 dark:text-bodydark1"
                />
              </Field>
              <div className="flex gap-4">
                <button
                  type="reset"
                  className="dark:text-bodydark1"
                  onClick={() => {
                    setIsOpen(false);
                    setNewTriggerWord(initialNewTrigger);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white dark:text-bodydark1 rounded p-2"
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
            <Button
              type="button"
              className="hover:text-primary"
              onClick={() =>
                exportExcel(
                  table,
                  'review_triggers_' + new Date().toLocaleString(),
                )
              }
            >
              <DownloadSimple size={22} />
            </Button>

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
                  classNames={{ control: () => 'sm:w-[50vw]' }}
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
                        | ColumnDefTemplate<
                            HeaderContext<TriggerFinal, unknown>
                          >
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
                <Button
                  onClick={() =>
                    setTableState((prev) => ({
                      ...prev,
                      columnVisibility: initialTableState.columnVisibility,
                    }))
                  }
                >
                  Reset to default
                </Button>
              </div>
            </Modal>
          </div>
          <div className="flex p-1 gap-1.5 flex-wrap">
            {PERMANENT_COLUMN_FILTERS.map((filter) => (
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
            {tableState.columnFilters
              .filter((f) => !PERMANENT_COLUMN_FILTERS.includes(f.id))
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
                    !PERMANENT_COLUMN_FILTERS.includes(c.id),
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
                              className={`py-2 px-3 w-[${cell.column.getSize() || 'auto'}] text-sm  ${cell.column.columnDef.meta?.wrap ? 'whitespace-pre-wrap' : 'whitespace-nowrap'} ${row.getIsExpanded() && 'bg-slate-100 dark:bg-slate-700'}`}
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
          <PageNavigation table={table} tableState={tableState} />
        </div>
      </div>
    </DefaultLayout>
  );
}
