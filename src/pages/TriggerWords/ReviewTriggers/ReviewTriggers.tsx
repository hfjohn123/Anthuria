import DefaultLayout from '../../../layout/DefaultLayout.tsx';
import axios from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useContext, useEffect, useMemo, useState } from 'react';
import Loader from '../../../common/Loader';
import 'react-datepicker/dist/react-datepicker.css';
import stemmedFilter from '../../../components/Tables/stemmedFilter.ts';
import {
  ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import getFacetedUniqueValues from '../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../common/getFacetedMinMaxValues.ts';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import NumberCards from '../../../components/Cards/NumberCards.tsx';
import clsx from 'clsx';
import dateRangeFilterFn from '../../../common/dateRangeFilterFn.ts';
import HyperLink from '../../../components/Basic/HyerLink.tsx';
import { TriggerAPI, TriggerFinal } from '../../../types/TriggerFinal.ts';
import TriggerNoteDetail from './TriggerNoteDetail.tsx';
import { useSearch } from '@tanstack/react-router';
import NewTriggerWordModal from './NewTriggerWordModal.tsx';
import TableWrapper from '../../../components/Tables/TableWrapper.tsx';
import _, { Dictionary } from 'lodash';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import HighlightWrapper from '../../../components/Basic/HighlightWrapper.tsx';
import highlightGenerator from '../../../common/highlightGenerator.ts';

const predefinedTriggerWords = [
  'Fall',
  'Unwanted Behavior',
  'Condition Change',
  'Abuse',
  'Neglect',
  'Wound/Ulcer',
  'Weight Change',
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
          has_events: false,
          has_reviewed: false,
          operation_name: false,
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
          has_events: false,
          has_reviewed: false,
          operation_name: false,
        },
  pagination: {
    pageIndex: 0,
    pageSize: 30,
  },
};

export default function ReviewTriggers() {
  const { route, user_applications_locations, user_data } =
    useContext(AuthContext);
  const [initialFacetedCounts, setInitialFacetedCounts] = useState<
    Dictionary<number>
  >({});
  const PERMANENT_COLUMN_FILTERS =
    user_data.organization_id === 'the_triedge_labs'
      ? [
          'operation_name',
          'facility_name',
          'patient_name',
          'trigger_word',
          'revision_date',
        ]
      : ['facility_name', 'patient_name', 'trigger_word', 'revision_date'];

  const { locations } = user_applications_locations.find(
    (d) => d['id'] === 'trigger_words',
  ) || { locations: [] };

  const search = useSearch({
    from: '/trigger-words/review-triggers',
  });

  const [includeCreatedDate, setIncludeCreatedDate] = useState(
    !search['history'],
  );

  const fetchTriggerWord = async (signal?: AbortSignal) => {
    let params: { [key: string]: any } = {};
    if (includeCreatedDate) {
      const today = new Date();
      const twentyFourhAgo = new Date(today.getTime() - 1000 * 60 * 60 * 24);
      twentyFourhAgo.setHours(0, 0, 0, 0);
      today.setHours(23, 59, 59, 999);
      params = { from_date: twentyFourhAgo, to_date: today };
    } else {
      const today = new Date();
      const twentyFourhAgo = new Date(
        today.getTime() - 1000 * 60 * 60 * 24 * 7,
      );
      today.setHours(23, 59, 59, 999);
      params = {
        from_date: twentyFourhAgo,
        to_date: today,
        // pagelimit: tableState.pagination.pageSize,
        // page: tableState.pagination.pageIndex + 1,
      };
    }
    const response = await axios.get(`${route}/trigger_final`, {
      signal,
      params,
    });
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
    queryFn: ({ signal }) => fetchTriggerWord(signal),
  });

  const [selfDefinedKeywordsState, setSelfDefinedKeywordsState] = useState(
    data?.self_defined_keywords,
  );

  useEffect(() => {
    setSelfDefinedKeywordsState(data?.self_defined_keywords);
  }, [data?.self_defined_keywords]);

  const columns = useMemo<ColumnDef<TriggerFinal>[]>(
    () => [
      {
        accessorKey: 'operation_name',
        header: 'Operator',
        meta: { wrap: 'whitespace-nowrap', type: 'categorical' },
        filterFn: 'arrIncludesSome',
        cell: (info) => (
          <HighlightWrapper
            text={info.getValue() as string}
            searchTerm={info.table.getState().globalFilter}
          />
        ),
      },
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
        cell: (info) => (
          <HighlightWrapper
            text={info.getValue() as string}
            searchTerm={info.table.getState().globalFilter}
          />
        ),
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
                <HighlightWrapper
                  text={info.getValue() as string}
                  searchTerm={info.table.getState().globalFilter}
                />
              </HyperLink>
            );
          }
          if (info.row.original.upstream === 'PCC') {
            return (
              <HyperLink
                className="patient_link"
                tooltip_content={'View Patient in PCC'}
                href={`https://${info.row.original.url_header}.pointclickcare.com/admin/client/clientlist.jsp?ESOLtabtype=C&ESOLglobalclientsearch=Y&ESOLclientid=${info.row.original.patient_id}&ESOLfacid=${info.row.original.internal_facility_id.split('_').pop()}&ESOLsave=P`}
              >
                <HighlightWrapper
                  text={info.getValue() as string}
                  searchTerm={info.table.getState().globalFilter}
                />
              </HyperLink>
            );
          }
          return (
            <HighlightWrapper
              text={info.getValue() as string}
              searchTerm={info.table.getState().globalFilter}
            />
          );
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
        cell: (info) => (
          <HighlightWrapper
            text={info.getValue() as string}
            searchTerm={info.table.getState().globalFilter}
          />
        ),
      },
      {
        accessorKey: 'created_date',
        header: 'Created Date',
        cell: (info) => {
          if (!info.getValue()) return '';
          const date = new Date(info.getValue() as string | number | Date);
          return (
            <HighlightWrapper
              text={`${date.toLocaleDateString()} ${date.toLocaleTimeString(
                navigator.language,
                {
                  hour: '2-digit',
                  minute: '2-digit',
                },
              )}`}
              searchTerm={info.table.getState().globalFilter}
            />
          );
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
        cell: (info) => (
          <HighlightWrapper
            text={info.getValue() as string}
            searchTerm={info.table.getState().globalFilter}
          />
        ),
      },
      {
        accessorKey: 'revision_date',
        header: 'Revision Date',
        cell: (info) => {
          if (!info.getValue()) return '';
          const date = new Date(info.getValue() as string | number | Date);
          return (
            <HighlightWrapper
              text={`${date.toLocaleDateString()} ${date.toLocaleTimeString(
                navigator.language,
                {
                  hour: '2-digit',
                  minute: '2-digit',
                },
              )}`}
              searchTerm={info.table.getState().globalFilter}
            />
          );
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
        cell: (info) => (
          <HighlightWrapper
            text={info.getValue() as string}
            searchTerm={info.table.getState().globalFilter}
          />
        ),
      },
      {
        accessorKey: 'trigger_word',
        header: 'Category Name',
        accessorFn: (row) => {
          const value = row.trigger_words.map((d) => d.trigger_word);
          if (value.length === 0) {
            return ['Uncategorized'];
          }
          return value;
        },
        cell: (info) => {
          const value = info.getValue() as string[];
          if (value[0] === 'Uncategorized') {
            return <div className="flex flex-wrap gap-2"></div>;
          }
          return (
            <div className="flex flex-wrap gap-2">
              {value.map((d) =>
                highlightGenerator(d, [
                  ...((info.table
                    .getState()
                    .columnFilters.find((f) => f.id === 'trigger_word')
                    ?.value || []) as string[]),
                  info.table.getState().globalFilter,
                ]).map((segment, index) => (
                  <span
                    key={index}
                    className={
                      segment.isMatch && segment.termIndex !== undefined
                        ? `bg-yellow-200 px-1 rounded`
                        : 'bg-slate-100 px-1 rounded'
                    }
                    title={
                      segment.isMatch ? `Match: ${segment.term}` : undefined
                    }
                  >
                    {segment.text}
                  </span>
                )),
              )}
            </div>
          );
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
        cell: (info) => (
          <HighlightWrapper
            text={info.getValue() as string}
            searchTerm={info.table.getState().globalFilter}
          />
        ),
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
        cell: (info) => (
          <HighlightWrapper
            text={info.getValue() as string}
            searchTerm={info.table.getState().globalFilter}
          />
        ),
      },
      {
        accessorKey: 'has_events',
        header: 'Events Associated',
        enableGlobalFilter: false,
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
        cell: (info) => {
          return (
            <span className="flex items-center gap-1">
              {info.getValue() === 'No' ? (
                <XCircle size={20} />
              ) : (
                <CheckCircle size={20} />
              )}
              {info.getValue() === 'No' ? 'No' : 'Yes'}
            </span>
          );
        },
      },
      {
        accessorKey: 'has_reviewed',
        header: 'Reviewed',
        enableGlobalFilter: false,
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
        cell: (info) => {
          return (
            <span className="flex items-center gap-1">
              {info.getValue() === 'No' ? (
                <XCircle size={20} />
              ) : (
                <CheckCircle size={20} />
              )}
              {info.getValue() === 'No' ? 'No' : 'Yes'}
            </span>
          );
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
    const result = _(data?.data)
      .flatMap('trigger_words') // Flatten the arrays of trigger word objects
      .map('trigger_word') // Get just the trigger_word field
      .compact() // Remove any undefined/null values
      .countBy() // Count occurrences
      .value();
    setInitialFacetedCounts(result);
  }, [data?.data]);

  useEffect(() => {
    localStorage.setItem(
      'userVisibilitySettings',
      JSON.stringify(tableState.columnVisibility),
    );
  }, [tableState.columnVisibility]);

  useEffect(() => {
    refetch().finally(() => setIsRefetching(false));
  }, [includeCreatedDate, refetch]);

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
    data && (
      <DefaultLayout title={'Clinical Pulse'}>
        <div className="flex flex-col gap-5 my-3 sm:my-5 max-w-screen-3xl sm:px-5 mx-auto">
          <h1 className="text-2xl font-bold">Review Triggers</h1>
          <>
            <div className="grid xl:grid-cols-5 grid-cols-3 gap-1 sm:gap-6 ">
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
                      ? 'bg-slate-300 dark:bg-slate-600 '
                      : 'bg-white dark:bg-boxdark hover:bg-slate-200 hover:dark:bg-slate-700',
                  )}
                  id={
                    'NumberCards-' + word.replace(' ', '-').replace(/\W/g, '-')
                  }
                  value={
                    table
                      .getColumn('trigger_word')
                      ?.getFacetedUniqueValues()
                      .get(word) || 0
                  }
                  initialValue={initialFacetedCounts[word] || 0}
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
              {selfDefinedKeywordsState &&
                selfDefinedKeywordsState
                  .filter((kw) =>
                    kw.internal_facility_id.some((id) =>
                      locations
                        .map((loc) => loc.internal_facility_id)
                        .includes(id),
                    ),
                  )
                  .map((kw) => {
                    const new_kw = {
                      group_name: kw.group_name,
                      trigger_word: kw.trigger_word,
                      internal_facility_id: kw.internal_facility_id.filter(
                        (id) =>
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
                        title={kw.group_name}
                        value={
                          table
                            .getColumn('trigger_word')
                            ?.getFacetedUniqueValues()
                            .get(kw.group_name) || 0
                        }
                        key={kw.group_name}
                        className={clsx(
                          'col-span-1',
                          'cursor-pointer',
                          (
                            (tableState.columnFilters.find(
                              ({ id }) => id === 'trigger_word',
                            )?.value as string[]) || []
                          ).includes(kw.group_name)
                            ? 'bg-slate-300 dark:bg-slate-600 '
                            : 'bg-white dark:bg-boxdark hover:bg-slate-200 hover:dark:bg-slate-700',
                        )}
                        onClick={() => {
                          let filter =
                            (tableState.columnFilters.find(
                              ({ id }) => id === 'trigger_word',
                            )?.value as string[]) || [];
                          if (filter.includes(kw.group_name)) {
                            filter = filter.filter((f) => f !== kw.group_name);
                          } else {
                            filter.push(kw.group_name);
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
                            (kw) => kw.group_name,
                          ) ?? [],
                        )}
                        data={data.data}
                        setSelfDefinedKeywordsState={
                          setSelfDefinedKeywordsState
                        }
                      />
                    );
                  })}
              <NumberCards
                keywordModal={true}
                key="Uncategorized"
                className={clsx(
                  'col-span-1',
                  'cursor-pointer',
                  (
                    (tableState.columnFilters.find(
                      ({ id }) => id === 'trigger_word',
                    )?.value as string[]) || []
                  ).includes('Uncategorized')
                    ? 'bg-slate-300 dark:bg-slate-600 '
                    : 'bg-white dark:bg-boxdark hover:bg-slate-200 hover:dark:bg-slate-700',
                )}
                id={
                  'NumberCards-' +
                  'Uncategorized'.replace(' ', '-').replace(/\W/g, '-')
                }
                value={
                  table
                    .getColumn('trigger_word')
                    ?.getFacetedUniqueValues()
                    .get('Uncategorized') || 0
                }
                initialValue={initialFacetedCounts['Uncategorized'] || 0}
                title={'Uncategorized'}
                onClick={() => {
                  let filter =
                    (tableState.columnFilters.find(
                      ({ id }) => id === 'trigger_word',
                    )?.value as string[]) || [];
                  if (filter.includes('Uncategorized')) {
                    filter = filter.filter((f) => f !== 'Uncategorized');
                  } else {
                    filter.push('Uncategorized');
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
            </div>
            <div className="self-end">
              <NewTriggerWordModal
                data={data.data}
                trigger_words={predefinedTriggerWords.concat(
                  data.self_defined_keywords?.map((kw) => kw.group_name) ?? [],
                )}
                setSelfDefinedKeywordsState={setSelfDefinedKeywordsState}
              />
            </div>
          </>

          <div className=" mt-5 col-span-12 ">
            <TableWrapper
              table={table}
              tableState={tableState}
              setTableState={setTableState}
              permanentColumnFilters={PERMANENT_COLUMN_FILTERS}
              renderExpandedRow={TriggerNoteDetail}
              download={true}
              tableSetting={true}
              initialTableState={initialTableState}
              hasHistory={true}
              setIsRefetching={setIsRefetching}
              includeCreatedDate={includeCreatedDate}
              setIncludeCreatedDate={setIncludeCreatedDate}
              title={'Progress Notes'}
            />
          </div>
        </div>
      </DefaultLayout>
    )
  );
}
