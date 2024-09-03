import {
  ColumnDef,
  ColumnFilter,
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
  Check,
  FileText,
  Heartbeat,
  MagnifyingGlass,
  Megaphone,
  TestTube,
} from '@phosphor-icons/react';
import FilterValueContainer from '../../../components/Select/FilterValueContainer.tsx';
import CheckboxOption from '../../../components/Select/CheckboxOption.tsx';
import Select, { ActionMeta, MultiValue } from 'react-select';
import filterSelectStyles from '../../../components/Select/filterSelectStyles.ts';
import dateRangeFilterFn from '../../../components/Select/dateRangeFilterFn.ts';

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
  const communications = tasks.filter(
    (task) => task.category === 'Communications',
  );
  const orders = tasks.filter((task) => task.category === 'Orders');
  const carePlanReview = tasks.filter(
    (task) => task.category === 'Care Plan Review',
  );
  const forms = tasks.filter((task) => task.category === 'Forms');
  const vitals = tasks.filter((task) => task.category === 'Vitals');

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: 'category',
      header: 'Category',
      cell: (info) => (
        <span
          className={clsx(
            'px-2 py-0.5 bg-opacity-15 rounded-md',
            info.row.getValue('status') === 'Closed'
              ? 'bg-[#807F7F]'
              : [
                  info.getValue() === 'Communications' && 'bg-[#FFC300]',
                  info.getValue() === 'Orders' && 'bg-[#2B00FF]',
                  info.getValue() === 'Care Plan Review' && 'bg-[#00AEFF]',
                  info.getValue() === 'Forms' && 'bg-[#FF2B00]',
                  info.getValue() === 'Vitals' && 'bg-[#D900FF]',
                ],
          )}
        >
          {info.getValue() as string}
        </span>
      ),
      filterFn: 'arrIncludesSome',
    },
    {
      accessorKey: 'task',
      header: 'Task',
      cell: (info) => (
        <p
          className={clsx(
            info.row.getValue('status') === 'Closed' && 'line-through',
          )}
          dangerouslySetInnerHTML={{ __html: info.getValue() as string }}
        />
      ),
    },
    { accessorKey: 'status', header: 'Status', filterFn: 'arrIncludesSome' },
    {
      accessorKey: 'due',
      header: 'Due',
      cell: (info) => {
        const dueDate = new Date(info.getValue() as Date);
        return (
          <p>
            {info.row.getValue('status') === 'Open' && (
              <>
                <Countdown
                  date={dueDate}
                  renderer={renderer}
                  controlled={false}
                />
                <br />
              </>
            )}

            <span
              className={clsx(
                info.row.getValue('status') === 'Closed' && 'line-through',
              )}
            >
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
      filterFn: dateRangeFilterFn,
    },
    {
      accessorKey: 'link',
      header: 'Link',
      accessorFn: () => {
        // if (
        //   task.category === 'Communications' ||
        //   task.category === 'Forms' ||
        //   task.category === 'Vitals' ||
        //   task.category === 'Orders'
        // )
        return `https://clearviewhcm.matrixcare.com/Zion?zionpagealias=EVENTVIEW&NSPID=${row.original.patient_id}&CHGPID=true&EVENTID=${row.original.event_id}&dashboardHomePage=true&OEType=Event&PATIENTID=${row.original.patient_id}`;
        // if (task.category === 'Vitals')
        //   return `https://clearviewhcm.matrixcare.com/Zion?zionpagealias=MEASUREMENTVIEW&measurementDetailID=${task.corresponding_id}&PATIENTID=${row.original.patient_id}`;
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
    columnFilters: [
      { id: 'status', value: ['Open'] },
      {
        id: 'due',
        value: [
          new Date(1996, 0, 1),
          new Date(new Date().getTime() + 1000 * 60 * 60 * 48),
        ],
      },
    ],
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
  console.log(tableState.columnFilters);
  const showOpen = tableState.columnFilters.some((filter: ColumnFilter) => {
    return filter.id === 'due';
  });
  console.log(showOpen);
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
  let filter =
    (tableState.columnFilters.find(({ id }) => id === 'category')
      ?.value as string[]) || [];
  return (
    <div className="w-full flex flex-col gap-5">
      <div className="w-full flex flex-col gap-8 px-3">
        <div className="w-full flex items-center gap-3">
          <h3 className="text-base font-semibold underline">
            Progress Tracking
          </h3>
          <p className="text-body-2">Placeholder</p>
        </div>
        <div className="w-full flex items-center justify-center gap-18">
          <div
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => {
              if (filter.includes('Communications')) {
                filter = filter.filter((f) => f !== 'Communications');
              } else {
                filter.push('Communications');
              }
              if (filter.length === 0) {
                setTableState((prev) => ({
                  ...prev,
                  columnFilters: prev.columnFilters.filter(
                    ({ id }) => id !== 'category',
                  ),
                }));
                return;
              }
              setTableState((prev) => ({
                ...prev,
                columnFilters: [
                  ...prev.columnFilters.filter(({ id }) => id !== 'category'),
                  {
                    id: 'category',
                    value: filter,
                  },
                ],
              }));
            }}
          >
            <Megaphone
              className={clsx(
                'size-12',
                filter.includes('Communications') && 'text-primary',
              )}
            />
            <p>Communications</p>
            {communications.filter((c) => c.status === 'Open').length === 0 ? (
              <Check className="size-4 text-[#468B49]" />
            ) : (
              <p className={'font-semibold text-red-warning'}>
                {Math.round(
                  (communications.filter((c) => c.status === 'Closed').length /
                    communications.length) *
                    100,
                )}
                % Complete
              </p>
            )}
          </div>
          <div
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => {
              if (filter.includes('Orders')) {
                filter = filter.filter((f) => f !== 'Orders');
              } else {
                filter.push('Orders');
              }
              if (filter.length === 0) {
                setTableState((prev) => ({
                  ...prev,
                  columnFilters: prev.columnFilters.filter(
                    ({ id }) => id !== 'category',
                  ),
                }));
                return;
              }
              setTableState((prev) => ({
                ...prev,
                columnFilters: [
                  ...prev.columnFilters.filter(({ id }) => id !== 'category'),
                  {
                    id: 'category',
                    value: filter,
                  },
                ],
              }));
            }}
          >
            <TestTube
              className={clsx(
                'size-12',
                filter.includes('Orders') && 'text-primary',
              )}
            />
            <p>Orders</p>
            {orders.filter((c) => c.status === 'Open').length === 0 ? (
              <Check className="size-4 text-[#468B49]" />
            ) : (
              <p className={'font-semibold text-red-warning'}>
                {Math.round(
                  (orders.filter((c) => c.status === 'Closed').length /
                    orders.length) *
                    100,
                )}
                % Complete
              </p>
            )}
          </div>
          <div
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => {
              if (filter.includes('Care Plan Review')) {
                filter = filter.filter((f) => f !== 'Care Plan Review');
              } else {
                filter.push('Care Plan Review');
              }
              if (filter.length === 0) {
                setTableState((prev) => ({
                  ...prev,
                  columnFilters: prev.columnFilters.filter(
                    ({ id }) => id !== 'category',
                  ),
                }));
                return;
              }
              setTableState((prev) => ({
                ...prev,
                columnFilters: [
                  ...prev.columnFilters.filter(({ id }) => id !== 'category'),
                  {
                    id: 'category',
                    value: filter,
                  },
                ],
              }));
            }}
          >
            <MagnifyingGlass
              className={clsx(
                'size-12',
                filter.includes('Care Plan Review') && 'text-primary',
              )}
            />
            <p>Care Plan Review</p>
            {carePlanReview.filter((c) => c.status === 'Open').length === 0 ? (
              <Check className="size-4 text-[#468B49]" />
            ) : (
              <p className={'font-semibold text-red-warning'}>
                {Math.round(
                  (carePlanReview.filter((c) => c.status === 'Closed').length /
                    carePlanReview.length) *
                    100,
                )}
                % Complete
              </p>
            )}
          </div>
          <div
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => {
              if (filter.includes('Forms')) {
                filter = filter.filter((f) => f !== 'Forms');
              } else {
                filter.push('Forms');
              }
              if (filter.length === 0) {
                setTableState((prev) => ({
                  ...prev,
                  columnFilters: prev.columnFilters.filter(
                    ({ id }) => id !== 'category',
                  ),
                }));
                return;
              }
              setTableState((prev) => ({
                ...prev,
                columnFilters: [
                  ...prev.columnFilters.filter(({ id }) => id !== 'category'),
                  {
                    id: 'category',
                    value: filter,
                  },
                ],
              }));
            }}
          >
            <FileText
              className={clsx(
                'size-12',
                filter.includes('Forms') && 'text-primary',
              )}
            />
            <p>Forms</p>
            {forms.filter((c) => c.status === 'Open').length === 0 ? (
              <Check className="size-4 text-[#468B49]" />
            ) : (
              <p className={'font-semibold text-red-warning'}>
                {Math.round(
                  (forms.filter((c) => c.status === 'Closed').length /
                    forms.length) *
                    100,
                )}
                % Complete
              </p>
            )}
          </div>
          <div
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => {
              if (filter.includes('Vitals')) {
                filter = filter.filter((f) => f !== 'Vitals');
              } else {
                filter.push('Vitals');
              }
              if (filter.length === 0) {
                setTableState((prev) => ({
                  ...prev,
                  columnFilters: prev.columnFilters.filter(
                    ({ id }) => id !== 'category',
                  ),
                }));
                return;
              }
              setTableState((prev) => ({
                ...prev,
                columnFilters: [
                  ...prev.columnFilters.filter(({ id }) => id !== 'category'),
                  {
                    id: 'category',
                    value: filter,
                  },
                ],
              }));
            }}
          >
            <Heartbeat
              className={clsx(
                'size-12',
                filter.includes('Vitals') && 'text-primary',
              )}
            />
            <p>Vitals</p>
            {vitals.filter((c) => c.status === 'Open').length === 0 ? (
              <Check className="size-4 text-[#468B49]" />
            ) : (
              <p className={'font-semibold text-red-warning'}>
                {Math.round(
                  (vitals.filter((c) => c.status === 'Closed').length /
                    vitals.length) *
                    100,
                )}
                % Complete
              </p>
            )}
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
              onChange={handleFilterChange}
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
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        className={clsx(
                          'py-2 border-b-[1.5px] border-stroke dark:border-strokedark',
                        )}
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
            showOpen
              ? setTableState((prev) => ({
                  ...prev,
                  columnFilters: prev.columnFilters.filter((f) => {
                    return f.id !== 'due' && f.id !== 'status';
                  }),
                }))
              : setTableState((prev) => ({
                  ...prev,
                  columnFilters: [
                    ...prev.columnFilters,
                    { id: 'status', value: ['Open'] },
                    {
                      id: 'due',
                      value: [
                        new Date(1996, 0, 1),
                        new Date(new Date().getTime() + 1000 * 60 * 60 * 48),
                      ],
                    },
                  ],
                }));
          }}
        >
          {!showOpen
            ? 'Show Upcoming Open Tasks'
            : 'Show Future & Closed Tasks'}
        </Button>
      </div>
    </div>
  );
}
