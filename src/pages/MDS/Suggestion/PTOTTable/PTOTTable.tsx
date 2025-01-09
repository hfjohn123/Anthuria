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
import { PTOTMapping } from '../../cmiMapping.ts';
import UpVoteButton from '../UpVoteButton.tsx';
import MDSCommentModal from '../MDSCommentModal.tsx';
import EvidenceModal from '../EvidenceModal.tsx';
import { MDSContext } from '../MDSDetail.tsx';

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
  const [tableData] = useState(data.function_score_all || []);

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
      header: 'Function Score',
      cell: (info) => (
        <td className="py-2 px-4 border-t border-l  whitespace-nowrap border-gray-600">
          {info.getValue() as string}
        </td>
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
      accessorKey: 'suggestion',
      header: 'AI Suggested Conditions',
      cell: (info) => {
        const count = info.row.original.suggestion.length;
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
                progress_note: info.row.original.suggestion,
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
      accessorKey: 'average_function_score',
      header: 'Average Score',
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
            className="py-2 px-4 border-t border-l  bg-blue-50 align-top border-gray-600"
          >
            {info.getValue() as string}
          </td>
        );
      },
      footer: () => {
        return (
          <td className="py-2 px-4  border-t border-l  bg-blue-50 font-medium border-gray-600">
            Total Score: {data.final_score}
          </td>
        );
      },
    },
    {
      accessorKey: 'review',
      header: 'Review',
      cell: (info) => {
        const [thumbUpState, setThumbUpState] = useState(
          info.row.original.is_thumb_up || false,
        );
        const [thumbDownState, setThumbDownState] = useState(
          info.row.original.is_thumb_down || false,
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
            Case Mix Group: {data.mix_group}{' '}
            {data.mix_group &&
              '(PT CMI:' +
                PTOTMapping[data.mix_group as keyof typeof PTOTMapping].PT_CMI +
                ', OT CMI:' +
                PTOTMapping[data.mix_group as keyof typeof PTOTMapping].OT_CMI +
                ')'}
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
    data: tableData,
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
        <p>{data.clinical_category}</p>
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
