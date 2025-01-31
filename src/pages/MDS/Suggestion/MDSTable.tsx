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
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import Card from '../../../components/Cards/Card.tsx';
import { MeterGroup } from 'primereact/metergroup';
import { SelectButton } from 'primereact/selectbutton';
import '../../../css/style.css';

export default function MDSTable({ data }: { data: PDPMPatient[] }) {
  const { user_data } = useContext(AuthContext);
  const [toggle, setToggle] = useState<'CMG' | 'CMI' | '$'>('CMI');

  const PERMANENT_COLUMN_FILTERS =
    user_data.organization_id === 'the_triedge_labs'
      ? [
          'operation_name',
          'facility_name',
          'effective_start_date',
          'has_suggestions',
        ]
      : ['facility_name', 'effective_start_date', 'has_suggestions'];
  const columns: ColumnDef<PDPMPatient>[] = [
    {
      accessorKey: 'any_touched',
      accessorFn: (row) => (row.any_touched === 1 ? 'Yes' : 'No'),
      header: 'Reviewed',
      enableSorting: false,
      enableHiding: false,
      meta: {
        wrap: 'whitespace-nowrap',
        type: 'categorical',
        hideHeader: true,
      },
      filterFn: 'arrIncludesSome',
      cell: (info) => {
        if (info.getValue() === 'Yes') {
          return <div />;
        } else {
          return <div className="size-2 rounded-full bg-primary" />;
        }
      },
    },
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
                  className={
                    info.row.original.any_touched === 0 ? 'font-bold' : ''
                  }
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
                  className={
                    info.row.original.any_touched === 0 ? 'font-bold' : ''
                  }
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
      accessorKey: 'pt',
      accessorFn: (row) => row.original_ptot_suggestions,
      header: 'PT',
      enableColumnFilter: false,

      cell: (info) => {
        const value = info.row.original.n_pt_suggestion as number;
        const mainString = value === 1 ? 'Suggestion' : 'Suggestions';
        const subString =
          'Current: ' +
          (toggle === 'CMG'
            ? info.row.original.mds_pt_group
            : toggle === 'CMI'
              ? info.row.original.mds_pt_cmi
              : '$' + info.row.original.mds_pt_pay);
        const suggestString =
          'Suggested: ' +
          (toggle === 'CMG'
            ? info.row.original.suggest_pt_group
            : toggle === 'CMI'
              ? info.row.original.suggest_pt_cmi
              : '$' + info.row.original.suggest_pt_pay);
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
          (toggle === 'CMG'
            ? info.row.original.mds_ot_group
            : toggle === 'CMI'
              ? info.row.original.mds_ot_cmi
              : '$' + info.row.original.mds_ot_pay);
        const suggestString =
          'Suggested: ' +
          (toggle === 'CMG'
            ? info.row.original.suggest_ot_group
            : toggle === 'CMI'
              ? info.row.original.suggest_ot_cmi
              : '$' + info.row.original.suggest_ot_pay);
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
          (toggle === 'CMG'
            ? info.row.original.mds_pt_group
            : toggle === 'CMI'
              ? info.row.original.mds_pt_cmi +
                '/' +
                info.row.original.mds_ot_cmi
              : '$' +
                info.row.original.mds_pt_pay +
                '/' +
                info.row.original.mds_ot_pay);
        const suggestString =
          'Suggested: ' +
          (toggle === 'CMG'
            ? info.row.original.suggest_pt_group
            : toggle === 'CMI'
              ? info.row.original.suggest_pt_cmi +
                '/' +
                info.row.original.suggest_ot_cmi
              : '$' +
                info.row.original.suggest_pt_pay +
                '/' +
                info.row.original.suggest_ot_pay);
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
      accessorKey: 'slp',
      accessorFn: (row) => row.original_slp_suggestions,
      header: 'SLP',
      enableColumnFilter: false,

      cell: (info) => {
        const value = info.row.original.n_slp_suggestion as number;
        const mainString = value === 1 ? 'Suggestion' : 'Suggestions';
        const subString =
          'Current: ' +
          (toggle === 'CMG'
            ? info.row.original.mds_slp_group
            : toggle === 'CMI'
              ? info.row.original.mds_slp_cmi
              : '$' + info.row.original.mds_slp_pay);
        const suggestString =
          'Suggested: ' +
          (toggle === 'CMG'
            ? info.row.original.suggest_slp_group
            : toggle === 'CMI'
              ? info.row.original.suggest_slp_cmi
              : '$' + info.row.original.suggest_slp_pay);
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
          (toggle === 'CMG'
            ? info.row.original.mds_nursing_group
            : toggle === 'CMI'
              ? info.row.original.mds_nursing_cmi
              : '$' + info.row.original.mds_nursing_pay);
        const suggestString =
          'Suggested: ' +
          (toggle === 'CMG'
            ? info.row.original.suggest_nursing_group
            : toggle === 'CMI'
              ? info.row.original.suggest_nursing_cmi
              : '$' + info.row.original.suggest_nursing_pay);
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
      accessorKey: 'nta',
      enableColumnFilter: false,
      accessorFn: (row) => row.original_nta_suggestions,
      header: 'NTA',
      cell: (info) => {
        const value = info.row.original.n_nta_suggestion as number;
        const mainString = value === 1 ? 'Suggestion' : 'Suggestions';
        const subString =
          'Current: ' +
          (toggle === 'CMG'
            ? info.row.original.mds_nta_group
            : toggle === 'CMI'
              ? info.row.original.mds_nta_cmi
              : '$' + info.row.original.mds_nta_pay);
        const suggestString =
          'Suggested: ' +
          (toggle === 'CMG'
            ? info.row.original.suggest_nta_group
            : toggle === 'CMI'
              ? info.row.original.suggest_nta_cmi
              : '$' + info.row.original.suggest_nta_pay);
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
      accessorKey: 'hipps',
      accessorFn: (row) => row.original_total_opportunities,
      header: 'HIPPS',
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <HighlightWrapper
              text={
                'Current: ' + (info.row.original.mds_hipps ?? 'Not Subbmitted')
              }
              searchTerm={info.table.getState().globalFilter}
              className={'whitespace-nowrap'}
            />
            <br />
            <HighlightWrapper
              className="whitespace-nowrap"
              text={'Suggested: ' + info.row.original.suggest_hipps}
              searchTerm={info.table.getState().globalFilter}
            />
          </>
        );
      },
    },
    {
      accessorKey: 'total_opp',
      accessorFn: (row) => row.original_total_opportunities,
      header: 'Rate Change',
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
            ? '$' + value.toFixed(2).replace('-', '')
            : '-$' + value.toFixed(2).replace('-', '');
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
      accessorKey: 'has_suggestions',
      accessorFn: (row) => {
        const count =
          (row.original_nta_suggestions ?? 0) +
          (row.original_slp_suggestions ?? 0) +
          (row.original_ptot_suggestions ?? 0) +
          (row.original_nursing_suggestions ?? 0);
        return count > 0 ? 'Yes' : 'No';
      },
      header: 'Has Suggestions',
      cell: (info) => {
        return (
          <span className="flex items-center gap-1">
            {info.getValue() === 'No' ? (
              <XCircle size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            {info.getValue() === 'No' ? 'No' : 'Yes'}
          </span>
        );
      },
      meta: {
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
    sorting: [
      {
        id: 'effective_start_date',
        desc: true,
      },
    ],
    columnFilters: [
      {
        id: 'has_suggestions',
        value: ['Yes'],
      },
    ],
    columnPinning: {
      left: [],
      right: [],
    },
    columnOrder: [],
    columnVisibility:
      window.screen.width < 1024
        ? {
            any_touched: true,
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
            hipps: false,
            has_suggestions: true,
            operation_name: user_data.organization_id === 'the_triedge_labs',
          }
        : {
            any_touched: true,
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
            hipps: false,
            has_suggestions: false,
            operation_name: user_data.organization_id === 'the_triedge_labs',
          },
    pagination: {
      pageIndex: 0,
      pageSize: 30,
    },
  });

  useEffect(() => {
    if (localStorage.getItem('clearMDSStorage') !== '9') {
      localStorage.removeItem('MDSUserVisibilitySettings');
      localStorage.setItem('clearMDSStorage', '9');
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
  const hasSuggestionCount =
    table
      .getCoreRowModel()
      .rows.filter((row) => row.getValue('has_suggestions') === 'Yes').length ??
    0;

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex justify-between items-center flex-wrap gap-5">
        <div className="flex flex-col gap-3">
          <h1 className="font-semibold text-2xl">Minimum Data Set</h1>
          <p className="text-sm	text-gray-500 ">
            {table.getFilteredRowModel().rows.length} of {data.length}{' '}
            {data.length >= 1 ? `records are` : 'record is'} in view.
            <br />
            Patients below include all eligible PDPM patients as well as any
            patients who were PDPM eligible in the past 30 days.
          </p>
        </div>
        <MeterGroup
          values={[
            {
              label: 'Has Suggestions',
              value: (hasSuggestionCount / data.length) * 100,
            },
            {
              label: 'No Suggestions',
              color: '#E2E8F0',
              value: ((data.length - hasSuggestionCount) / data.length) * 100,
            },
          ]}
        />
      </Card>

      <TableWrapper
        filters={true}
        searchRight={
          <SelectButton
            value={toggle}
            onChange={(e) => setToggle(e.value)}
            options={['CMI', 'CMG', '$']}
            allowEmpty={false}
          />
        }
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
