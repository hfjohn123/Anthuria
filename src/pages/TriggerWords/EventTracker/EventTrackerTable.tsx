import {
  ColumnDef,
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
import { useState, useEffect } from 'react';
import { EventFinal } from '../../../types/EventFinal.ts';
import ProgressTracking from './ProgressTracking.tsx';
import ProgressNote from './ProgressNote.tsx';
import getFacetedUniqueValues from '../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../common/getFacetedMinMaxValues.ts';
import HyperLink from '../../../components/Basic/HyerLink.tsx';
import dateRangeFilterFn from '../../../common/dateRangeFilterFn.ts';
import NumberCards from '../../../components/Cards/NumberCards.tsx';
import clsx from 'clsx';
import TableWrapper from '../../../components/Tables/TableWrapper.tsx';

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
      <div className="grid xl:grid-cols-5 grid-cols-3 sm:gap-6">
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
                ? 'bg-slate-300 dark:bg-slate-600 '
                : 'bg-white dark:bg-boxdark hover:bg-slate-200 hover:dark:bg-slate-700',
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

      <TableWrapper
        table={table}
        tableState={tableState}
        setTableState={setTableState}
        permanentColumnFilters={permenentColumnFilters}
        renderExpandedRow={renderSubComponent}
        now={now}
      />
    </>
  );
}
