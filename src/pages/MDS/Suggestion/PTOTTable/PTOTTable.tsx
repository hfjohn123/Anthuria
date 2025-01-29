import {
  ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import { useContext, useState } from 'react';
import { FunctionalScore, PTOTFinal } from '../../../../types/MDSFinal.ts';
import getFacetedUniqueValues from '../../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../../common/getFacetedMinMaxValues.ts';
import SmallTableWrapper from '../SmallTableWrapper.tsx';
import UpVoteButton from '../UpVoteButton.tsx';
import MDSCommentModal from '../MDSCommentModal.tsx';
import EvidenceModal from '../EvidenceModal.tsx';
import { MDSContext } from '../MDSDetail.tsx';
import { MDSPatientContext } from '../MDSDetailLoading.tsx';

// Helper Functions
const getRowSpan = (rowIndex: number, data?: FunctionalScore[]): number => {
  const currentArea = data?.[rowIndex].function_area;
  let span = 1;

  for (let i = rowIndex + 1; i < (data?.length ?? 0); i++) {
    if (data?.[i].function_area === currentArea) {
      span++;
    } else {
      break;
    }
  }

  return span;
};

const isFirstInGroup = (
  rowIndex: number,
  id: keyof FunctionalScore,
  rows?: FunctionalScore[],
) => {
  if (rowIndex === 0) return true;
  const prevRow = rows?.[rowIndex - 1];
  const currentRow = rows?.[rowIndex];
  if (!prevRow || !currentRow) return false;
  return prevRow[id] !== currentRow[id];
};

const permanentColumnFilters = ['function_area', 'mds_item'];

export default function PTOTTable({ data }: { data: PTOTFinal }) {
  const row_data = useContext(MDSContext);
  const patientInfo = useContext(MDSPatientContext);

  const columns: ColumnDef<FunctionalScore>[] = [
    {
      accessorKey: 'function_area',
      header: 'Function Area',
      filterFn: 'arrIncludesSome',
      cell: (info) => {
        const rowIndex = info.row.index;
        if (
          !isFirstInGroup(rowIndex, 'function_area', data.function_score_all)
        ) {
          return null;
        }

        const rowSpan = getRowSpan(rowIndex, data.function_score_all);

        return (
          <td
            rowSpan={rowSpan}
            className="py-2 px-4 border-t border-l  first:border-l-0 align-top bg-white border-gray-600"
          >
            {info.getValue() as string}
          </td>
        );
      },
      footer: () => {
        return (
          <td className="whitespace-nowrap py-2 px-4 border-t  border-gray-600"></td>
        );
      },
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'mds_item',
      header: 'MDS Item',
      filterFn: 'arrIncludesSome',
      cell: (info) => (
        <td className="py-2 px-4 border-t border-l border-gray-600 ">
          {info.getValue() as string}
        </td>
      ),
      footer: () => {
        return (
          <td className="whitespace-nowrap py-2 px-4 border-t border-l border-gray-600"></td>
        );
      },
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'individual_function_score',
      header: 'Current-Suggested Function Score',
      cell: (info) =>
        info.row.original.individual_function_score ? (
          <td className="py-2 px-4 border-t border-l  whitespace-nowrap border-gray-600">
            {info.getValue() as string} -{' '}
            {info.row.original.suggest_individual_function_score}
          </td>
        ) : (
          <td className="py-2 px-4 border-t border-l  whitespace-nowrap border-gray-600"></td>
        ),
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
      accessorKey: 'average_function_score',
      header: 'Current-Suggested Average Score',
      cell: (info) => {
        const rowIndex = info.row.index;
        if (
          !isFirstInGroup(rowIndex, 'function_area', data.function_score_all)
        ) {
          return null;
        }

        const rowSpan = getRowSpan(rowIndex, data.function_score_all);

        return info.row.original.average_function_score ? (
          <td
            rowSpan={rowSpan}
            className="py-2 px-4 border-t border-l  bg-blue-50 align-top border-gray-600"
          >
            {info.getValue() as string} -{' '}
            {info.row.original.suggest_average_function_score}
          </td>
        ) : (
          <td
            rowSpan={rowSpan}
            className="py-2 px-4 border-t border-l  bg-blue-50 align-top border-gray-600"
          ></td>
        );
      },
      footer: () => {
        return (
          <td className="py-2 px-4  border-t border-l  bg-blue-50 font-medium border-gray-600">
            Current Total Score: {data.final_score}
            <br />
            PT: {patientInfo.mds_pt_group}, {patientInfo.mds_pt_cmi}, $
            {patientInfo.mds_pt_pay}
            <br />
            OT: {patientInfo.mds_ot_group}, {patientInfo.mds_ot_cmi}, $
            {patientInfo.mds_ot_pay}
          </td>
        );
      },
    },

    {
      accessorKey: 'suggestion',
      header: 'AI Suggested Conditions',
      cell: (info) => {
        const count = info.row.original.suggestion?.length || 0;
        if (count === 0) {
          return (
            <td className="py-2 px-4 border-t border-l border-gray-600"></td>
          );
        }

        return (
          <td className="py-2 px-4 border-t border-l border-gray-600">
            <EvidenceModal
              button={
                <span>
                  {count} {count === 1 ? 'potential ' : 'potentials '}
                  found
                </span>
              }
              icd10={{
                icd10: info.row.original.mds_item,
                progress_note: info.row.original.suggestion || [],
              }}
            />
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
          <td className="py-2 px-4  border-t border-l  last:border-r-0 font-medium border-gray-600">
            Suggested Final Score: {patientInfo.ptot_fs}
            <br />
            PT: {patientInfo.suggest_pt_group}, {patientInfo.suggest_pt_cmi}, $
            {patientInfo.suggest_pt_pay}
            <br />
            OT: {patientInfo.suggest_ot_group}, {patientInfo.suggest_ot_cmi}, $
            {patientInfo.suggest_ot_pay}
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
    data: data.function_score_all || [],
    columns,
    state: tableState,
    onStateChange: setTableState,
    autoResetExpanded: false,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for numeric range filter
  });

  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <div>
        <span className="font-bold">Clinical Category:</span>
        <p>{data.clinical_category || 'Not Available'}</p>
      </div>

      <SmallTableWrapper
        permanentColumnFilters={permanentColumnFilters}
        table={table}
        tableState={tableState}
        setTableState={setTableState}
      />
    </div>
  );
}
