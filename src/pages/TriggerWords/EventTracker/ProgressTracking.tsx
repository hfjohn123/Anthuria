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
import { useState } from 'react';
import getFacetedUniqueValues from '../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../common/getFacetedMinMaxValues.ts';
import Countdown from 'react-countdown';
import clsx from 'clsx';
import { Button } from '@headlessui/react';
import HyperLink from '../../../components/Basic/HyerLink.tsx';
import {
  FileText,
  Heartbeat,
  MagnifyingGlass,
  Megaphone,
  TestTube,
} from '@phosphor-icons/react';
import FilterValueContainer from '../../../components/Select/FilterValueContainer.tsx';
import CheckboxOption from '../../../components/Select/CheckboxOption.tsx';
import Select from 'react-select';
import filterSelectStyles from '../../../components/Select/FilterSelectStyles.ts';

const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
  if (completed) {
    // Render a completed state
    return <span className="text-red-warning font-semibold">Overdue</span>;
  }
  // Render a countdown
  if (days < 1) {
    if (hours < 1) {
      if (minutes < 1) {
        return (
          <span className="text-red-warning font-semibold">In {seconds}s</span>
        );
      }
      return (
        <span className="text-red-warning font-semibold">
          In {minutes}m {seconds}s
        </span>
      );
    }
    return (
      <span className="text-red-warning font-semibold">
        In {hours}h {minutes + 1}m
      </span>
    );
  }
  if (days < 2) {
    return <span>Tomorrow</span>;
  }
  return <span>In {days} days</span>;
};
const permenentColumnFilters = ['category', 'status'];
export default function ProgressTracking({ row }: { row: Row<EventFinal> }) {
  const tasks = row.original.tasks;
  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: 'category',
      header: 'Category',
      cell: (info) => (
        <span
          className={clsx(
            'px-2 py-0.5 bg-opacity-15 rounded-md',
            info.getValue() === 'Communications' && 'bg-[#FFC300]',
            info.getValue() === 'Orders' && 'bg-[#2B00FF]',
            info.getValue() === 'Care Plan Review' && 'bg-[#00AEFF]',
            info.getValue() === 'Forms' && 'bg-[#FF2B00]',
            info.getValue() === 'Vitals' && 'bg-[#D900FF]',
          )}
        >
          {info.getValue() as string}
        </span>
      ),
    },
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

        return (
          <p>
            <Countdown date={dueDate} renderer={renderer} />
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
    {
      accessorKey: 'link',
      header: 'Link',
      accessorFn: (task) => {
        if (
          task.category === 'Communications' ||
          task.category === 'Forms' ||
          task.category === 'Care Plan Review'
        )
          return `https://clearviewhcm.matrixcare.com/Zion?zionpagealias=EVENTVIEW&NSPID=${row.original.patient_id}&CHGPID=true&EVENTID=${row.original.event_id}&dashboardHomePage=true&OEType=Event&PATIENTID=${row.original.patient_id}`;
        if (task.category === 'Vitals')
          return `https://clearviewhcm.matrixcare.com/Zion?zionpagealias=MEASUREMENTVIEW&measurementDetailID=${task.corresponding_id}&PATIENTID=${row.original.patient_id}`;
        if (task.category === 'Orders')
          return `https://clearviewhcm.matrixcare.com/Zion?zionpagealias=ORDERBIOLABVIEW&orderID=${task.corresponding_id}&PATIENTID=${row.original.patient_id}&EVENTID=${row.original.event_id}&NSPID=${row.original.patient_id}&CHGPID=true`;
      },
      cell: (info) => {
        return (
          <HyperLink href={info.row.getValue('link') as string}>
            {info.row.getValue('category')}
          </HyperLink>
        );
      },
    },
  ];
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
  const [showAll, setShowAll] = useState(false);
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
      <div className="w-full flex flex-col gap-8 px-3">
        <div className="w-full flex items-center gap-3">
          <h3 className="text-base font-semibold underline">
            Progress Tracking
          </h3>
          <p className="text-body-2">Placeholder Complete</p>
        </div>
        <div className="w-full flex items-center justify-center gap-18">
          <div className="flex flex-col items-center justify-center">
            <Megaphone className="size-12" />
            <p>Communications</p>
            <p>Place Holder</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <TestTube className="size-12" />
            <p>Orders</p>
            <p>Place Holder</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <MagnifyingGlass className="size-12" />
            <p>Care Plan Review</p>
            <p>Place Holder</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <FileText className="size-12" />
            <p>Forms</p>
            <p>Place Holder</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Heartbeat className="size-12" />
            <p>Vitals</p>
            <p>Place Holder</p>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-3  py-4 px-3">
        <h3 className="text-base font-semibold underline">Tasks</h3>
        <div className="w-full flex items-center gap-3">
          {permenentColumnFilters.map((filter) => (
            <Select
              classNames={{ ...filterSelectStyles }}
              key={filter}
              placeholder={table.getColumn(filter)?.columnDef.header as string}
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
              // onChange={handleFilterChange}
            />
          ))}
        </div>
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
                  className={clsx(
                    'border-b-[1.5px] border-stroke dark:border-strokedark',
                    !showAll &&
                      new Date(row.getValue('due')).getTime() -
                        new Date().getTime() >=
                        1000 * 60 * 60 * 48 &&
                      row.getValue('status') === 'Open' &&
                      'hidden',
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        className="py-2 border-b-[1.5px] border-stroke dark:border-strokedark"
                      >
                        {
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          ) as string
                        }
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <Button
          className="self-start text-primary"
          onClick={() => {
            setShowAll((prevState) => !prevState);
          }}
        >
          {showAll ? 'Show Upcoming Open Tasks' : 'Show Future & Closed Tasks'}
        </Button>
      </div>
    </div>
  );
}
