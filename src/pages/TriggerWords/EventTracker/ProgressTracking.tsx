import {
  ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import { EventFinal, Task } from '../../../types/EventFinal.ts';
import { useMemo, useState } from 'react';
import getFacetedUniqueValues from '../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../common/getFacetedMinMaxValues.ts';

export default function ProgressTracking({ row }: { row: Row<EventFinal> }) {
  const tasks = row.original.tasks;
  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'task', header: 'Task' },
      { accessorKey: 'status', header: 'Status' },
      { accessorKey: 'due', header: 'Due' },
    ],
    [],
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
    columnVisibility: {
      category: true,
      task: true,
      status: true,
      due: true,
      link: true,
    },
    pagination: {
      pageIndex: 0,
      pageSize: 30,
    },
  });

  const table = useReactTable({
    data: tasks,
    columns,
    state: tableState,
    onStateChange: setTableState,
    getRowCanExpand: () => true,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    autoResetExpanded: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for numeric range filter
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <div className="w-full flex flex-col gap-5">
      <div className="w-full flex flex-col gap-5">
        <div className="w-full flex items-center gap-3">
          <h3 className="text-base font-semibold underline">
            Progress Tracking
          </h3>
          <p className="text-body-2">Placeholder Complete</p>
        </div>
        <div className="w-full flex items-center justify-around">
          <div className="flex flex-col items-center justify-center">
            <div className="border rounded-full size-12 flex items-center justify-center">
              Icon
            </div>
            <p>Create Event</p>
            <p>Place Holder</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="border rounded-full size-12 flex items-center justify-center">
              Icon
            </div>
            <p>Communications</p>
            <p>Place Holder</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="border rounded-full size-12 flex items-center justify-center">
              Icon
            </div>
            <p>Orders</p>
            <p>Place Holder</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="border rounded-full size-12 flex items-center justify-center">
              Icon
            </div>
            <p>Care Plan Review</p>
            <p>Place Holder</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="border rounded-full size-12 flex items-center justify-center">
              Icon
            </div>
            <p>Notes</p>
            <p>Place Holder</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="border rounded-full size-12 flex items-center justify-center">
              Icon
            </div>
            <p>Sign Offs</p>
            <p>Place Holder</p>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-5">
        <h3 className="text-base font-semibold underline">Tasks</h3>
      </div>
    </div>
  );
}
