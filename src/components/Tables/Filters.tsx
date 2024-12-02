import Select from 'react-select';
import filterSelectStyles from '../Select/filterSelectStyles.ts';
import filterValueContainer from '../Select/FilterValueContainer.tsx';
import CheckboxOption from '../Select/CheckboxOption.tsx';
import handleFilterChange from './handleFilterChange.ts';
import AutosizeInput from 'react-18-input-autosize';
import { Button } from '@headlessui/react';
import { Table, TableState } from '@tanstack/react-table';
import FilterValueContainer from '../Select/FilterValueContainer.tsx';
import { useNavigate, useSearch } from '@tanstack/react-router';
import DateTimeDropdown from './DateTimeFilter/DateTimeDropdown.tsx';

// Base interface with common props
type FilterProps = {
  table: Table<any>;
  permanentColumnFilters: string[];
  setTableState: React.Dispatch<React.SetStateAction<TableState>>;
  tableState: TableState;
} & (
  | {
      hasHistory: true;
      setIsRefetching: React.Dispatch<React.SetStateAction<boolean>>;
      includeCreatedDate: boolean;
      setIncludeCreatedDate: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | {
      hasHistory?: boolean;
      setIsRefetching?: any;
      includeCreatedDate?: any;
      setIncludeCreatedDate?: any;
    }
);

export default function Filters({
  table,
  permanentColumnFilters,
  setTableState,
  tableState,
  hasHistory,
  setIsRefetching,
  includeCreatedDate,
  setIncludeCreatedDate,
}: FilterProps) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  return (
    <div className="flex justify-between pr-3 gap-3 items-center">
      <div className="flex p-1 gap-1.5 flex-wrap">
        {permanentColumnFilters.map((filter) =>
          table.getColumn(filter)?.columnDef.meta?.type === 'categorical' ? (
            <Select
              classNames={{ ...filterSelectStyles }}
              key={filter}
              placeholder={table.getColumn(filter)?.columnDef.header as string}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              menuPortalTarget={document.body}
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
          ) : table.getColumn(filter)?.columnDef.meta?.type === 'text' ? (
            <div
              key={filter}
              className="text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 rounded-lg border border-stroke dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <span className="text-nowrap">
                {table.getColumn(filter)?.columnDef.header as string}{' '}
                {tableState.columnFilters.find((f) => f.id === filter) &&
                  'includes'}
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
                    columnFilters: prev.columnFilters
                      .filter((f) => f.id !== filter)
                      .concat({
                        id: filter,
                        value: e.target.value,
                      }),
                  }));
                }}
                onBlur={() => {
                  (
                    tableState.columnFilters.find((f) => f.id === filter)
                      ?.value as string
                  ).length === 0 &&
                    setTableState((prev) => ({
                      ...prev,
                      columnFilters: prev.columnFilters.filter(
                        (f) => f.id !== filter,
                      ),
                    }));
                }}
                minWidth="30"
                value={
                  (tableState.columnFilters.find((f) => f.id === filter)
                    ?.value as string) || ''
                }
              />
              {(
                tableState.columnFilters.find((f) => f.id === filter)
                  ?.value as string
              )?.length > 0 && (
                <button
                  onClick={() => {
                    setTableState((prev) => ({
                      ...prev,
                      columnFilters: prev.columnFilters.filter(
                        (f) => f.id !== filter,
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
              )}
            </div>
          ) : table.getColumn(filter)?.columnDef.meta?.type === 'daterange' ? (
            <DateTimeDropdown
              key={filter}
              id={table.getColumn(filter)?.columnDef.header as string}
              autoFocus={false}
              value={
                tableState.columnFilters.find((f) => f.id === filter)
                  ?.value as [Date, Date]
              }
              setValue={([start, end]: [Date | null, Date | null]) => {
                end && end.setHours(23, 59, 59, 999);
                setTableState((prev) => ({
                  ...prev,
                  columnFilters: prev.columnFilters
                    .filter((f) => f.id !== filter)
                    .concat({
                      id: filter,
                      value: [start, end],
                    }),
                }));
              }}
              clearFilter={() =>
                setTableState((prev) => ({
                  ...prev,
                  columnFilters: prev.columnFilters.filter(
                    (f) => f.id !== filter,
                  ),
                }))
              }
              minDate={
                new Date(
                  table
                    .getColumn(filter)
                    ?.getFacetedMinMaxValues()
                    ?.flat()
                    ?.filter((d) => d !== null)[0] ?? '',
                )
              }
              maxDate={
                new Date(
                  table
                    .getColumn(filter)
                    ?.getFacetedMinMaxValues()
                    ?.flat()
                    ?.filter((d) => d !== null)[
                    (table
                      .getColumn(filter)
                      ?.getFacetedMinMaxValues()
                      ?.flat()
                      ?.filter((d) => d !== null)?.length ?? 1) - 1
                  ] ?? '',
                )
              }
            />
          ) : null,
        )}{' '}
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
                menuPortalTarget={document.body}
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
                        tableState.columnFilters.find((f) => f.id === filter.id)
                          ?.value as string[]
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
              <div
                key={filter.id}
                className="text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 rounded-lg border border-stroke dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
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
              <DateTimeDropdown
                key={filter.id}
                id={table.getColumn(filter.id)?.columnDef.header as string}
                value={
                  tableState.columnFilters.filter((f) => f.id === filter.id)[0]
                    .value as [Date, Date]
                }
                setValue={([start, end]: [Date | null, Date | null]) => {
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
                clearFilter={() =>
                  setTableState((prev) => ({
                    ...prev,
                    columnFilters: prev.columnFilters.filter(
                      (f) => f.id !== filter.id,
                    ),
                  }))
                }
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
              />
            ) : null,
          )}
        <Select
          classNames={{ ...filterSelectStyles }}
          placeholder="Add Filter"
          isMulti={false}
          closeMenuOnSelect={true}
          hideSelectedOptions={true}
          menuPortalTarget={document.body}
          components={{ IndicatorSeparator: () => null }}
          value={null}
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
      {hasHistory && (
        <Button
          className="whitespace-nowrap text-primary"
          onClick={() => {
            setIsRefetching(true);
            setIncludeCreatedDate(!includeCreatedDate);
            navigate({
              search: { ...search, history: includeCreatedDate },
              replace: true,
            });
          }}
        >
          {includeCreatedDate ? 'Show all Historical' : 'Show Two Weeks'}
        </Button>
      )}
    </div>
  );
}
