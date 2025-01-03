import {
  ColumnFiltersState,
  flexRender,
  Table,
  TableState,
} from '@tanstack/react-table';
import { Button } from '@headlessui/react';
import 'primeicons/primeicons.css';

import { Fragment, useEffect, useRef } from 'react';
import PageNavigation from './PageNavigation.tsx';
import SearchParams from '../../types/SearchParams.ts';
import { useNavigate, useSearch } from '@tanstack/react-router';
import exportExcel from '../../common/excelExport.ts';
import { DownloadSimple, Funnel } from '@phosphor-icons/react';
import TableSettingModal from './TableSettingModal.tsx';
import Filters from './Filters.tsx';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import DebouncedInputText from '../Forms/Input/DebouncedInputText.tsx';
import { isBoolean } from 'lodash';
import SortUp from '../../images/icon/SortUp.tsx';
import SortDown from '../../images/icon/SortDown.tsx';
import SortDefult from '../../images/icon/SortDefult.tsx';

export default function TableWrapper({
  table,
  tableState,
  setTableState,
  permanentColumnFilters,
  renderExpandedRow,
  download = false,
  tableSetting = false,
  initialTableState,
  hasHistory = false,
  setIsRefetching,
  includeCreatedDate,
  setIncludeCreatedDate,
  filters = true,
  title,
  ...rest
}: {
  table: Table<any>;
  tableState: TableState;
  setTableState: React.Dispatch<React.SetStateAction<TableState>>;
  permanentColumnFilters: string[];
  renderExpandedRow: any;
  download?: boolean;
  tableSetting?: boolean;
  initialTableState?: TableState;
  hasHistory?: boolean;
  setIsRefetching?: React.Dispatch<React.SetStateAction<boolean>>;
  includeCreatedDate?: boolean;
  setIncludeCreatedDate?: React.Dispatch<React.SetStateAction<boolean>>;
  filters?: boolean;
  title?: string;
  [key: string]: any;
}) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const filterRef = useRef(null);

  useEffect(() => {
    const initialFilters: ColumnFiltersState = [];

    Object.entries(search).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !isBoolean(value)) {
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

    if (!filterRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Update CSS variable with current filter height
        document.documentElement.style.setProperty(
          '--filter-height',
          `${entry.contentRect.height}px`,
        );
      }
    });

    resizeObserver.observe(filterRef.current);

    return () => resizeObserver.disconnect();
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
        // @ts-expect-error TS2339: Property 'search' does not exist on type 'SearchParams'.
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

  return (
    <div>
      <p className="bg-transparent">
        {table.getFilteredRowModel().rows.length} of{' '}
        {table.getCoreRowModel().rows.length}{' '}
        {table.getCoreRowModel().rows.length >= 1 ? 'records' : 'record'} are
        displayed
      </p>
      <div className=" bg-white dark:bg-boxdark h-full flex-col flex overflow-x-auto lg:overflow-clip p-7.5 gap-7.5 rounded-[30px] ">
        <h3 className="text-title-md text-black dark:text-white font-semibold	">
          {title}
        </h3>
        <div>
          {filters && (
            <div
              ref={filterRef}
              className="sticky  top-0 left-0 flex-none bg-white dark:bg-boxdark z-1 "
            >
              <div className="flex items-center border-b border-stroke py-1 gap-4 ">
                <IconField iconPosition="left" className=" flex-1 ">
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
                    className="w-full "
                  />
                </IconField>
                {download && (
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
                )}
                {tableSetting && initialTableState && (
                  <TableSettingModal
                    table={table}
                    tableState={tableState}
                    setTableState={setTableState}
                    initialTableState={initialTableState}
                  />
                )}
              </div>
              <Filters
                permanentColumnFilters={permanentColumnFilters}
                table={table}
                tableState={tableState}
                setTableState={setTableState}
                hasHistory={hasHistory}
                setIsRefetching={setIsRefetching}
                includeCreatedDate={includeCreatedDate}
                setIncludeCreatedDate={setIncludeCreatedDate}
              />
            </div>
          )}

          <div className="flex-1 relative">
            <table className="w-full border-b-2 border-b-stroke ">
              <thead
                className="bg-slate-50 dark:bg-graydark sticky z-1"
                style={
                  filters ? { top: 'var(--filter-height, 0px)' } : { top: 0 }
                }
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          className="py-3 shadow-table_header  shadow-stroke z-1 px-3  text-left select-none group whitespace-nowrap "
                          role="button"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.isPlaceholder ? null : (
                            <div className="flex items-center">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              <div>
                                {{
                                  asc: <SortUp className="inline size-5" />,
                                  desc: <SortDown className="inline size-5" />,
                                }[header.column.getIsSorted() as string] ?? (
                                  <SortDefult className="inline size-5" />
                                )}
                              </div>
                              {/*{header.column.getCanFilter() &&*/}
                              {/*  header.column.columnDef.filterFn && (*/}
                              {/*    <Funnel className="inline size-5 opacity-70" />*/}
                              {/*  )}*/}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              {table.getCoreRowModel().rows.length === 0 && <p>No Record</p>}

              <tbody>
                {table.getRowModel().rows.length === 0 &&
                  table.getCoreRowModel().rows.length !== 0 && (
                    <tr>
                      <td className="whitespace-nowrap">
                        No Record matches your filter
                      </td>
                    </tr>
                  )}
                {table.getRowModel().rows.map((row) => {
                  return (
                    <Fragment key={row.id}>
                      <tr className="border-t-stroke border-t ">
                        {row.getVisibleCells().map((cell) => {
                          return (
                            <td
                              key={cell.id}
                              className={`py-2 px-3 w-[${cell.column.getSize() || 'auto'}] text-sm ${cell.column.columnDef.meta?.wrap} ${row.getIsExpanded() && 'bg-slate-100 dark:bg-slate-700'} `}
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
                          <td colSpan={row.getVisibleCells().length}>
                            {renderExpandedRow({ row, tableState, ...rest })}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex-none">
            <PageNavigation table={table} tableState={tableState} />
          </div>
        </div>
      </div>
    </div>
  );
}
