import {
  ColumnDef,
  flexRender,
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
import { useEffect, useMemo, useState } from 'react';
import getFacetedUniqueValues from '../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../common/getFacetedMinMaxValues.ts';

export default function ProgressTracking({ row }: { row: Row<EventFinal> }) {
  const tasks = row.original.tasks;
  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      { accessorKey: 'category', header: 'Category' },
      {
        accessorKey: 'task',
        header: 'Task',
        cell: (info) => (
          <p dangerouslySetInnerHTML={{ __html: info.getValue() as string }} />
        ),
      },
      { accessorKey: 'status', header: 'Status' },
      {
        accessorKey: 'due',
        header: 'Due',
        cell: (info) => {
          const dueDate = new Date(info.getValue() as Date);
          const diffTime = dueDate.getTime() - new Date().getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          const diffMins = Math.ceil(
            (diffTime % (1000 * 60 * 60)) / (1000 * 60),
          );

          return (
            <p>
              {diffDays < 1 ? (
                <span>
                  In {diffHours}h {diffMins}m
                </span>
              ) : diffDays < 2 ? (
                <span>Tomorrow</span>
              ) : (
                <span>In {diffDays} days</span>
              )}
              <br />
              <span>
                {new Date(info.getValue() as Date).toLocaleString(
                  navigator.language,
                  {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: 'numeric',
                    minute: '2-digit',
                  },
                )}
              </span>
            </p>
          );
        },
      },
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
        <table className="w-full">
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
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr
                  key={row.id}
                  className="border-b-[1.5px] border-stroke dark:border-strokedark"
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        className="py-2 border-b-[1.5px] border-stroke dark:border-strokedark"
                      >
                        {cell.column.id === 'due'
                          ? null
                          : (flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            ) as string)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
