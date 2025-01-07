import SmallTableWrapper from '../SmallTableWrapper.tsx';
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import getFacetedUniqueValues from '../../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../../common/getFacetedMinMaxValues.ts';
import {
  NursingBSCP,
  NursingCC,
  ProgressNoteAndSummary,
  RestorativeCountAll,
} from '../../../../types/MDSFinal.ts';
import EvidenceModal from '../EvidenceModal.tsx';
import UpVoteButton from '../UpVoteButton.tsx';
import MDSCommentModal from '../MDSCommentModal.tsx';

const permanentColumnFilters = ['mds_item'];

export default function NursingTableWrapper({
  data,
}: {
  data: NursingCC[] | NursingBSCP[] | RestorativeCountAll[];
}) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'mds_item',
      header: 'MDS Item',
      filterFn: 'arrIncludesSome',
      cell: (info) => (
        <td className="py-2 px-4 border-t border-gray-600 ">
          {info.getValue() as string}
        </td>
      ),
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: (info) => (
        <td className="py-2 px-4 border-t border-l whitespace-pre-line border-gray-600">
          {info.getValue() as string}
        </td>
      ),
    },
    {
      accessorKey: 'is_mds',
      header: 'Is Already in MDS Table',
      cell: (info) => (
        <td className="py-2 px-4 border-t border-l whitespace-nowrap bg-blue-50 border-gray-600">
          {info.getValue()
            ? 'Yes'
            : info.row.original.suggestion
              ? 'Yes'
              : 'No'}
        </td>
      ),
    },

    {
      accessorKey: 'nursing_mds_suggestion',
      header: 'AI Suggested Conditions',
      cell: (info) => {
        if (!info.getValue())
          return (
            <td className="py-2 px-4 border-t border-l border-gray-600"></td>
          );
        const count = (info.getValue() as ProgressNoteAndSummary[]).length;
        if (count === 0)
          return (
            <td className="py-2 px-4 border-t border-l border-gray-600"></td>
          );
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
                progress_note: info.getValue() as ProgressNoteAndSummary[],
              }}
            />
          </td>
        );
      },
    },
    {
      accessorKey: 'review',
      header: 'Review',
      cell: (info) => {
        if (info.row.original.nursing_mds_suggestion?.length ?? 0 > 0) {
          return (
            <td className=" py-2 px-4 border-t border-l border-gray-600">
              <div className="h-full flex items-center gap-2">
                <UpVoteButton
                  is_thumb_up={info.row.original.is_thumb_up || false}
                  // todo: add logic for thumb up
                />
                <MDSCommentModal
                  comment={info.row.original.comment || ''}
                  is_thumb_down={info.row.original.is_thumb_down || false}
                  // todo: add logic for thumb down
                />
              </div>
            </td>
          );
        }
        return (
          <td className="py-2 px-4 border-t border-l border-gray-600"></td>
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
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(), // client-side faceting
    getFacetedMinMaxValues: getFacetedMinMaxValues(), // generate min/max values for numeric range filter
  });
  return (
    <div>
      {/*<span className="font-bold">Conditions and services:</span>*/}
      <SmallTableWrapper
        permanentColumnFilters={permanentColumnFilters}
        table={table}
        tableState={tableState}
        setTableState={setTableState}
      />
    </div>
  );
}
