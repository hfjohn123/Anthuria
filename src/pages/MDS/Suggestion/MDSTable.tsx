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
import { useContext, useEffect, useState } from 'react';
import getFacetedUniqueValues from '../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../common/getFacetedMinMaxValues.ts';
import HyperLink from '../../../components/Basic/HyerLink.tsx';
import dateRangeFilterFn from '../../../common/dateRangeFilterFn.ts';
import { PDPMPatient } from '../../../types/MDSFinal.ts';
import TableWrapper from '../../../components/Tables/TableWrapper.tsx';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import HighlightWrapper from '../../../components/Basic/HighlightWrapper.tsx';
import stemmedFilter from '../../../components/Tables/stemmedFilter.ts';
import MDSDetailLoading from './MDSDetailLoading.tsx';

export default function MDSTable({ data }: { data: PDPMPatient[] }) {
  const { user_data } = useContext(AuthContext);
  const PERMANENT_COLUMN_FILTERS =
    user_data.organization_id === 'the_triedge_labs'
      ? [
          'operation_name',
          'facility_name',
          'effective_start_date',
          'patient_name',
        ]
      : ['facility_name', 'effective_start_date', 'patient_name'];
  const columns: ColumnDef<PDPMPatient>[] = [
    {
      accessorKey: 'operation_name',
      header: 'Operator',
      meta: { wrap: 'whitespace-nowrap', type: 'categorical' },
      filterFn: 'arrIncludesSome',
      cell: (info) => (
        <HighlightWrapper
          text={info.getValue() as string}
          searchTerm={info.table.getState().globalFilter}
        />
      ),
    },
    {
      accessorKey: 'facility_name',
      header: 'Facility',
      meta: {
        wrap: 'whitespace-nowrap',
        type: 'categorical',
      },
      enableHiding: false,
      enableColumnFilter: false,
      filterFn: 'arrIncludesSome',
      cell: (info) => (
        <HighlightWrapper
          text={info.getValue() as string}
          searchTerm={info.table.getState().globalFilter}
        />
      ),
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
                <HighlightWrapper
                  text={info.getValue() as string}
                  searchTerm={info.table.getState().globalFilter}
                />
              </HyperLink>
              <p className="text-body-2">
                <HighlightWrapper
                  text={info.row.getValue('facility_name') as string}
                  searchTerm={info.table.getState().globalFilter}
                />
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
                <HighlightWrapper
                  text={info.getValue() as string}
                  searchTerm={info.table.getState().globalFilter}
                />
              </HyperLink>
              <p className="text-body-2">
                <HighlightWrapper
                  text={info.row.getValue('facility_name') as string}
                  searchTerm={info.table.getState().globalFilter}
                />
              </p>
            </>
          );
        }
        return info.renderValue();
      },
      header: 'Patient',
      filterFn: 'includesString',
      meta: {
        wrap: 'whitespace-normal',
        type: 'text',
      },
    },
    {
      accessorKey: 'effective_start_date',
      header: 'Eligibility Start Date',
      accessorFn: (row) => new Date(row.effective_start_date),
      cell: (info) => {
        const date = info.getValue() as Date;
        return (
          <HighlightWrapper
            text={`${date.toLocaleDateString()} ${date.toLocaleTimeString(
              navigator.language,
              {
                hour: '2-digit',
                minute: '2-digit',
              },
            )}`}
            searchTerm={info.table.getState().globalFilter}
          />
        );
      },
      filterFn: dateRangeFilterFn,
      meta: {
        wrap: 'whitespace-nowrap',
        type: 'daterange',
      },
    },
    {
      accessorKey: 'nta',
      enableColumnFilter: false,
      accessorFn: (row) => row.original_nta_suggestions,
      header: 'NTA',
      cell: (info) => {
        const value = info.row.original.n_nta_suggestion as number;
        const mainString = value === 1 ? 'Suggestion' : 'Suggestions';
        const subString =
          'Current: ' +
          info.row.original.mds_nta_group +
          ', ' +
          info.row.original.mds_nta_cmi +
          ', $' +
          info.row.original.mds_nta_pay;
        const suggestString =
          'Suggested: ' +
          info.row.original.suggest_nta_group +
          ', ' +
          info.row.original.suggest_nta_cmi +
          ', $' +
          info.row.original.suggest_nta_pay;
        return (
          <>
            <HighlightWrapper
              text={value + ' ' + mainString}
              searchTerm={info.table.getState().globalFilter}
            />
            <p className="text-body-2">
              <HighlightWrapper
                text={subString}
                searchTerm={info.table.getState().globalFilter}
              />
            </p>{' '}
            <p className="text-body-2">
              <HighlightWrapper
                text={suggestString}
                searchTerm={info.table.getState().globalFilter}
              />
            </p>
          </>
        );
      },
    },
    {
      accessorKey: 'nta_opp',
      accessorFn: (row) => row.original_nta_opportunities,
      header: 'NTA OPP',
      enableColumnFilter: false,
      cell: (info) => {
        const value =
          info.row.original.suggest_nta_pay - info.row.original.mds_nta_pay;
        const string =
          parseInt(value.toFixed()) >= 0
            ? '$' + value.toFixed(2).replace('-0', '0')
            : '-$' + Math.abs(value).toFixed(2);
        return (
          <>
            <HighlightWrapper
              text={string}
              searchTerm={info.table.getState().globalFilter}
            />
          </>
        );
      },
    },
    {
      accessorKey: 'slp',
      accessorFn: (row) => row.original_slp_suggestions,
      header: 'SLP',
      enableColumnFilter: false,

      cell: (info) => {
        const value = info.row.original.n_slp_suggestion as number;
        const mainString = value === 1 ? 'Suggestion' : 'Suggestions';
        const subString =
          'Current: ' +
          info.row.original.mds_slp_group +
          ', ' +
          info.row.original.mds_slp_cmi +
          ', $' +
          info.row.original.mds_slp_pay;
        const suggestString =
          'Suggested: ' +
          info.row.original.suggest_slp_group +
          ', ' +
          info.row.original.suggest_slp_cmi +
          ', $' +
          info.row.original.suggest_slp_pay;
        return (
          <>
            <HighlightWrapper
              text={value + ' ' + mainString}
              searchTerm={info.table.getState().globalFilter}
            />
            <p className="text-body-2">
              <HighlightWrapper
                text={subString}
                searchTerm={info.table.getState().globalFilter}
              />
            </p>{' '}
            <p className="text-body-2">
              <HighlightWrapper
                text={suggestString}
                searchTerm={info.table.getState().globalFilter}
              />
            </p>
          </>
        );
      },
    },
    {
      accessorKey: 'slp_opp',
      accessorFn: (row) => row.original_slp_opportunities,
      header: 'SLP OPP',
      enableColumnFilter: false,
      cell: (info) => {
        const value =
          info.row.original.suggest_slp_pay - info.row.original.mds_slp_pay;
        const string =
          parseInt(value.toFixed()) >= 0
            ? '$' + value.toFixed(2).replace('-0', '0')
            : '-$' + Math.abs(value).toFixed(2);
        return (
          <>
            <HighlightWrapper
              text={string}
              searchTerm={info.table.getState().globalFilter}
            />
          </>
        );
      },
    },
    {
      accessorKey: 'pt',
      accessorFn: (row) => row.original_ptot_suggestions,
      header: 'PT',
      enableColumnFilter: false,

      cell: (info) => {
        const value = info.row.original.n_pt_suggestion as number;
        const mainString = value === 1 ? 'Suggestion' : 'Suggestions';
        const subString =
          'Current: ' +
          info.row.original.mds_pt_group +
          ', ' +
          info.row.original.mds_pt_cmi +
          ', $' +
          info.row.original.mds_pt_pay;
        const suggestString =
          'Suggested: ' +
          info.row.original.suggest_pt_group +
          ', ' +
          info.row.original.suggest_pt_cmi +
          ', $' +
          info.row.original.suggest_pt_pay;
        return (
          <>
            <HighlightWrapper
              text={value + ' ' + mainString}
              searchTerm={info.table.getState().globalFilter}
            />
            <p className="text-body-2">
              <HighlightWrapper
                text={subString}
                searchTerm={info.table.getState().globalFilter}
              />
            </p>{' '}
            <p className="text-body-2">
              <HighlightWrapper
                text={suggestString}
                searchTerm={info.table.getState().globalFilter}
              />
            </p>
          </>
        );
      },
    },
    {
      accessorKey: 'ot',
      accessorFn: (row) => row.original_ptot_suggestions,
      header: 'OT',
      enableColumnFilter: false,

      cell: (info) => {
        const value = info.row.original.n_ot_suggestion as number;
        const mainString = value === 1 ? 'Suggestion' : 'Suggestions';
        const subString =
          'Current: ' +
          info.row.original.mds_ot_group +
          ', ' +
          info.row.original.mds_ot_cmi +
          ', $' +
          info.row.original.mds_ot_pay;
        const suggestString =
          'Suggested: ' +
          info.row.original.suggest_ot_group +
          ', ' +
          info.row.original.suggest_ot_cmi +
          ', $' +
          info.row.original.suggest_ot_pay;
        return (
          <>
            <HighlightWrapper
              text={value + ' ' + mainString}
              searchTerm={info.table.getState().globalFilter}
            />
            <p className="text-body-2">
              <HighlightWrapper
                text={subString}
                searchTerm={info.table.getState().globalFilter}
              />
            </p>{' '}
            <p className="text-body-2">
              <HighlightWrapper
                text={suggestString}
                searchTerm={info.table.getState().globalFilter}
              />
            </p>
          </>
        );
      },
    },
    {
      accessorKey: 'ptot',
      accessorFn: (row) => row.original_ptot_suggestions,
      header: 'PT/OT',
      enableColumnFilter: false,
      sortDescFirst: true,
      cell: (info) => {
        const value = info.row.original.n_ot_suggestion as number;
        const mainString = value === 1 ? 'Suggestion' : 'Suggestions';
        const subString =
          'Current: ' +
          info.row.original.mds_ot_group +
          ', ' +
          info.row.original.mds_ot_cmi +
          '/' +
          info.row.original.mds_pt_cmi +
          ', $' +
          info.row.original.mds_ot_pay +
          '/$' +
          info.row.original.mds_pt_pay;
        const suggestString =
          'Suggested: ' +
          info.row.original.suggest_ot_group +
          ', ' +
          info.row.original.suggest_ot_cmi +
          '/' +
          info.row.original.suggest_pt_cmi +
          ', $' +
          info.row.original.suggest_ot_pay +
          '/$' +
          info.row.original.suggest_pt_pay;
        return (
          <>
            <HighlightWrapper
              text={value + ' ' + mainString}
              searchTerm={info.table.getState().globalFilter}
            />
            <p className="text-body-2">
              <HighlightWrapper
                text={subString}
                searchTerm={info.table.getState().globalFilter}
              />
            </p>{' '}
            <p className="text-body-2">
              <HighlightWrapper
                text={suggestString}
                searchTerm={info.table.getState().globalFilter}
              />
            </p>
          </>
        );
      },
    },
    {
      accessorKey: 'ptot_opp',
      accessorFn: (row) => row.original_ptot_opportunities,
      header: 'PT/OT OPP',
      enableColumnFilter: false,
      cell: (info) => {
        const value =
          info.row.original.suggest_pt_pay +
          info.row.original.suggest_ot_pay -
          info.row.original.mds_pt_pay -
          info.row.original.mds_ot_pay;
        const string =
          parseInt(value.toFixed()) >= 0
            ? '$' + value.toFixed(2).replace('-0', '0')
            : '-$' + Math.abs(value).toFixed(2);
        return (
          <>
            <HighlightWrapper
              text={string}
              searchTerm={info.table.getState().globalFilter}
            />
          </>
        );
      },
    },
    {
      accessorKey: 'nursing',
      accessorFn: (row) => row.original_nursing_suggestions,
      header: 'Nursing',
      enableColumnFilter: false,
      sortDescFirst: true,
      cell: (info) => {
        const value = info.row.original.n_nursing_suggestion as number;
        const mainString = value === 1 ? 'Suggestion' : 'Suggestions';
        const subString =
          'Current: ' +
          info.row.original.mds_nursing_group +
          ', ' +
          info.row.original.mds_nursing_cmi +
          ', $' +
          info.row.original.mds_nursing_pay;
        const suggestString =
          'Suggested: ' +
          info.row.original.suggest_nursing_group +
          ', ' +
          info.row.original.suggest_nursing_cmi +
          ', $' +
          info.row.original.suggest_nursing_pay;
        return (
          <>
            <HighlightWrapper
              text={value + ' ' + mainString}
              searchTerm={info.table.getState().globalFilter}
            />
            <p className="text-body-2">
              <HighlightWrapper
                text={subString}
                searchTerm={info.table.getState().globalFilter}
              />
            </p>{' '}
            <p className="text-body-2">
              <HighlightWrapper
                text={suggestString}
                searchTerm={info.table.getState().globalFilter}
              />
            </p>
          </>
        );
      },
    },
    {
      accessorKey: 'nursing_opp',
      accessorFn: (row) => row.original_nursing_opportunities,
      header: 'Nursing OPP',
      enableColumnFilter: false,
      cell: (info) => {
        const value =
          info.row.original.suggest_nursing_pay -
          info.row.original.mds_nursing_pay;
        const string =
          parseInt(value.toFixed()) >= 0
            ? '$' + value.toFixed(2).replace('-0', '0')
            : '-$' + Math.abs(value).toFixed(2);
        return (
          <>
            <HighlightWrapper
              text={string}
              searchTerm={info.table.getState().globalFilter}
            />
          </>
        );
      },
    },
    {
      accessorKey: 'total_opp',
      accessorFn: (row) => row.original_total_opportunities,
      header: 'Total OPP',
      enableColumnFilter: false,
      cell: (info) => {
        const value =
          info.row.original.suggest_nta_pay +
          info.row.original.suggest_slp_pay +
          info.row.original.suggest_pt_pay +
          info.row.original.suggest_ot_pay +
          info.row.original.suggest_nursing_pay -
          info.row.original.mds_nta_pay -
          info.row.original.mds_slp_pay -
          info.row.original.mds_pt_pay -
          info.row.original.mds_ot_pay -
          info.row.original.mds_nursing_pay;
        const string =
          parseInt(value.toFixed()) >= 0
            ? '$' + value.toFixed(2).replace('-0', '0')
            : '-$' + Math.abs(value).toFixed(2);
        return (
          <>
            <HighlightWrapper
              text={string}
              searchTerm={info.table.getState().globalFilter}
            />
          </>
        );
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
        id: 'effective_start_date',
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
            effective_start_date: false,
            nta: false,
            nta_opp: true,
            slp: false,
            slp_opp: true,
            pt: false,
            ot: false,
            ptot: false,
            ptot_opp: true,
            nursing: false,
            nursing_opp: true,
            total_opp: true,
            operation_name: user_data.organization_id === 'the_triedge_labs',
          }
        : {
            facility_name: false,
            patient_name: true,
            effective_start_date: false,
            nta: true,
            nta_opp: false,
            slp: true,
            slp_opp: false,
            pt: false,
            ot: false,
            ptot: true,
            ptot_opp: false,
            nursing: true,
            nursing_opp: false,
            total_opp: true,
            operation_name: user_data.organization_id === 'the_triedge_labs',
          },
    pagination: {
      pageIndex: 0,
      pageSize: 30,
    },
  });

  useEffect(() => {
    if (localStorage.getItem('clearMDSStorage') !== '8') {
      localStorage.removeItem('MDSUserVisibilitySettings');
      localStorage.setItem('clearMDSStorage', '8');
    } else {
      const userVisibilitySettings = localStorage.getItem(
        'MDSUserVisibilitySettings',
      );
      if (userVisibilitySettings) {
        setTableState((prev) => ({
          ...prev,
          columnVisibility: JSON.parse(userVisibilitySettings),
        }));
      }
    }
  }, []);

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
    globalFilterFn: stemmedFilter,
    getRowId: (row) => row.internal_patient_id,
  });
  useEffect(() => {
    localStorage.setItem(
      'MDSUserVisibilitySettings',
      JSON.stringify(tableState.columnVisibility),
    );
  }, [tableState.columnVisibility]);

  return (
    <div className="flex flex-col gap-5">
      <p className="italic">
        Patients below include all eligible PDPM patients as well as any
        patients who were PDPM eligible in the past 30 days.
      </p>
      <TableWrapper
        title="PDPM Suggestions"
        filters={true}
        table={table}
        tableState={tableState}
        setTableState={setTableState}
        permanentColumnFilters={PERMANENT_COLUMN_FILTERS}
        renderExpandedRow={MDSDetailLoading}
        tableSetting={true}
      />
    </div>
  );
}
