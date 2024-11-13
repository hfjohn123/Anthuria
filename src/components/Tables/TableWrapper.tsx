import {
  ColumnFiltersState,
  flexRender,
  Table,
  TableState,
} from '@tanstack/react-table';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { Button, Input } from '@headlessui/react';
import Select from 'react-select';
import filterSelectStyles from '../Select/filterSelectStyles.ts';
import filterValueContainer from '../Select/FilterValueContainer.tsx';
import CheckboxOption from '../Select/CheckboxOption.tsx';
import handleFilterChange from './handleFilterChange.ts';
import AutosizeInput from 'react-18-input-autosize';
import DatePicker from 'react-datepicker';
import SortUpIcon from '../../images/icon/sort-up.svg';
import SortDownIcon from '../../images/icon/sort-down.svg';
import { Fragment, useEffect, useState } from 'react';
import PageNavigation from './PageNavigation.tsx';
import SearchParams from '../../types/SearchParams.ts';
import { useNavigate, useSearch } from '@tanstack/react-router';

export default function TableWrapper({
  table,
  tableState,
  setTableState,
  permanentColumnFilters,
  renderExpandedRow,
  ...rest
}: {
  table: Table<any>;
  tableState: TableState;
  setTableState: React.Dispatch<React.SetStateAction<TableState>>;
  permanentColumnFilters: string[];
  renderExpandedRow: any;
  [key: string]: any;
}) {
  const [additionalFilters, setAdditionalFilters] = useState<{
    label: string;
    value: string;
  } | null>(null);
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
      // @ts-ignore next-line
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
        </div>
        <div className="flex p-1 gap-1.5 flex-wrap">
          {permanentColumnFilters.map((filter) => (
            <Select
              classNames={{ ...filterSelectStyles }}
              key={filter}
              placeholder={table.getColumn(filter)?.columnDef.header as string}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={{
                IndicatorSeparator: () => null,
                ValueContainer: filterValueContainer,
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
              onChange={(selected, action) =>
                handleFilterChange(selected, action, setTableState)
              }
            />
          ))}
          {tableState.columnFilters
            .filter((f) => !permanentColumnFilters.includes(f.id))
            .map((filter) =>
              table.getColumn(filter.id)?.columnDef.meta?.type ===
              'categorical' ? (
                <Select
                  classNames={{ ...filterSelectStyles }}
                  key={filter.id}
                  placeholder={
                    table.getColumn(filter.id)?.columnDef?.header as string
                  }
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  defaultMenuIsOpen={true}
                  autoFocus={true}
                  components={{
                    IndicatorSeparator: () => null,
                    ValueContainer: filterValueContainer,
                    Option: CheckboxOption,
                  }}
                  isClearable={true}
                  isMulti={true}
                  value={
                    tableState.columnFilters.find((f) => f.id === filter.id)
                      ? (
                          tableState.columnFilters.find(
                            (f) => f.id === filter.id,
                          )?.value as string[]
                        ).map((s) => ({
                          label: s,
                          value: s,
                        }))
                      : []
                  }
                  name={filter.id}
                  options={Array.from(
                    table
                      ?.getColumn(filter.id)
                      ?.getFacetedUniqueValues()
                      ?.keys() ?? [],
                  ).map((key) => ({
                    label: key,
                    value: key,
                  }))}
                  onChange={(selected, action) => {
                    handleFilterChange(selected, action, setTableState);
                  }}
                  onMenuClose={() => {
                    (
                      tableState.columnFilters.find((f) => f.id === filter.id)
                        ?.value as string[]
                    ).length === 0 &&
                      setTableState((prev) => ({
                        ...prev,
                        columnFilters: prev.columnFilters.filter(
                          (f) => f.id !== filter.id,
                        ),
                      }));
                  }}
                />
              ) : (table.getColumn(filter.id)?.columnDef?.meta?.type || '') ===
                'text' ? (
                <div className="text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 rounded-lg border border-stroke dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  <span className="text-nowrap">
                    {table.getColumn(filter.id)?.columnDef.header as string}{' '}
                    includes
                  </span>
                  <AutosizeInput
                    inputStyle={{
                      outline: 'none',
                      background: 'transparent',
                    }}
                    className="text-sm"
                    onChange={(e: { target: { value: string } }) => {
                      setTableState((prev) => ({
                        ...prev,
                        columnFilters: prev.columnFilters.map((f) =>
                          f.id === filter.id
                            ? {
                                ...f,
                                value: e.target.value,
                              }
                            : f,
                        ),
                      }));
                    }}
                    autoFocus={true}
                    onBlur={() => {
                      (
                        tableState.columnFilters.find((f) => f.id === filter.id)
                          ?.value as string
                      ).length === 0 &&
                        setTableState((prev) => ({
                          ...prev,
                          columnFilters: prev.columnFilters.filter(
                            (f) => f.id !== filter.id,
                          ),
                        }));
                    }}
                    minWidth="30"
                    value={
                      (tableState.columnFilters.find((f) => f.id === filter.id)
                        ?.value as string) || ''
                    }
                  />
                  <button
                    onClick={() => {
                      setTableState((prev) => ({
                        ...prev,
                        columnFilters: prev.columnFilters.filter(
                          (f) => f.id !== filter.id,
                        ),
                      }));
                    }}
                    className="fill-[rgb(204,204,204)]"
                  >
                    <svg
                      height="20"
                      width="20"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
                    </svg>
                  </button>
                </div>
              ) : table.getColumn(filter.id)?.columnDef.meta?.type ===
                'daterange' ? (
                <div className="text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 py-0.5 rounded-lg border border-stroke outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                  <span className="text-nowrap">
                    {table.getColumn(filter.id)?.columnDef.header as string}
                  </span>
                  <DatePicker
                    className="outline-0 w-full bg-transparent "
                    autoFocus={true}
                    selectsRange
                    startDate={
                      (
                        tableState as {
                          columnFilters: { id: string; value: any }[];
                        }
                      ).columnFilters.find((f) => f.id === filter.id)?.value[0]
                    }
                    endDate={
                      (
                        tableState as {
                          columnFilters: { id: string; value: any }[];
                        }
                      ).columnFilters.find((f) => f.id === filter.id)?.value[1]
                    }
                    onChange={([start, end]: [Date | null, Date | null]) => {
                      end && end.setHours(23, 59, 59, 999);
                      setTableState((prev) => ({
                        ...prev,
                        columnFilters: prev.columnFilters.map((f) =>
                          f.id === filter.id
                            ? {
                                ...f,
                                value: [start || null, end || null],
                              }
                            : f,
                        ),
                      }));
                    }}
                    minDate={
                      new Date(
                        table
                          .getColumn(filter.id)
                          ?.getFacetedMinMaxValues()
                          ?.flat()
                          ?.filter((d) => d !== null)[0] ?? '',
                      )
                    }
                    maxDate={
                      new Date(
                        table
                          .getColumn(filter.id)
                          ?.getFacetedMinMaxValues()
                          ?.flat()
                          ?.filter((d) => d !== null)[
                          (table
                            .getColumn(filter.id)
                            ?.getFacetedMinMaxValues()
                            ?.flat()
                            ?.filter((d) => d !== null)?.length ?? 1) - 1
                        ] ?? '',
                      )
                    }
                    onBlur={() => {
                      (
                        tableState.columnFilters.find(
                          (f) => f.id === filter.id,
                        ) as { id: string; value: any }
                      )?.value.length === 0 &&
                        setTableState((prev) => ({
                          ...prev,
                          columnFilters: prev.columnFilters.filter(
                            (f) => f.id !== filter.id,
                          ),
                        }));
                    }}
                  />
                  <Button
                    onClick={() =>
                      setTableState((prev) => ({
                        ...prev,
                        columnFilters: prev.columnFilters.filter(
                          (f) => f.id !== filter.id,
                        ),
                      }))
                    }
                    className="fill-[rgb(204,204,204)]"
                  >
                    <svg
                      height="20"
                      width="20"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
                    </svg>
                  </Button>
                </div>
              ) : null,
            )}
          <Select
            classNames={{ ...filterSelectStyles }}
            placeholder="Add Filter"
            isMulti={false}
            closeMenuOnSelect={true}
            hideSelectedOptions={true}
            components={{ IndicatorSeparator: () => null }}
            value={additionalFilters}
            options={table
              .getAllColumns()
              .filter(
                (c) =>
                  !tableState.columnFilters.find((f) => f.id === c.id) &&
                  !permanentColumnFilters.includes(c.id),
              )
              .map((c) => ({
                label: c.columnDef.header as string,
                value: c.id,
              }))}
            onChange={(newValue) => {
              setTableState((prev) => ({
                ...prev,
                columnFilters: [
                  ...prev.columnFilters,
                  {
                    id: (newValue?.value as string) ?? '',
                    value:
                      table.getColumn(newValue?.value as string)?.columnDef.meta
                        ?.type === 'categorical' ||
                      table.getColumn(newValue?.value as string)?.columnDef.meta
                        ?.type === 'daterange'
                        ? []
                        : '',
                  },
                ],
              }));
              setAdditionalFilters(null);
            }}
          />
          {tableState.columnFilters.length > 0 && (
            <button
              className="text-sm"
              onClick={() =>
                setTableState((prev) => ({ ...prev, columnFilters: [] }))
              }
            >
              Clear all
            </button>
          )}
        </div>
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
