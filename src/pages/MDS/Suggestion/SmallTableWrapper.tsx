import Select from 'react-select';
import filterSelectStyles from '../../../components/Select/filterSelectStyles.ts';
import FilterValueContainer from '../../../components/Select/FilterValueContainer.tsx';
import CheckboxOption from '../../../components/Select/CheckboxOption.tsx';
import handleFilterChange from '../../../components/Tables/handleFilterChange.ts';
import { Button } from '@headlessui/react';
import { flexRender, Table, TableState } from '@tanstack/react-table';

export default function SmallTableWrapper({
  permanentColumnFilters,
  table,
  tableState,
  setTableState,
}: {
  permanentColumnFilters: string[];
  table: Table<any>;
  tableState: TableState;
  setTableState: React.Dispatch<React.SetStateAction<TableState>>;
}) {
  const hasFooterContent = (table: Table<any>) => {
    return table
      .getFooterGroups()
      .some((group) =>
        group.headers.some(
          (header) => header.column.columnDef.footer !== undefined,
        ),
      );
  };

  return (
    <div>
      <div className="w-full flex items-center gap-3 mt-1">
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
              table?.getColumn(filter)?.getFacetedUniqueValues()?.keys() ?? [],
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

      <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg mt-3">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="py-2 px-4 border-b border-r border-gray-200 first:border-l-0 last:border-r-0 text-left select-none group whitespace-nowrap text-body-2 bg-gray-50"
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
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {table.getRowModel().rows.length > 0 && hasFooterContent(table) && (
            <tfoot>
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header) => {
                    if (!header.column.columnDef.footer) {
                      return (
                        <td
                          key={header.id}
                          className="py-2 px-4 border-l border-t first:border-l-0 last:border-r-0"
                        />
                      );
                    }

                    return header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext(),
                        );
                  })}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>

      {table.getRowModel().rows.length === 0 && <p>No data available</p>}
    </div>
  );
}
