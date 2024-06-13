import DefaultLayout from '../../layout/DefaultLayout';
import axios from 'axios';
import {useQuery} from '@tanstack/react-query';
import {ChevronDownIcon, ChevronRightIcon, MagnifyingGlassIcon,} from '@heroicons/react/24/solid';
import {useContext, useMemo, useState} from 'react';
import Loader from '../../common/Loader';
import SelectGroupOne from '../../components/Forms/SelectGroup/SelectGroupOne.tsx';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  GroupingState,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import {AuthContext} from '../../components/AuthWrapper.tsx';

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

const renderSubComponent = ({row}: { row: Row<TriggerFinal> }) => {
  return (
    <div className = "flex bg-slate-100 dark:bg-slate-900 px-4 justify-evenly py-4">
      {/*<div>{row.getValue('revision_date')}</div>*/}
      <div className = "basis-2/5">
        <div className = "font-bold"> Progress Note: </div>
        {row.getValue('progress_note')}
        <div className = "font-bold mt-2.5"> Progress Note ID: </div>
        {row.getValue('progress_note_id')}
        <div className = "font-bold mt-2.5"> Created By: </div>
        {row.getValue('created_by')}
      </div>
      <div className = "basis-2/5">
        <div className = "font-bold">Summary: </div>
        {row.getValue('summary')}
        <div className = "font-bold mt-2.5">Trigger: </div>
        Fall
        <div className = "font-bold mt-2.5">Generated Date: </div>
        {row.getValue('report_date')}
      </div>
    </div>
  );
};
export default function TriggerWords() {

  const {route} = useContext(AuthContext);
  const {isPending, isError, data, error} = useQuery({
    queryKey: ['trigger-words', route],
    queryFn: () => axios.get(`${route}/trigger_final`).then((res) => res.data),
  });
  const columns = useMemo<ColumnDef<TriggerFinal>[]>(
    () => [
      {
        accessorKey: 'facility_id',
        header: 'Facility',
        meta: {
          size: '100px',
        },
      },

      {
        accessorKey: 'patient_id',
        header: 'Patient ID',
        filterFn: 'includesString',
        meta: {
          size: '200px',
        },
      },
      {
        accessorKey: 'progress_note',
        header: 'Progress Note',
      },
      {
        accessorKey: 'progress_note_id',
        header: 'Progress Note ID',
        meta: {
          size: '200px',
        },
      },
      {
        accessorKey: 'revision_date',
        header: 'Revision Date',
      },
      {
        accessorKey: 'summary',
        header: 'Summary',
      },
      {
        accessorKey: 'trigger_id',
        header: 'Trigger ID',
      },
      {
        accessorKey: 'report_date',
        header: 'Report Date',
      },
      {
        accessorKey: 'created_date',
        header: 'Created Date',
        cell: (info) => {
          const date = new Date(info.getValue() as string | number | Date);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: {
          size: '200px',
        },
      },
      {
        accessorKey: 'created_by',
        header: 'Created By',
      },
    ],
    [],
  );
  const [grouping, setGrouping] = useState<GroupingState>(['facility_id']);
  const [columnVisibility] = useState({
    created_date: true,
    progress_note: false,
    summary: false,
    trigger_id: false,
    created_by: false,
    report_date: false,
    revision_date: false,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    state: {
      grouping,
      columnVisibility,
      columnFilters,
    },
    onGroupingChange: setGrouping,
    getRowCanExpand: () => true,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  if (isPending) {
    return <Loader/>;
  }
  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <DefaultLayout title = {'Clinical Pulse'}>
      <div className = "grid grid-cols-12">
        <SelectGroupOne
          className = "col-span-9"
          options = {['Fall']}
          label = "Trigger Word / "
          labelLeft = {true}
        />
        <div className = "col-span-3">
          <MagnifyingGlassIcon
            className = "size-5 text-body dark:text-bodydark absolute translate-y-1/3 translate-x-1.5"/>
          <input
            onChange = {(e) => {
              setColumnFilters([{id: 'patient_id', value: e.target.value}]);
            }}
            placeholder = "Search Patient's name or ID"
            className = " w-full py-1 rounded-lg border border-stroke pl-7 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <table className = "border-collapse mt-5 col-span-12 bg-white dark:bg-boxdark shadow-default ">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key = {headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key = {header.id}
                      colSpan = {header.colSpan}
                      className = "py-3 pl-3 border-b-2 border-stroke dark:border-strokedark text-left "
                      style = {{
                        width: header.column.columnDef.meta?.size || 'auto',
                      }}
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
                <>
                  <tr key = {row.id} className = "border-t-stroke border-t">
                    {row.getVisibleCells().map((cell) => {
                      if (cell.getIsGrouped()) {
                        return (
                          <td
                            key = {cell.id}
                            className = "py-2"
                            role = "button"
                            onClick = {row.getToggleExpandedHandler()}
                          >
                            {row.getIsExpanded() ? (
                              <ChevronDownIcon className = "text-body dark:text-bodydark size-6 inline pb-1"/>
                            ) : (
                              <ChevronRightIcon className = "text-body dark:text-bodydark size-6 inline pb-1"/>
                            )}{' '}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        );
                      }
                      if (cell.getIsAggregated()) {
                        return (
                          <td
                            key = {cell.id}
                            className = "py-2"
                            onClick = {row.getToggleExpandedHandler()}
                            role = "button"
                          ></td>
                        );
                      }
                      if (cell.getIsPlaceholder()) {
                        return <td key = {cell.id} className = "py-2"></td>;
                      }
                      if (cell.column.id === 'status') {
                        return (
                          <td key = {cell.id} className = "py-2">
                            <button className = "text-red-500 border p-1 ">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </button>
                          </td>
                        );
                      }
                      return (
                        <td
                          key = {cell.id}
                          className = "py-2"
                          role = "button"
                          onClick = {row.getToggleExpandedHandler()}
                        >
                          {cell.column.id === 'patient_id' ? (
                            row.getIsExpanded() ? (
                              <ChevronDownIcon className = "text-body dark:text-bodydark size-6 inline pb-1"/>
                            ) : (
                              <ChevronRightIcon className = "text-body dark:text-bodydark size-6 inline pb-1"/>
                            )
                          ) : (
                            ''
                          )}{' '}
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {row.getIsExpanded() && row.depth === 1 && (
                    <tr>
                      <td colSpan = {row.getVisibleCells().length}>
                        {renderSubComponent({row})}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </DefaultLayout>
  );
}
