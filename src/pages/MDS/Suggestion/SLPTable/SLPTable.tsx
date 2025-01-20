import {
  SLPItem,
  ProgressNoteAndSummary,
  SLPEntry,
} from '../../../../types/MDSFinal.ts';
import { Fragment, useContext, useState } from 'react';
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
import getFacetedUniqueValues from '../../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../../common/getFacetedMinMaxValues.ts';

import EvidenceModal from '../EvidenceModal.tsx';
import SmallTableWrapper from '../SmallTableWrapper.tsx';
import MDSCommentModal from '../MDSCommentModal.tsx';
import UpVoteButton from '../UpVoteButton.tsx';
import { MDSContext } from '../MDSDetail.tsx';
import { MDSPatientContext } from '../MDSDetailLoading.tsx';

const permanentColumnFilters = ['condition', 'is_mds'];

export default function SLPTable({ data }: { data: SLPItem[] }) {
  const row_data = useContext(MDSContext);
  const patientInfo = useContext(MDSPatientContext);
  const columns: ColumnDef<SLPItem>[] = [
    {
      accessorKey: 'condition',
      header: 'Condition',
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
      accessorKey: 'is_mds',
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
          <td className="py-2 px-4 border-t border-l border-gray-600 font-medium">
            <p className="whitespace-nowrap text-left">
              Current Presence of SLP Conditions: {patientInfo.mds_slp_s_count}
            </p>
            <p className="whitespace-nowrap text-left">
              Current Presence of Diet Conditions: {patientInfo.mds_slp_f_count}
            </p>
            <p className="whitespace-nowrap text-left">
              Current Case Mix Group: {patientInfo.mds_slp_group} (CMI:{' '}
              {patientInfo.mds_slp_cmi}, ${patientInfo.mds_slp_pay})
            </p>
          </td>
        );
      },
    },
    {
      accessorKey: 'slp_entry',
      accessorFn: (row) => row.suggestion,
      cell: (info) => {
        const value = info.getValue() as Array<
          ProgressNoteAndSummary | SLPEntry
        >;
        if (value && value.length > 0) {
          if (info.row.original.item === 'cp') {
            return (
              <td className="py-2 px-4 border-t border-l border-gray-600">
                {value.map((entry, index) => {
                  entry = entry as SLPEntry;
                  return (
                    <Fragment key={entry.comorbidity}>
                      {entry.suggestion && entry.suggestion.length > 0 ? (
                        <EvidenceModal
                          icd10={{
                            icd10: entry.comorbidity,
                            progress_note: entry.suggestion.flatMap(
                              (d) => d.progress_note,
                            ),
                          }}
                          button={<span>{entry.comorbidity}</span>}
                        />
                      ) : (
                        <span>{entry.comorbidity}</span>
                      )}
                      {index < value.length - 1 && ' | '}
                    </Fragment>
                  );
                })}
              </td>
            );
          } else {
            const count = (value as ProgressNoteAndSummary[]).length;
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
                    icd10: info.row.original.condition,
                    progress_note: value as ProgressNoteAndSummary[],
                  }}
                />
              </td>
            );
          }
        }
        return (
          <td className="py-2 px-4 border-t border-l border-gray-600"></td>
        );
      },
      header: 'AI Suggested Conditions',
      footer: () => {
        return (
          <td className="py-2 px-4 border-t border-l border-gray-600 font-medium">
            <p className="whitespace-nowrap text-left ">
              {patientInfo.suggest_slp_s_count - patientInfo.mds_slp_s_count >=
              0 ? (
                <span>
                  +{' '}
                  {patientInfo.suggest_slp_s_count -
                    patientInfo.mds_slp_s_count}
                </span>
              ) : (
                <span>
                  -{' '}
                  {patientInfo.mds_slp_s_count -
                    patientInfo.suggest_slp_s_count}
                </span>
              )}
            </p>
            <p className="whitespace-nowrap text-left ">
              {patientInfo.suggest_slp_f_count - patientInfo.mds_slp_f_count >=
              0 ? (
                <span>
                  +{' '}
                  {patientInfo.suggest_slp_f_count -
                    patientInfo.mds_slp_f_count}
                </span>
              ) : (
                <span>
                  -{' '}
                  {patientInfo.mds_slp_f_count -
                    patientInfo.suggest_slp_f_count}
                </span>
              )}
            </p>
            <br />
          </td>
        );
      },
    },
    {
      accessorKey: 'review',
      header: 'Review',
      cell: (info) => {
        const [thumbUpState, setThumbUpState] = useState(
          info.row.original.is_thumb_up || 0,
        );
        const [thumbDownState, setThumbDownState] = useState(
          info.row.original.is_thumb_down || 0,
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
          <td className="py-2 px-4 border-t border-l border-gray-600">
            <p className="whitespace-nowrap text-left">
              = {patientInfo.suggest_slp_s_count}
            </p>
            <p className="whitespace-nowrap text-left">
              = {patientInfo.suggest_slp_f_count}
            </p>
            <p className="whitespace-nowrap text-left">
              Projected Case Mix Group: {patientInfo.suggest_slp_group} (CMI: {}
              {patientInfo.suggest_slp_cmi}, ${patientInfo.suggest_slp_pay})
            </p>
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

  return (
    <SmallTableWrapper
      permanentColumnFilters={permanentColumnFilters}
      table={table}
      tableState={tableState}
      setTableState={setTableState}
    />
  );
}
