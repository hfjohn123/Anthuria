import {
  ColumnFiltersState,
  flexRender,
  Table,
  TableState,
} from '@tanstack/react-table';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { Button, Input } from '@headlessui/react';

import SortUpIcon from '../../images/icon/sort-up.svg';
import SortDownIcon from '../../images/icon/sort-down.svg';
import { Fragment, useEffect } from 'react';
import PageNavigation from './PageNavigation.tsx';
import SearchParams from '../../types/SearchParams.ts';
import { useNavigate, useSearch } from '@tanstack/react-router';
import exportExcel from '../../common/excelExport.ts';
import { DownloadSimple } from '@phosphor-icons/react';
import TableSettingModal from './TableSettingModal.tsx';
import Filters from './Filters.tsx';

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
  [key: string]: any;
}) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  useEffect(() => {
    const initialFilters: ColumnFiltersState = [];

    Object.entries(search).forEach(([key, value]) => {
      if (value) {
        if (
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
      // @ts-expect-error TS2339: Property 'search' does not exist on type 'SearchParams'.
      search: searchParams,
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
    <div className=" bg-white dark:bg-boxdark shadow-default h-full flex-col flex ">
      <div className="sticky top-0 flex-none bg-white dark:bg-boxdark z-30">
        <div className="flex items-center border-b border-stroke">
          <MagnifyingGlassIcon className="size-5 text-body dark:text-bodydark mx-1" />
          <Input
            onChange={(e) => {
              setTableState((prev) => ({
                ...prev,
                globalFilter: e.target.value,
              }));
            }}
            value={tableState.globalFilter}
            placeholder="Global Search"
            className=" w-full py-2 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
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
      <div className="relative flex-1">
        <table className="w-full border-b-2 border-b-stroke ">
          <thead className="bg-slate-50 dark:bg-graydark sticky top-18 z-20">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="py-3 shadow-table_header  shadow-stroke z-20 px-3  text-left select-none group whitespace-nowrap "
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
                            }[header.column.getNextSortingOrder() as string] ??
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
                        {renderExpandedRow({ row, ...rest })}
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
  );
}
