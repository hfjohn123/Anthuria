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
import { useState, useEffect, useContext } from 'react';
import getFacetedUniqueValues from '../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../common/getFacetedMinMaxValues.ts';
import HyperLink from '../../../components/Basic/HyerLink.tsx';
import dateRangeFilterFn from '../../../common/dateRangeFilterFn.ts';
import { MDSFinal } from '../../../types/MDSFinal.ts';
import TableWrapper from '../../../components/Tables/TableWrapper.tsx';
import MDSDetail from './MDSDetail.tsx';
import { AuthContext } from '../../../components/AuthWrapper.tsx';

export default function MDSTable({ data }: { data: MDSFinal[] }) {
  const { user_data } = useContext(AuthContext);
  const PERMANENT_COLUMN_FILTERS =
    user_data.organization_id === 'the_triedge_lab'
      ? ['operation_name', 'facility_name', 'update_time', 'patient_name']
      : ['facility_name', 'update_time', 'patient_name'];
  const columns: ColumnDef<MDSFinal>[] = [
    {
      accessorKey: 'operation_name',
      header: 'Operator',
      meta: { wrap: 'whitespace-nowrap', type: 'categorical' },
      filterFn: 'arrIncludesSome',
    },
    {
      accessorKey: 'facility_name',
      header: 'Facility',
      meta: {
        wrap: 'whitespace-nowrap',
        type: 'categorical',
      },
      enableColumnFilter: false,
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
                href={`https://${info.row.original.url_header}.pointclickcare.com/admin/client/clientlist.jsp?ESOLtabtype=C&ESOLglobalclientsearch=Y&ESOLclientid=${info.row.original.patient_id}&ESOLfacid=${info.row.original.internal_facility_id.split('_').pop()}&ESOLsave=P`}
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
    sorting: [
      {
        id: 'update_time',
        desc: true,
      },
    ],
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
            operation_name: false,
          }
        : {
            facility_name: false,
            patient_name: true,
            update_time: true,
            existing_icd10: true,
            operation_name: false,
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

  return (
    <div className="flex flex-col gap-6">
      <p className="italic">
        Patients below include all eligible PDPM patients as well as any
        patients who were PDPM eligible in the past 30 days.
      </p>
      {/*<NewFilter*/}
      {/*  options={[*/}
      {/*    ...new Map(*/}
      {/*      data.map((d: MDSFinal) => [d.facility_name, d.facility_name]),*/}
      {/*    ).values(),*/}
      {/*  ]}*/}
      {/*  table={table}*/}
      {/*  tableState={tableState}*/}
      {/*  setTableState={setTableState}*/}
      {/*/>*/}
      <TableWrapper
        filters={true}
        table={table}
        tableState={tableState}
        setTableState={setTableState}
        permanentColumnFilters={PERMANENT_COLUMN_FILTERS}
        renderExpandedRow={MDSDetail}
      />
    </div>
  );
}
