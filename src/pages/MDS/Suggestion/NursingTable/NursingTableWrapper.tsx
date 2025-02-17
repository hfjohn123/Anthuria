import SmallTableWrapper from '../SmallTableWrapper.tsx';
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import { Fragment, useContext, useState } from 'react';
import getFacetedUniqueValues from '../../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../../common/getFacetedMinMaxValues.ts';
import {
  NursingBSCP,
  NursingCC,
  RestorativeCountAll,
  SuggestedICD10,
} from '../../../../types/MDSFinal.ts';
import EvidenceModal from '../EvidenceModal.tsx';
import UpVoteButton from '../UpVoteButton.tsx';
import MDSCommentModal from '../MDSCommentModal.tsx';
import { NursingTableContext } from './NursingTable.tsx';

export default function NursingTableWrapper({
  data,
}: {
  data: NursingCC[] | NursingBSCP[] | RestorativeCountAll[];
}) {
  const row_data = useContext(NursingTableContext);
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
        <td
          className="py-2 px-4 border-t border-l whitespace-pre-line border-gray-600"
          key={'123'}
        >
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
        return (
          <td className="whitespace-nowrap  px-4 border-t border-l border-gray-600">
            {(info.getValue() as SuggestedICD10[])?.map((d, index, array) => {
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
        if (info.row.original.nursing_mds_suggestion?.length ?? 0 > 0) {
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
      <SmallTableWrapper table={table} />
    </div>
  );
}
