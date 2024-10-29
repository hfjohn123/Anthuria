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
import { useContext, useState } from 'react';
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
import Select from 'react-select';
import filterSelectStyles from '../../../components/Select/filterSelectStyles.ts';
import dateRangeFilterFn from '../../../common/dateRangeFilterFn.ts';
import PrimaryButton from '../../../components/Basic/PrimaryButton.tsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import handleFilterChange from '../../../components/Tables/handleFilterChange.ts';

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
const permanentColumnFilters = ['category', 'status'];
export default function ProgressTracking({
  row,
  now,
}: {
  row: Row<EventFinal>;
  now: Date;
}) {
  const { route } = useContext(AuthContext);
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
  const queryClient = useQueryClient();
  const orderBypass = useMutation({
    mutationFn: async ({ task_type_id }: { task_type_id: string }) => {
      axios.put(`${route}/event_task_bypass`, {
        task_type_id: task_type_id,
        event_id: row.original.event_id,
        internal_patient_id: row.original.internal_patient_id,
        internal_facility_id: row.original.internal_facility_id,
      });
    },
    onMutate: async ({ task_type_id }: { task_type_id: string }) => {
      await queryClient.cancelQueries({
        queryKey: ['trigger_word_view_event_detail_final', route],
      });
      const previous = queryClient.getQueryData<EventFinal[]>([
        'trigger_word_view_event_detail_final',
        route,
      ]);
      if (previous) {
        const data = structuredClone(row.original);
        const old = structuredClone(previous);

        for (let i = 0; i < data.tasks.length; i++) {
          if (data.tasks[i].type_id === task_type_id) {
            data.tasks[i].status = 'Closed';
          }
        }
        for (let i = 0; i < old.length; i++) {
          if (old[i].event_id === data.event_id) {
            old[i] = data;
          }
        }
        queryClient.setQueryData(
          ['trigger_word_view_event_detail_final', route],
          old,
        );
      }
      return { previous };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['trigger_word_view_event_detail_final', route],
      });
    },
  });
  const pendingTask = useMutation({
    mutationFn: async (type_id: string) => {
      axios.put(`${route}/pending_task`, {
        event_id: row.original.event_id,
        type_id: type_id,
      });
    },
    onMutate: async (type_id: string) => {
      await queryClient.cancelQueries({
        queryKey: ['trigger_word_view_event_detail_final', route],
      });
      const previous = queryClient.getQueryData<EventFinal[]>([
        'trigger_word_view_event_detail_final',
        route,
      ]);
      if (previous) {
        const data = structuredClone(row.original);
        const old = structuredClone(previous);

        for (let i = 0; i < data.tasks.length; i++) {
          if (data.tasks[i].type_id === type_id) {
            data.tasks[i].status = 'Pending';
          }
        }
        for (let i = 0; i < old.length; i++) {
          if (old[i].event_id === data.event_id) {
            old[i] = data;
          }
        }
        queryClient.setQueryData(
          ['trigger_word_view_event_detail_final', route],
          old,
        );
      }
      return { previous };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['trigger_word_view_event_detail_final', route],
      });
    },
  });
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
      accessorFn: (row) => new Date(row.due),
      header: 'Due',
      cell: (info) => {
        const dueDate = info.getValue() as Date;
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
        return info.row.getValue('status') === 'Open' ? (
          <HyperLink
            className="action_link"
            href={info.row.getValue('link') as string}
            onAuxClick={() => {
              pendingTask.mutate(info.row.original.type_id as string);
            }}
            onClick={() => {
              pendingTask.mutate(info.row.original.type_id as string);
            }}
          >
            {info.row.getValue('category')}
          </HyperLink>
        ) : (
          <HyperLink
            className="action_link"
            href={info.row.getValue('link') as string}
          >
            {info.row.getValue('category')}
          </HyperLink>
        );
      },
    },
    {
      accessorKey: 'action',
      header: '',
      cell: (info) => {
        if (info.row.getValue('category') === 'Orders') {
          if (info.row.getValue('status') === 'Open') {
            return (
              <PrimaryButton
                onClick={() =>
                  orderBypass.mutate({
                    task_type_id: info.row.original.type_id as string,
                  })
                }
              >
                Bypass
              </PrimaryButton>
            );
          }
          return <PrimaryButton disabled>Bypass</PrimaryButton>;
        }
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
          new Date(now.getTime() + 1000 * 60 * 60 * 48),
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
  const showOpen = tableState.columnFilters.some((filter: ColumnFilter) => {
    return filter.id === 'due';
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

  let filter =
    (tableState.columnFilters.find(({ id }) => id === 'category')
      ?.value as string[]) || [];

  const filterHandler = (value: string) => {
    if (filter.includes(value)) {
      filter = filter.filter((f) => f !== value);
    } else {
      filter = [value];
    }
    if (filter.length === 0) {
      setTableState((prev) => ({
        ...prev,
        columnFilters: prev.columnFilters.filter(({ id }) => id !== 'category'),
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
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="w-full flex flex-col gap-8 px-3">
        <div className="w-full flex items-center gap-3">
          <h3 className="text-base font-semibold underline">
            Progress Tracking
          </h3>
          <p className="text-body-2">
            {tasks.filter((f) => f.status !== 'Closed').length} open
          </p>
        </div>
        <div className="w-full flex items-center justify-center gap-18">
          <div
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => filterHandler('Communications')}
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
            onClick={() => filterHandler('Orders')}
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
            onClick={() => filterHandler('Care Plan Review')}
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
            onClick={() => filterHandler('Forms')}
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
            onClick={() => filterHandler('Vitals')}
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
          {permanentColumnFilters.map((filter) => (
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
              onChange={(selected, action) => {
                handleFilterChange(selected, action, setTableState);
              }}
            />
          ))}
          {tableState.columnFilters.length > 0 && (
            <Button
              color="secondary"
              onClick={() =>
                setTableState((prev) => ({ ...prev, columnFilters: [] }))
              }
            >
              Clear all
            </Button>
          )}
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
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="py-2 border-b-[1.5px] border-stroke dark:border-strokedark text-left select-none group whitespace-nowrap text-body-2"
                >
                  No tasks found
                </td>
              </tr>
            )}
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
                        new Date(now.getTime() + 1000 * 60 * 60 * 48),
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
