import DefaultLayout from '../../../layout/DefaultLayout.tsx';
import axios from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
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
import stemmedFilter from '../../../components/Tables/stemmedFilter.ts';
import {
  ColumnDef,
  ColumnDefTemplate,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  HeaderContext,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import getFacetedUniqueValues from '../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../common/getFacetedMinMaxValues.ts';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import NumberCards from '../../../components/Cards/NumberCards.tsx';
import clsx from 'clsx';
import Modal from '../../../components/Modal/Modal.tsx';
import { Button } from '@headlessui/react';
import filterSelectStyles from '../../../components/Select/filterSelectStyles.ts';
import dateRangeFilterFn from '../../../common/dateRangeFilterFn.ts';
import HyperLink from '../../../components/Basic/HyerLink.tsx';
import { DownloadSimple } from '@phosphor-icons/react';
import { TriggerAPI, TriggerFinal } from '../../../types/TriggerFinal.ts';
import PageNavigation from '../../../components/Tables/PageNavigation.tsx';
import exportExcel from '../../../common/excelExport.ts';
import TriggerNoteDetail from './TriggerNoteDetail.tsx';
import { useNavigate, useSearch } from '@tanstack/react-router';
import SearchParams from '../../../types/SearchParams.ts';
import DateTimeDropdown from '../../../components/Tables/DateTimeFilter/DateTimeDropdown.tsx';
import NewTriggerWordModal from './NewTriggerWordModal.tsx';
import DebouncedInputText from '../../../components/Forms/Input/DebouncedInputText.tsx';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';

const predefinedTriggerWords = [
  'Fall',
  'Unwanted Behavior',
  'Condition Change',
  'Abuse',
  'Neglect',
  'Wound/Ulcer',
  'Weight Change',
];
const PERMANENT_COLUMN_FILTERS = [
  'facility_name',
  'patient_name',
  'trigger_word',
  'revision_date',
];

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
  columnFilters: [
    {
      id: 'has_reviewed',
      value: ['No'],
    },
  ],
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
          // update_time: false,
          has_events: false,
          has_reviewed: false,
        }
      : {
          facility_name: true,
          patient_name: true,
          progress_note_id: false,
          created_date: false,
          created_by: false,
          revision_by: false,
          revision_date: true,
          trigger_word: true,
          progress_note: false,
          summary: false,
          // update_time: false,
          has_events: false,
          has_reviewed: false,
        },
  pagination: {
    pageIndex: 0,
    pageSize: 30,
  },
};

export default function ReviewTriggers() {
  const { route, user_applications_locations } = useContext(AuthContext);
  const { locations } = user_applications_locations.find(
    (d) => d['id'] === 'trigger_words',
  ) || { locations: [] };

  const [additionalFilters, setAdditionalFilters] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const navigate = useNavigate({
    from: '/trigger-words/review-triggers',
  });
  const search = useSearch({
    from: '/trigger-words/review-triggers',
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [includeCreatedDate, setIncludeCreatedDate] = useState(
    search['history'] ? search['history'] === 'false' : true,
  );

  const fetchTriggerWord = async () => {
    let params: { [key: string]: any } = {};
    if (includeCreatedDate) {
      const today = new Date();
      const twentyFourhAgo = new Date(today.getTime() - 1000 * 60 * 60 * 24);
      // twentyFourhAgo.setHours(0, 0, 0, 0);
      today.setHours(23, 59, 59, 999);
      params = { from_date: twentyFourhAgo, to_date: today };
    }

    const response = await axios.get(`${route}/trigger_final`, { params });
    return response.data;
  };

  const {
    isPending,
    isError,
    data,
    error,
    refetch,
  }: UseQueryResult<TriggerAPI, unknown> = useQuery({
    queryKey: ['trigger_word_view_trigger_word_detail_final', route],
    queryFn: fetchTriggerWord,
  });

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
                className="patient_link"
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
                className="patient_link"
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
          if (!info.getValue()) return '';
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
          if (!info.getValue()) return '';
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
      // {
      //   accessorKey: 'update_time',
      //   accessorFn: (row) =>
      //     new Date(
      //       Math.max(
      //         ...row.trigger_words.map((d) =>
      //           new Date(d.update_time).getTime(),
      //         ),
      //       ),
      //     ).toISOString(),
      //   header: 'Update Time',
      //   meta: { type: 'daterange', wrap: false },
      //   cell: (info) => {
      //     const date = new Date(info.getValue() as string | number | Date);
      //     return `${date.toLocaleDateString()} ${date.toLocaleTimeString(
      //       navigator.language,
      //       {
      //         hour: '2-digit',
      //         minute: '2-digit',
      //       },
      //     )}`;
      //   },
      //   sortingFn: 'datetime',
      //   filterFn: dateRangeFilterFn,
      // },
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
      {
        accessorKey: 'has_reviewed',
        header: 'Reviewed',
        accessorFn: (row) => {
          return row.trigger_words.filter(
            (d) => !d.is_thumb_up && d.comment === null,
          ).length > 0
            ? 'No'
            : 'Yes';
        },
        filterFn: 'arrIncludesSome',
        meta: {
          wrap: 'whitespace-nowrap',
          type: 'categorical',
        },
      },
    ],
    [],
  );
  const [tableState, setTableState] = useState<TableState>(initialTableState);
  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('clearStorage') !== '5') {
      localStorage.removeItem('userVisibilitySettings');
      localStorage.setItem('clearStorage', '5');
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
    data: data?.data ?? [],
    columns,
    state: tableState,

    onStateChange: setTableState,
    getRowCanExpand: () => true,
    autoResetPageIndex: false,
    filterFns: {
      stemmed: stemmedFilter,
    },
    globalFilterFn: stemmedFilter,
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
    refetch().finally(() => setIsRefetching(false));
  }, [includeCreatedDate, refetch]);

  useEffect(() => {
    const initialFilters: ColumnFiltersState = [];

    Object.entries(search).forEach(([key, value]) => {
      if (value && key !== 'history') {
        if (value === 'yesterday') {
          value = [new Date(Date.now() - 1000 * 60 * 60 * 24), new Date()];
        } else if (value === 'last_3_days') {
          value = [new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), new Date()];
        } else if (value === 'last_7_days') {
          value = [new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), new Date()];
        } else if (
          (value as string).startsWith('[') &&
          (value as string).endsWith(']')
        ) {
          value = (value as string)
            .substring(1, (value as string).length - 1)
            .split(',');
          if (
            !isNaN(parseInt((value as string[])[0])) &&
            new Date(parseInt((value as string[])[0])).getTime() > 0
          ) {
            value = (value as string[]).map(
              (v) => new Date(parseInt(v as string)),
            );
          }
        }
        initialFilters.push({
          id: key,
          value: value,
        });
      }
    });

    setTableState((prev) => ({
      ...prev,
      columnFilters: initialFilters,
    }));
  }, []);

  useEffect(() => {
    const searchParams: SearchParams = {};

    tableState.columnFilters.forEach((filter) => {
      if (filter.id !== 'patient_name') {
        if (filter.value) {
          // Handle array values
          if (Array.isArray(filter.value)) {
            searchParams[filter.id] = `[${filter.value
              .map((v) => {
                if (v instanceof Date) {
                  return v.getTime();
                } else {
                  return v;
                }
              })
              .toString()}]`;
          } else {
            searchParams[filter.id] = filter.value.toString();
          }
        }
      }
    });

    navigate({
      search: {
        ...searchParams,
        history: search['history'],
      },
      replace: true,
    });
    setTableState((prev) => ({
      ...prev,
      pagination: {
        pageIndex: 0,
        pageSize: prev.pagination.pageSize,
      },
    }));
  }, [tableState.columnFilters, tableState.globalFilter]);

  if (isPending || isRefetching) {
    return <Loader />;
  }
  if (isError) {
    if (error instanceof Error) {
      return <div>Error: {error.message}</div>;
    } else {
      return <div>Error: Unknown error</div>;
    }
  }
  return (
    <DefaultLayout title={'Clinical Pulse'}>
      <div className="flex flex-col gap-7 my-3 sm:my-9 max-w-screen-3xl sm:px-9 mx-auto">
        <h1 className="text-2xl font-bold">Review Triggers</h1>
        <div className="grid xl:grid-cols-4 grid-cols-3 sm:gap-3 ">
          {predefinedTriggerWords.map((word) => (
            <NumberCards
              keywordList={
                data &&
                data.keywords
                  .filter(
                    (kw: { trigger_word: string; key_word: string }) =>
                      kw.trigger_word.toLowerCase() === word.toLowerCase(),
                  )
                  .map(
                    (kw: { trigger_word: string; key_word: string }) =>
                      kw.key_word,
                  )
              }
              keywordModal={true}
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
              id={'NumberCards-' + word.replace(' ', '-').replace(/\W/g, '-')}
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
          {data?.self_defined_keywords &&
            data.self_defined_keywords
              .filter((kw) =>
                kw.internal_facility_id.some((id) =>
                  locations.map((loc) => loc.internal_facility_id).includes(id),
                ),
              )
              .map((kw) => {
                const new_kw = {
                  trigger_word: kw.trigger_word,
                  internal_facility_id: kw.internal_facility_id.filter((id) =>
                    locations
                      .map((loc) => loc.internal_facility_id)
                      .includes(id),
                  ),
                  keyword_list: kw.keyword_list,
                };
                return (
                  <NumberCards
                    keywordModal
                    editable
                    title={kw.trigger_word}
                    value={
                      table
                        .getColumn('trigger_word')
                        ?.getFacetedUniqueValues()
                        .get(kw.trigger_word) || 0
                    }
                    key={kw.trigger_word}
                    className={clsx(
                      'col-span-1',
                      'cursor-pointer',
                      (
                        (tableState.columnFilters.find(
                          ({ id }) => id === 'trigger_word',
                        )?.value as string[]) || []
                      ).includes(kw.trigger_word)
                        ? 'bg-slate-200 dark:bg-slate-600 '
                        : 'bg-white dark:bg-boxdark hover:bg-slate-100 hover:dark:bg-slate-700',
                    )}
                    onClick={() => {
                      let filter =
                        (tableState.columnFilters.find(
                          ({ id }) => id === 'trigger_word',
                        )?.value as string[]) || [];
                      if (filter.includes(kw.trigger_word)) {
                        filter = filter.filter((f) => f !== kw.trigger_word);
                      } else {
                        filter.push(kw.trigger_word);
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
                    initialNewTrigger={new_kw}
                    trigger_words={predefinedTriggerWords.concat(
                      data.self_defined_keywords?.map(
                        (kw) => kw.trigger_word,
                      ) ?? [],
                    )}
                    data={data.data}
                  />
                );
              })}
        </div>
        <div className="grid grid-cols-12 ">
          <div className="col-span-12 sm:col-span-9 flex items-center"></div>
          <NewTriggerWordModal
            data={data.data}
            trigger_words={predefinedTriggerWords.concat(
              data.self_defined_keywords?.map((kw) => kw.trigger_word) ?? [],
            )}
          />

          <div className=" mt-5 col-span-12 bg-white dark:bg-boxdark shadow-default  overflow-x-auto sm:overflow-clip  ">
            <div className="sticky top-0 left-0 z-30 bg-white dark:bg-boxdark">
              <div className="flex items-center border-b border-stroke">
                <IconField iconPosition="left" className=" flex-1 py-1 px-1">
                  <InputIcon className="pi pi-search" />
                  <DebouncedInputText
                    setValue={(e) => {
                      setTableState((prev) => ({
                        ...prev,
                        globalFilter: e.target.value,
                      }));
                    }}
                    value={tableState.globalFilter}
                    placeholder="Global Search..."
                    className="w-full"
                  />
                </IconField>
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
                  <div className="px-4">
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
                              .reduce(
                                (acc, c) => ({ ...acc, [c.id]: false }),
                                {},
                              ),
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
              <div className="flex justify-between pr-3 gap-3 items-center">
                <div className="flex p-1 gap-1.5 flex-wrap">
                  {PERMANENT_COLUMN_FILTERS.map((filter) =>
                    table.getColumn(filter)?.columnDef.meta?.type ===
                    'categorical' ? (
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
                    ) : table.getColumn(filter)?.columnDef.meta?.type ===
                      'text' ? (
                      <div
                        key={filter}
                        className="text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 rounded-lg border border-stroke dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      >
                        <span className="text-nowrap">
                          {table.getColumn(filter)?.columnDef.header as string}{' '}
                          {tableState.columnFilters.find(
                            (f) => f.id === filter,
                          ) && 'includes'}
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
                              columnFilters: prev.columnFilters
                                .filter((f) => f.id !== filter)
                                .concat({
                                  id: filter,
                                  value: e.target.value,
                                }),
                            }));
                          }}
                          onBlur={() => {
                            (
                              tableState.columnFilters.find(
                                (f) => f.id === filter,
                              )?.value as string
                            ).length === 0 &&
                              setTableState((prev) => ({
                                ...prev,
                                columnFilters: prev.columnFilters.filter(
                                  (f) => f.id !== filter,
                                ),
                              }));
                          }}
                          minWidth="30"
                          value={
                            (tableState.columnFilters.find(
                              (f) => f.id === filter,
                            )?.value as string) || ''
                          }
                        />
                        {(
                          tableState.columnFilters.find((f) => f.id === filter)
                            ?.value as string
                        )?.length > 0 && (
                          <button
                            onClick={() => {
                              setTableState((prev) => ({
                                ...prev,
                                columnFilters: prev.columnFilters.filter(
                                  (f) => f.id !== filter,
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
                        )}
                      </div>
                    ) : table.getColumn(filter)?.columnDef.meta?.type ===
                      'daterange' ? (
                      <DateTimeDropdown
                        key={filter}
                        id={table.getColumn(filter)?.columnDef.header as string}
                        autoFocus={false}
                        value={
                          tableState.columnFilters.find((f) => f.id === filter)
                            ?.value as Date[]
                        }
                        setValue={([start, end]: [
                          Date | null,
                          Date | null,
                        ]) => {
                          end && end.setHours(23, 59, 59, 999);
                          setTableState((prev) => ({
                            ...prev,
                            columnFilters: prev.columnFilters
                              .filter((f) => f.id !== filter)
                              .concat({
                                id: filter,
                                value: [start, end],
                              }),
                          }));
                        }}
                        clearFilter={() =>
                          setTableState((prev) => ({
                            ...prev,
                            columnFilters: prev.columnFilters.filter(
                              (f) => f.id !== filter,
                            ),
                          }))
                        }
                        minDate={
                          new Date(
                            table
                              .getColumn(filter)
                              ?.getFacetedMinMaxValues()
                              ?.flat()
                              ?.filter((d) => d !== null)[0] ?? '',
                          )
                        }
                        maxDate={
                          new Date(
                            table
                              .getColumn(filter)
                              ?.getFacetedMinMaxValues()
                              ?.flat()
                              ?.filter((d) => d !== null)[
                              (table
                                .getColumn(filter)
                                ?.getFacetedMinMaxValues()
                                ?.flat()
                                ?.filter((d) => d !== null)?.length ?? 1) - 1
                            ] ?? '',
                          )
                        }
                      />
                    ) : null,
                  )}
                  {tableState.columnFilters
                    .filter((f) => !PERMANENT_COLUMN_FILTERS.includes(f.id))
                    .map((filter) =>
                      table.getColumn(filter.id)?.columnDef.meta?.type ===
                      'categorical' ? (
                        <Select
                          classNames={{ ...filterSelectStyles }}
                          key={filter.id}
                          placeholder={
                            table.getColumn(filter.id)?.columnDef
                              ?.header as string
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
                            tableState.columnFilters.find(
                              (f) => f.id === filter.id,
                            )
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
                              tableState.columnFilters.find(
                                (f) => f.id === filter.id,
                              )?.value as string[]
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
                        <div
                          key={filter.id}
                          className="text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 rounded-lg border border-stroke dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                          <span className="text-nowrap">
                            {
                              table.getColumn(filter.id)?.columnDef
                                .header as string
                            }{' '}
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
                        <DateTimeDropdown
                          key={filter.id}
                          id={
                            table.getColumn(filter.id)?.columnDef
                              .header as string
                          }
                          value={
                            tableState.columnFilters.filter(
                              (f) => f.id === filter.id,
                            )[0].value as [Date, Date]
                          }
                          setValue={([start, end]: [
                            Date | null,
                            Date | null,
                          ]) => {
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
                          clearFilter={() =>
                            setTableState((prev) => ({
                              ...prev,
                              columnFilters: prev.columnFilters.filter(
                                (f) => f.id !== filter.id,
                              ),
                            }))
                          }
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
                        />
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
                          !tableState.columnFilters.find(
                            (f) => f.id === c.id,
                          ) && !PERMANENT_COLUMN_FILTERS.includes(c.id),
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
                              table.getColumn(newValue?.value as string)
                                ?.columnDef.meta?.type === 'categorical' ||
                              table.getColumn(newValue?.value as string)
                                ?.columnDef.meta?.type === 'daterange'
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
                        setTableState((prev) => ({
                          ...prev,
                          columnFilters: [],
                        }))
                      }
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <Button
                  className="whitespace-nowrap text-primary"
                  onClick={() => {
                    setIsRefetching(true);
                    setIncludeCreatedDate(!includeCreatedDate);
                    navigate({
                      search: { ...search, history: includeCreatedDate },
                      replace: true,
                    });
                  }}
                >
                  {includeCreatedDate
                    ? 'Show all Historical'
                    : 'Show Two Weeks'}
                </Button>
              </div>
            </div>
            <div className="relative flex-1 ">
              <table className="w-full border-b-2 border-b-stroke">
                <thead
                  className="bg-slate-50 dark:bg-graydark sticky "
                  style={{ top: 'var(--filter-height, 0px)' }}
                >
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            className="py-3 px-3 shadow-table_header  shadow-stroke text-left select-none group whitespace-nowrap "
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
                                className={`py-2 px-3 w-[${cell.column.getSize() || 'auto'}] text-sm  ${cell.column.columnDef.meta?.wrap ? 'whitespace-pre-wrap' : 'whitespace-nowrap'} ${row.getIsExpanded() ? 'bg-slate-100 dark:bg-slate-700' : 'table_row'}`}
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
                              <TriggerNoteDetail row={row} />
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
      </div>
    </DefaultLayout>
  );
}
