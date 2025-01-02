// src/components/Tables/PrimeTableWrapper.tsx
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useState, useEffect } from 'react';

interface PrimeTableWrapperProps {
  value: any[];
  columns: any[];
  filters: any;
  onFilter: (e: any) => void;
  onSort: (e: any) => void;
  onPage: (e: any) => void;
  // Add other props as needed
}

const PrimeTableWrapper = (props: PrimeTableWrapperProps) => {
  const [filters, setFilters] = useState(props.filters);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);

  useEffect(() => {
    // Update filters, sort, and page state when props change
  }, [props]);

  const onFilter = (e: any) => {
    setFilters(e.filters);
    props.onFilter(e);
  };

  const onSort = (e: any) => {
    setSortField(e.sortField);
    setSortOrder(e.sortOrder);
    props.onSort(e);
  };

  const onPage = (e: any) => {
    setPage(e.page);
    setRows(e.rows);
    props.onPage(e);
  };

  const header = (
    <div className="p-d-flex p-jc-between">
      <h5>Table Title</h5>
      <Button type="button" icon="pi pi-external-link" />
    </div>
  );

  const footer = (
    <div className="p-d-flex p-jc-between">
      <Button type="button" icon="pi pi-refresh" />
      <Button type="button" icon="pi pi-download" />
    </div>
  );

  return (
    <div className="p-datatable-wrapper">
      <DataTable
        value={props.value}
        filters={filters}
        filter={onFilter}
        sortField={sortField}
        sortOrder={sortOrder}
        sortMode="multiple"
        onSort={onSort}
        paginator
        rows={rows}
        onPage={onPage}
        page={page}
        responsiveLayout="scroll"
        breakpoint="960px"
        header={header}
        footer={footer}
      >
        {props.columns.map((column, index) => (
          <Column
            key={column.field}
            field={column.field}
            header={column.header}
            sortable={column.sortable}
            filter={column.filter}
            filterMatchMode={column.filterMatchMode}
          />
        ))}
      </DataTable>
    </div>
  );
};

export default PrimeTableWrapper;
