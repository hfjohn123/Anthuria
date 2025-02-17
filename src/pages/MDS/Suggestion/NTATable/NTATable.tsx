import { NTAEntry } from '../../../../types/MDSFinal.ts';
import {
  ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import { Fragment, useContext, useState } from 'react';
import getFacetedUniqueValues from '../../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../../common/getFacetedMinMaxValues.ts';
import EvidenceModal from '../EvidenceModal.tsx';
import SmallTableWrapper from '../SmallTableWrapper.tsx';
import UpVoteButton from '../UpVoteButton.tsx';
import MDSCommentModal from '../MDSCommentModal.tsx';
import { MDSContext } from '../MDSDetail.tsx';
import { MDSPatientContext } from '../MDSDetailLoading.tsx';

export default function NTATable({ data }: { data: NTAEntry[] }) {
  const row_data = useContext(MDSContext);
  const patientInfo = useContext(MDSPatientContext);
  const columns: ColumnDef<NTAEntry>[] = [
    {
      accessorKey: 'comorbidity',
      header: 'Comorbidity',
      filterFn: 'arrIncludesSome',
      cell: (info) => {
        return (
          <td className="whitespace-normal max-w-[30vw] py-2 px-4 border-t border-gray-600 ">
            {info.getValue() as string}
          </td>
        );
      },
      meta: {
        type: 'categorical',
      },
      footer: () => {
        return (
          <td className="whitespace-nowrap py-2 px-4 border-t  border-gray-600"></td>
        );
      },
    },
    {
      accessorKey: 'mds_item',
      header: 'MDS Item',
      filterFn: 'arrIncludesSome',
      meta: {
        type: 'categorical',
      },
      cell: (info) => {
        return (
          <td className="whitespace-nowrap py-2 px-4 border-t border-l border-gray-600">
            {info.getValue() as string}
          </td>
        );
      },
      footer: () => {
        return (
          <td className="whitespace-nowrap py-2 px-4 border-t border-l border-gray-600"></td>
        );
      },
    },
    {
      accessorKey: 'is_mds_table',
      accessorFn: (row) => (row.is_mds_table ? 'Yes' : 'No'),
      header: 'Is Already in MDS Table',
      cell: (info) => {
        return (
          <td className="whitespace-nowrap py-2 px-4 border-t border-l border-gray-600">
            {info.getValue() as string}
          </td>
        );
      },
      filterFn: 'arrIncludesSome',
      meta: {
        type: 'categorical',
      },
      footer: () => {
        return (
          <td className="whitespace-nowrap py-2 px-4 border-t border-l border-gray-600"></td>
        );
      },
    },
    {
      accessorKey: 'new_icd10',
      accessorFn: (row) => row.suggestion?.map((d) => d.icd10) || [],
      cell: (info) => {
        return (
          <td className="whitespace-nowrap  px-4 border-t border-l border-gray-600">
            {info.row.original.suggestion?.map((d, index, array) => {
              return (
                <Fragment key={d.icd10}>
                  <EvidenceModal icd10={d} button={<span>{d.icd10}</span>} />
                  {index < array.length - 1 && ', '}
                </Fragment>
              );
            })}
          </td>
        );
      },
      header: 'AI Suggested Conditions',
      footer: () => {
        return (
          <td className="whitespace-nowrap text-left py-2 px-4 border-t border-l border-gray-600">
            Current score: {patientInfo.mds_nta_score} (
            {patientInfo.mds_nta_group}, CMI: {patientInfo.mds_nta_cmi}, $
            {patientInfo.mds_nta_pay})
          </td>
        );
      },
    },
    {
      accessorKey: 'review',
      header: 'Review',
      cell: (info) => {
        const [thumbUpState, setThumbUpState] = useState(
          info.row.original.is_thumb_up ?? 0,
        );
        const [thumbDownState, setThumbDownState] = useState(
          info.row.original.is_thumb_down ?? 0,
        );
        if (info.row.original.suggestion?.length ?? 0 > 0) {
          return (
            <td className=" py-2 px-4 border-t border-l border-gray-600">
              <div className="h-full flex items-center gap-2">
                <UpVoteButton
                  is_thumb_up={thumbUpState}
                  setThumbUpState={setThumbUpState}
                  setThumbDownState={setThumbDownState}
                  internal_facility_id={row_data?.internal_facility_id || ''}
                  internal_patient_id={row_data?.internal_patient_id || ''}
                  category={info.row.original.category}
                  item={info.row.original.item}
                />
                <MDSCommentModal
                  comment={info.row.original.comment || ''}
                  is_thumb_down={thumbDownState}
                  setThumbUpState={setThumbUpState}
                  setThumbDownState={setThumbDownState}
                  internal_facility_id={row_data?.internal_facility_id || ''}
                  internal_patient_id={row_data?.internal_patient_id || ''}
                  category={info.row.original.category}
                  item={info.row.original.item}
                />
              </div>
            </td>
          );
        }
        return (
          <td className="py-2 px-4 border-t border-l border-gray-600"></td>
        );
      },
      footer: () => {
        return (
          <td className="whitespace-nowrap text-left py-2 px-4 border-t border-l border-gray-600 ">
            {patientInfo.suggest_nta_score - patientInfo.mds_nta_score >= 0 ? (
              <span>
                + {patientInfo.suggest_nta_score - patientInfo.mds_nta_score}
              </span>
            ) : (
              <span>
                - {patientInfo.mds_nta_score - patientInfo.suggest_nta_score}
              </span>
            )}
          </td>
        );
      },
    },
    {
      accessorKey: 'score',
      header: 'Score',
      cell: (info) => {
        return (
          <td className="whitespace-nowrap py-2 px-4 border-t border-l  border-gray-600">
            {info.getValue() as string}
          </td>
        );
      },

      footer: () => {
        return (
          <td className="whitespace-nowrap text-left py-2 px-4 border-t border-l border-gray-600 ">
            Projected score: {patientInfo.suggest_nta_score} (
            {patientInfo.suggest_nta_group}, CMI: {patientInfo.suggest_nta_cmi},
            ${patientInfo.suggest_nta_pay})
          </td>
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
    sorting: [],
    columnFilters: [],
    columnPinning: {
      left: [],
      right: [],
    },
    columnOrder: [],
    columnVisibility: {
      icd10: true,
      comorbidity: true,
      progress_note: true,
      review: true,
      action: true,
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
    autoResetExpanded: false,
    getRowCanExpand: () => true,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for numeric range filter
    getSortedRowModel: getSortedRowModel(),
  });
  return <SmallTableWrapper table={table} />;
}
