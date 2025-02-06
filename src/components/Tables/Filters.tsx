import Select from 'react-select';
import filterSelectStyles from '../Select/filterSelectStyles.ts';
import filterValueContainer from '../Select/FilterValueContainer.tsx';
import FilterValueContainer from '../Select/FilterValueContainer.tsx';
import CheckboxOption from '../Select/CheckboxOption.tsx';
import handleFilterChange from './handleFilterChange.ts';
import AutosizeInput from 'react-18-input-autosize';
import { Table, TableState } from '@tanstack/react-table';
import DateTimeDropdown from './DateTimeFilter/DateTimeDropdown.tsx';
import { useContext, useRef } from 'react';
import { AuthContext } from '../AuthWrapper.tsx';

// Base interface with common props
type FilterProps = {
  table: Table<any>;
  permanentColumnFilters: string[];
  setTableState: React.Dispatch<React.SetStateAction<TableState>>;
  tableState: TableState;
  initialTableState: TableState;
};

export default function Filters({
  table,
  permanentColumnFilters,
  setTableState,
  tableState,
  initialTableState,
}: FilterProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user_data } = useContext(AuthContext);
  const setValueFunction = (
    [start, end]: [number | null, number | null],
    filter: string,
  ) => {
    const startDay = start ? new Date(start).setHours(0, 0, 0, 0) : null;
    const endDay = end ? new Date(end).setHours(23, 59, 59, 999) : null;
    setTableState((prev) => ({
      ...prev,
      columnFilters: prev.columnFilters
        .filter((f) => f.id !== filter)
        .concat({
          id: filter,
          value: [startDay, endDay],
        }),
    }));
  };

  return (
    <div className="flex justify-between pr-3 gap-3 items-center">
      <div className="flex p-1 gap-1.5 flex-wrap">
        {permanentColumnFilters.map((filter) => {
          const value = tableState.columnFilters.find((f) => f.id === filter)
            ?.value as [number | null, number | null];

          return table.getColumn(filter)?.columnDef.meta?.type ===
            'categorical' ? (
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
              onClick={() => inputRef.current?.focus()}
              className="cursor-pointer text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 rounded-lg border border-stroke dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                ref={inputRef}
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
              value={value}
              setValue={(value: [number | null, number | null]) =>
                setValueFunction(value, filter)
              }
              clearFilter={() =>
                filter === 'revision_date' &&
                user_data.organization_id !== 'AVHC'
                  ? setValueFunction(
                      [Date.now() - 1000 * 60 * 60 * 24, Date.now()],
                      filter,
                    )
                  : setTableState((prev) => ({
                      ...prev,
                      columnFilters: prev.columnFilters.filter(
                        (f) => f.id !== filter,
                      ),
                    }))
              }
              minDate={
                filter === 'revision_date' &&
                user_data.organization_id !== 'AVHC'
                  ? undefined
                  : (table
                      .getColumn(filter)
                      ?.getFacetedMinMaxValues()
                      ?.flat()
                      ?.filter((d) => d !== null)[0] ?? 0)
              }
              maxDate={
                filter === 'revision_date' &&
                user_data.organization_id !== 'AVHC'
                  ? Math.min(
                      value && value[0]
                        ? value[1]
                          ? Date.now()
                          : value[0] + 1000 * 60 * 60 * 24 * 7
                        : 999999999999998,
                      Date.now(),
                    ) || Date.now()
                  : (table
                      .getColumn(filter)
                      ?.getFacetedMinMaxValues()
                      ?.flat()
                      ?.filter((d) => d !== null)[
                      (table
                        .getColumn(filter)
                        ?.getFacetedMinMaxValues()
                        ?.flat()
                        ?.filter((d) => d !== null)?.length ?? 1) - 1
                    ] ?? 0)
              }
            />
          ) : null;
        })}{' '}
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
                className="cursor-pointer text-sm has-[:focus]:!shadow-filter has-[:focus]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 rounded-lg border border-stroke dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                  tableState.columnFilters.find((f) => f.id === filter.id)
                    ?.value as [number | null, number | null]
                }
                setValue={(value: [number | null, number | null]) => {
                  setValueFunction(value, filter.id);
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
                  table
                    .getColumn(filter.id)
                    ?.getFacetedMinMaxValues()
                    ?.flat()
                    ?.filter((d) => d !== null)[0] ?? 0
                }
                maxDate={
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
                  ] ?? 0
                }
              />
            ) : null,
          )}
        {table
          .getAllColumns()
          .filter(
            (c) =>
              !tableState.columnFilters.find((f) => f.id === c.id) &&
              !permanentColumnFilters.includes(c.id),
          ).length > 0 && (
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
                  !permanentColumnFilters.includes(c.id) &&
                  c.getCanFilter(),
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
        )}
        {tableState.columnFilters.length > 0 && (
          <button
            className="text-sm"
            onClick={() =>
              setTableState((prev) => ({
                ...prev,
                columnFilters: initialTableState.columnFilters,
                globalFilter: initialTableState.globalFilter,
              }))
            }
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
