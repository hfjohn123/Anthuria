import { flexRender, Table, TableState } from '@tanstack/react-table';
import { Button } from '@headlessui/react';
import 'primeicons/primeicons.css';
import { ScrollPanel } from 'primereact/scrollpanel';

import { Fragment, useEffect, useRef, useState } from 'react';
import PageNavigation from './PageNavigation.tsx';
import SearchParams from '../../types/SearchParams.ts';
import { useNavigate } from '@tanstack/react-router';
import exportExcel from '../../common/excelExport.ts';
import { DownloadSimple } from '@phosphor-icons/react';
import TableSettingModal from './TableSettingModal.tsx';
import Filters from './Filters.tsx';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import DebouncedInputText from '../Forms/Input/DebouncedInputText.tsx';
import SortUp from '../../images/icon/SortUp.tsx';
import SortDown from '../../images/icon/SortDown.tsx';
import SortDefult from '../../images/icon/SortDefult.tsx';
import clsx from 'clsx';
import { Splitter, SplitterPanel } from 'primereact/splitter';

export default function TableWrapper({
  table,
  tableState,
  setTableState,
  permanentColumnFilters,
  renderExpandedRow,
  download = false,
  tableSetting = false,
  initialTableState,
  filters = true,
  title,
  searchRight,
  placeholder = 'Global Search...',
  splitter = false,
  twoPanel = false,
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
  filters?: boolean;
  title?: string;
  placeholder?: string;
  searchRight?: React.ReactNode;
  splitter?: boolean;
  twoPanel?: boolean;
  [key: string]: any;
}) {
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
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
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
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
      replace: true,
      search: searchParams,
    });
    setTableState((prev) => ({
      ...prev,
      pagination: {
        pageIndex: 0,
        pageSize: prev.pagination.pageSize,
      },
    }));
    if (
      Object.keys(tableState.expanded).length > 0 &&
      splitter &&
      screenWidth >= 1024
    ) {
      if (
        Object.values(
          table.getRow(Object.keys(tableState.expanded)[0]).columnFilters,
        ).some((f) => !f)
      ) {
        setTableState((prev) => ({
          ...prev,
          expanded: {},
        }));
      }
    }
  }, [tableState.columnFilters, tableState.globalFilter]);
  return (
    <div>
      <div className=" bg-white dark:bg-boxdark h-full flex-col flex overflow-x-auto lg:overflow-clip px-7.5 py-5 gap-7.5 rounded-[30px] ">
        {title && (
          <h3 className="text-title-md text-black dark:text-white font-semibold	">
            {title}
          </h3>
        )}
        <div>
          {filters && (
            <div
              ref={filterRef}
              className="sticky  top-0 left-0 flex-none bg-white dark:bg-boxdark z-1 "
            >
              <div className="flex items-center  py-1 gap-4 ">
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
                    placeholder={placeholder}
                    className="w-full py-2"
                  />
                </IconField>
                {searchRight}
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
                {tableSetting && (
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
              />
            </div>
          )}
          {!twoPanel || screenWidth < 1024 ? (
            <>
              <div className="flex-1 relative">
                <table className="w-full border-b-2 border-b-stroke ">
                  <thead
                    className=" bg-white dark:bg-graydark sticky z-1"
                    style={
                      filters
                        ? { top: 'var(--filter-height, 0px)' }
                        : { top: 0 }
                    }
                  >
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <th
                              key={header.id}
                              colSpan={header.colSpan}
                              className={clsx(
                                'shadow-table_header  shadow-stroke z-1   text-left select-none group whitespace-nowrap ',
                                header.column.columnDef.meta?.hideHeader
                                  ? ''
                                  : 'py-3 px-3',
                              )}
                              role="button"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {header.isPlaceholder ? null : (
                                <div className="flex items-center w-full justify-between">
                                  <div
                                    className={
                                      header.column.columnDef.meta?.hideHeader
                                        ? 'hidden'
                                        : ''
                                    }
                                  >
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}
                                    {{
                                      asc: <SortUp className="inline size-5" />,
                                      desc: (
                                        <SortDown className="inline size-5" />
                                      ),
                                    }[
                                      header.column.getIsSorted() as string
                                    ] ?? (
                                      <SortDefult className="inline size-5" />
                                    )}
                                  </div>
                                </div>
                              )}
                            </th>
                          );
                        })}
                      </tr>
                    ))}
                  </thead>
                  {table.getCoreRowModel().rows.length === 0 && (
                    <p>No Record</p>
                  )}
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
                                  className={clsx(
                                    `text-sm `,
                                    cell.column.columnDef.meta?.wrap,
                                    row.getIsExpanded() &&
                                      'bg-slate-100 dark:bg-slate-700',
                                    cell.column.columnDef.meta?.hideHeader
                                      ? 'pl-3'
                                      : 'py-3 px-3',
                                  )}
                                  role="button"
                                  onClick={() => {
                                    if (!splitter || screenWidth < 1024) {
                                      row.toggleExpanded();
                                    } else {
                                      setTableState((prev) => ({
                                        ...prev,
                                        expanded: {
                                          ...((prev.expanded as {
                                            [key: string]: boolean;
                                          }) || {}),
                                          [row.id]: true,
                                        },
                                      }));
                                    }
                                  }}
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
                              <td
                                colSpan={row.getVisibleCells().length}
                                className="p-0"
                              >
                                {renderExpandedRow({
                                  row,
                                  tableState,
                                  ...rest,
                                })}
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
            </>
          ) : (
            <Splitter
              className="border-0 "
              stateStorage="local"
              stateKey="split"
              pt={{
                gutter: () => 'block',
                gutterHandler: () => 'sticky top-[50vh]',
              }}
            >
              <SplitterPanel>
                <div>
                  <div className="flex-1 relative">
                    <table className="w-full border-b-2 border-b-stroke ">
                      <thead
                        className=" bg-white dark:bg-graydark sticky z-1 "
                        style={{ top: 'var(--filter-height, 0px)' }}
                      >
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              return (
                                <th
                                  key={header.id}
                                  colSpan={header.colSpan}
                                  className={clsx(
                                    'shadow-table_header  shadow-stroke z-1   text-left select-none group whitespace-nowrap ',
                                    header.column.columnDef.meta?.hideHeader
                                      ? ''
                                      : 'py-3 px-3',
                                  )}
                                  role="button"
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  {header.isPlaceholder ? null : (
                                    <div className="flex items-center w-full justify-between">
                                      <div
                                        className={
                                          header.column.columnDef.meta
                                            ?.hideHeader
                                            ? 'hidden'
                                            : ''
                                        }
                                      >
                                        {flexRender(
                                          header.column.columnDef.header,
                                          header.getContext(),
                                        )}
                                        {{
                                          asc: (
                                            <SortUp className="inline size-5" />
                                          ),
                                          desc: (
                                            <SortDown className="inline size-5" />
                                          ),
                                        }[
                                          header.column.getIsSorted() as string
                                        ] ?? (
                                          <SortDefult className="inline size-5" />
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </th>
                              );
                            })}
                          </tr>
                        ))}
                      </thead>
                      {table.getCoreRowModel().rows.length === 0 && (
                        <p>No Record</p>
                      )}
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
                                      className={clsx(
                                        `text-sm `,
                                        cell.column.columnDef.meta?.wrap,
                                        row.getIsExpanded() &&
                                          'bg-slate-100 dark:bg-slate-700',
                                        cell.column.columnDef.meta?.hideHeader
                                          ? 'pl-3'
                                          : 'py-3 px-3',
                                      )}
                                      role="button"
                                      onClick={() => {
                                        if (row.getIsExpanded()) {
                                          setTableState((prev) => ({
                                            ...prev,
                                            expanded: {},
                                          }));
                                          return;
                                        }
                                        setTableState((prev) => ({
                                          ...prev,
                                          expanded: {
                                            [row.id]: true,
                                          },
                                        }));
                                      }}
                                    >
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
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
              </SplitterPanel>
              <SplitterPanel>
                <ScrollPanel
                  className="sticky"
                  style={{
                    top: 'var(--filter-height)',
                    height: 'calc(100vh - var(--filter-height) - 70px)',
                    width: '100%',
                  }}
                >
                  {renderExpandedRow({
                    row: table.getRow(Object.keys(tableState.expanded)[0]),
                    tableState,
                  })}
                </ScrollPanel>
              </SplitterPanel>
            </Splitter>
          )}
        </div>
      </div>
    </div>
  );
}
