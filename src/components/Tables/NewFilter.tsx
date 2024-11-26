import { Dropdown } from 'primereact/dropdown';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Funnel } from '@phosphor-icons/react';
import { Table, TableState } from '@tanstack/react-table';
import { Dispatch, useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import 'primeicons/primeicons.css';
import DateTimeFilter from './DateTimeFilter/DateTimeFilter.tsx';
import clsx from 'clsx';

export default function NewFilter({
  options,
  table,
  tableState,
  setTableState,
}: {
  options: any;
  table: Table<any>;
  tableState: TableState;
  setTableState: Dispatch<React.SetStateAction<TableState>>;
}) {
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);

  return (
    <>
      <div className="flex gap-3 items-center">
        <label>FACILITY</label>
        <Dropdown
          options={options}
          showClear
          showFilterClear
          filterInputAutoFocus
          value={
            (
              tableState.columnFilters.find(
                (f) => f.id === 'facility_name',
              ) as { id: string; value: any[] }
            )?.value[0]
          }
          onChange={(e) => {
            if (e.value) {
              setTableState((prev) => ({
                ...prev,
                columnFilters: prev.columnFilters
                  .filter((f) => f.id !== 'facility_name')
                  .concat({
                    id: 'facility_name',
                    value: [e.value],
                  }),
              }));
            } else {
              setTableState((prev) => ({
                ...prev,
                columnFilters: prev.columnFilters.filter(
                  (f) => f.id !== 'facility_name',
                ),
              }));
            }
          }}
          className="w-70"
          pt={{
            input: {
              className: 'text-body-1 py-2',
            },
            itemLabel: {
              className: 'text-body-1',
            },
          }}
          filter
        />
      </div>
      <div className="flex gap-8 items-center">
        <IconField className="flex-1" iconPosition="left">
          {/*<MagnifyingGlass size={20} className="inline" />*/}
          <InputIcon className="pi pi-search text-body-2"> </InputIcon>
          <InputText
            value={tableState.globalFilter}
            className="w-full py-2"
            onChange={(e) =>
              setTableState((prev) => ({
                ...prev,
                globalFilter: e.target.value,
              }))
            }
            placeholder="Global Search..."
          />
        </IconField>
        <div className="flex gap-2 items-center">
          <Checkbox onChange={() => null} checked={false} />
          <label>Needs Review Only</label>
        </div>
        <div className="card flex justify-content-center">
          <Sidebar
            visible={filterSidebarOpen}
            position="right"
            onHide={() => setFilterSidebarOpen(false)}
            className="w-[31rem]"
          >
            <Accordion multiple activeIndex={[0]}>
              {table.getAllColumns().map(
                (column) =>
                  column.getCanFilter() && (
                    <AccordionTab
                      key={column.id}
                      header={column.columnDef.header as string}
                    >
                      {column.columnDef.meta?.type === 'categorical' && (
                        <Dropdown />
                      )}
                      {column.columnDef.meta?.type === 'daterange' && (
                        <DateTimeFilter
                          value={
                            tableState.columnFilters.find(
                              (f) => f.id === column.id,
                            )?.value as [Date, Date]
                          }
                          setValue={([start, end]: [
                            Date | null,
                            Date | null,
                          ]) => {
                            end && end.setHours(23, 59, 59, 999);
                            setTableState((prev) => ({
                              ...prev,
                              columnFilters: prev.columnFilters
                                .filter((f) => f.id !== column.id)
                                .concat({
                                  id: column.id,
                                  value: [start, end],
                                }),
                            }));
                          }}
                          minDate={
                            new Date(
                              table
                                .getColumn(column.id)
                                ?.getFacetedMinMaxValues()
                                ?.flat()
                                ?.filter((d) => d !== null)[0] ?? '',
                            )
                          }
                          maxDate={
                            new Date(
                              table
                                .getColumn(column.id)
                                ?.getFacetedMinMaxValues()
                                ?.flat()
                                ?.filter((d) => d !== null)[
                                (table
                                  .getColumn(column.id)
                                  ?.getFacetedMinMaxValues()
                                  ?.flat()
                                  ?.filter((d) => d !== null)?.length ?? 1) - 1
                              ] ?? '',
                            )
                          }
                        />
                      )}
                      {column.columnDef.meta?.type === 'text' && (
                        <IconField iconPosition="right">
                          <InputText
                            className="w-full"
                            value={
                              (tableState.columnFilters.find(
                                (f) => f.id === column.id,
                              )?.value as string) || ''
                            }
                            onChange={(e: { target: { value: string } }) => {
                              console.log(tableState.columnFilters);
                              setTableState((prev) => ({
                                ...prev,
                                columnFilters: prev.columnFilters
                                  .filter((f) => f.id !== column.id)
                                  .concat({
                                    id: column.id,
                                    value: e.target.value,
                                  }),
                              }));
                            }}
                          />
                          <InputIcon
                            className={clsx(
                              'pi pi-times text-body-2 ',
                              tableState.columnFilters.find(
                                (f) => f.id === column.id,
                              )
                                ? '!inline-block'
                                : '!hidden',
                            )}
                            role="button"
                            onClick={() => {
                              setTableState((prev) => ({
                                ...prev,
                                columnFilters: prev.columnFilters.filter(
                                  (f) => f.id !== column.id,
                                ),
                              }));
                            }}
                          />
                        </IconField>
                      )}
                    </AccordionTab>
                  ),
              )}
            </Accordion>
          </Sidebar>
          <Button
            className="bg-transparent border-0 text-body-2 p-0"
            onClick={() => setFilterSidebarOpen(true)}
          >
            <Funnel size={22} />
          </Button>
        </div>
      </div>
    </>
  );
}
