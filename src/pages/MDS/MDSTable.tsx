import {
  ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  TableState,
  useReactTable,
} from '@tanstack/react-table';

import { useState, useEffect } from 'react';
import getFacetedUniqueValues from '../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../common/getFacetedMinMaxValues.ts';
import HyperLink from '../../components/Basic/HyerLink.tsx';
import dateRangeFilterFn from '../../common/dateRangeFilterFn.ts';
import { MDSFinal } from '../../types/MDSFinal.ts';
import TableWrapper from '../../components/Tables/TableWrapper.tsx';
import MDSDetail from './MDSDetail.tsx';

const PERMANENT_COLUMN_FILTERS = ['facility_name'];

export default function MDSTable({ data }: { data: MDSFinal[] }) {
  const columns: ColumnDef<MDSFinal>[] = [
    {
      accessorKey: 'facility_name',
      header: 'Facility',
      meta: {
        wrap: 'whitespace-nowrap',
        type: 'categorical',
      },
      filterFn: 'arrIncludesSome',
    },
    {
      accessorKey: 'patient_name',
      cell: (info) => {
        if (info.row.original.upstream === 'MTX') {
          return (
            <>
              <HyperLink
                tooltip_content={'View Patient in MaxtrixCare'}
                className="patient_link"
                href={`https://clearviewhcm.matrixcare.com/core/selectResident.action?residentID=${info.row.original.patient_id}`}
              >
                {info.row.getValue('patient_name')}
              </HyperLink>
              <p className="text-body-2">
                {info.row.getValue('facility_name')}
              </p>
            </>
          );
        }
        if (info.row.original.upstream === 'PCC') {
          return (
            <>
              <HyperLink
                tooltip_content={'View Patient in PCC'}
                className="patient_link"
                href={`https://www19.pointclickcare.com/admin/client/clientlist.jsp?ESOLtabtype=C&ESOLglobalclientsearch=Y&ESOLclientid=${info.row.original.patient_id}&ESOLfacid=${info.row.original.internal_facility_id.split('_').pop()}&ESOLsave=P`}
              >
                {info.row.getValue('patient_name')}
              </HyperLink>
              <p className="text-body-2">
                {info.row.getValue('facility_name')}
              </p>
            </>
          );
        }
        return info.renderValue();
      },
      header: 'Patient',
      filterFn: 'includesString',
      meta: {
        wrap: 'whitespace-pre',
        type: 'text',
      },
    },
    {
      accessorKey: 'update_time',
      header: 'Update Time',
      accessorFn: (row) => new Date(row.update_time),
      cell: (info) => {
        const date = info.getValue() as Date;
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString(
          navigator.language,
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        )}`;
      },
      filterFn: dateRangeFilterFn,
      meta: {
        wrap: 'whitespace-nowrap',
        type: 'daterange',
      },
    },
    {
      accessorKey: 'existing_icd10',
      header: 'Existing ICD-10 Related to NTA and SLP',
      accessorFn: (row) => row.existing_icd10.concat(row.existing_slp_icd10),
      cell: (info) => {
        return (
          <p className="line-clamp-2">
            {info.row.original.existing_icd10
              .concat(info.row.original.existing_slp_icd10)
              .join(', ')}
          </p>
        );
      },
      filterFn: 'arrIncludesSome',
      sortingFn: (rowA, rowB) => {
        return rowA.original.existing_icd10.length <
          rowB.original.existing_icd10.length
          ? -1
          : 1;
      },
      meta: {
        wrap: 'whitespace-normal',
        type: 'categorical',
      },
    },
    {
      accessorKey: 'new_icd10',
      accessorFn: (row) => row.new_nta_icd10.map((d) => d.icd10),
      header: 'New ICD-10',
      cell: (info) => {
        return (
          <p className="line-clamp-2">
            {(info.getValue() as string[]).join(', ')}
          </p>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.new_nta_icd10.length <
          rowB.original.new_nta_icd10.length
          ? -1
          : 1;
      },
      filterFn: 'arrIncludesSome',
      meta: {
        wrap: 'whitespace-normal',
        type: 'categorical',
      },
    },
  ];
  const [tableState, setTableState] = useState<TableState>({
    globalFilter: '',
    columnSizing: {},
    columnSizingInfo: {
      startOffset: null,
      startSize: null,
      deltaOffset: null,
      deltaPercentage: null,
      isResizingColumn: false,
      columnSizingStart: [],
    },
    rowSelection: {},
    rowPinning: {
      top: [],
      bottom: [],
    },
    expanded: {},
    grouping: [],
    sorting: [],
    columnFilters: [],
    columnPinning: {
      left: [],
      right: [],
    },
    columnOrder: [],
    columnVisibility:
      window.screen.width < 1024
        ? {
            facility_name: false,
            patient_name: true,
            update_time: true,
            existing_icd10: true,
          }
        : {
            facility_name: false,
            patient_name: true,
            update_time: true,
            existing_icd10: true,
          },
    pagination: {
      pageIndex: 0,
      pageSize: 30,
    },
  });
  const table = useReactTable({
    data: data,
    columns,
    state: tableState,
    onStateChange: setTableState,
    getRowCanExpand: () => true,
    autoResetPageIndex: false,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    autoResetExpanded: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for numeric range filter
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  useEffect(() => {
    localStorage.setItem(
      'MDSUserVisibilitySettings',
      JSON.stringify(tableState.columnVisibility),
    );
  }, [tableState.columnVisibility]);
  useEffect(() => {
    setTableState((prev) => ({
      ...prev,
      pagination: {
        pageIndex: 0,
        pageSize: prev.pagination.pageSize,
      },
    }));
  }, [tableState.columnFilters, tableState.globalFilter]);
  return (
    <TableWrapper
      table={table}
      tableState={tableState}
      setTableState={setTableState}
      permanentColumnFilters={PERMANENT_COLUMN_FILTERS}
      renderExpandedRow={MDSDetail}
    ></TableWrapper>
  );
}
