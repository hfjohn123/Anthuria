import { flexRender, Table } from '@tanstack/react-table';
import { Fragment } from 'react';

export default function SmallTableWrapper({ table }: { table: Table<any> }) {
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
      <div className="overflow-x-auto shadow-sm border border-gray-600 rounded-lg  text-[#4b5563]">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="py-2 px-4  border-r border-gray-600 first:border-l-0 last:border-r-0 text-left select-none group whitespace-nowrap text-body-2 bg-gray-50"
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
                    return (
                      <Fragment key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Fragment>
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

                    return header.isPlaceholder ? null : (
                      <Fragment key={header.id}>
                        {flexRender(
                          header.column.columnDef.footer,
                          header.getContext(),
                        )}
                      </Fragment>
                    );
                  })}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>

      {table.getRowModel().rows.length === 0 && <p>No record found</p>}
    </div>
  );
}
