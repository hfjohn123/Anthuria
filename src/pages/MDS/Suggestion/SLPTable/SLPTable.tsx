import {
  SLPItem,
  ProgressNoteAndSummary,
  SLPEntry,
} from '../../../../types/MDSFinal.ts';
import { Fragment, useState } from 'react';
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
import { SLPMapping } from '../../cmiMapping.ts';
import SmallTableWrapper from '../SmallTableWrapper.tsx';
import MDSCommentModal from '../MDSCommentModal.tsx';
import UpVoteButton from '../UpVoteButton.tsx';

const permanentColumnFilters = ['condition', 'is_mds'];

function getSLPCategory(total_general: number, total_diet: number) {
  if (total_general === 3 && total_diet === 2) {
    return 'SL';
  }
  if (total_general === 3 && total_diet === 1) {
    return 'SK';
  }
  if (total_general === 3 && total_diet === 0) {
    return 'SJ';
  }
  if (total_general === 2 && total_diet === 2) {
    return 'SI';
  }
  if (total_general === 2 && total_diet === 1) {
    return 'SH';
  }
  if (total_general === 2 && total_diet === 0) {
    return 'SG';
  }
  if (total_general === 1 && total_diet === 2) {
    return 'SF';
  }
  if (total_general === 1 && total_diet === 1) {
    return 'SE';
  }
  if (total_general === 1 && total_diet === 0) {
    return 'SD';
  }
  if (total_general === 0 && total_diet === 2) {
    return 'SC';
  }
  if (total_general === 0 && total_diet === 1) {
    return 'SB';
  }
  return 'SA';
}

export default function SLPTable({ data }: { data: SLPItem[] }) {
  console.log(data);
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
      footer: (info) => {
        const total_general = info.table.getRowModel().rows.filter((row) => {
          return (
            row.original.is_mds_table &&
            row.original.item !== 'mad' &&
            row.original.item !== 'sd'
          );
        }).length;
        const total_diet = info.table.getRowModel().rows.filter((row) => {
          return (
            row.original.is_mds_table &&
            (row.original.item === 'mad' || row.original.item === 'sd')
          );
        }).length;
        return (
          <td className="py-2 px-4 border-t border-l border-gray-600">
            <p className="whitespace-nowrap text-left">
              Current Presence of SLP Conditions: {total_general}
            </p>
            <p className="whitespace-nowrap text-left">
              Current Presence of Diet Conditions: {total_diet}
            </p>
            <p className="whitespace-nowrap text-left">
              Current Case Mix Group:{' '}
              {getSLPCategory(total_general, total_diet)} (CMI:{' '}
              {SLPMapping[getSLPCategory(total_general, total_diet)]})
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
      footer: (info) => {
        const total_general = info.table.getRowModel().rows.filter((row) => {
          return (
            !row.original.is_mds_table &&
            (row.original.suggestion?.length ?? 0) > 0 &&
            row.original.item !== 'mad' &&
            row.original.item !== 'sd'
          );
        }).length;
        const total_diet = info.table.getRowModel().rows.filter((row) => {
          return (
            !row.original.is_mds_table &&
            (row.original.suggestion?.length ?? 0) > 0 &&
            (row.original.item === 'mad' || row.original.item === 'sd')
          );
        }).length;
        return (
          <td className="py-2 px-4 border-t border-l border-gray-600">
            <p className="whitespace-nowrap text-left ">+ {total_general}</p>
            <p className="whitespace-nowrap text-left">+ {total_diet}</p>
            <br />
          </td>
        );
      },
    },
    {
      accessorKey: 'review',
      header: 'Review',
      cell: (info) => {
        if (info.row.original.suggestion?.length ?? 0 > 0) {
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
      footer: (info) => {
        const total_general = info.table.getRowModel().rows.filter((row) => {
          return (
            (row.original.is_mds_table ||
              (row.original.suggestion?.length ?? 0) > 0) &&
            row.original.item !== 'mad' &&
            row.original.item !== 'sd'
          );
        }).length;
        const total_diet = info.table.getRowModel().rows.filter((row) => {
          return (
            (row.original.is_mds_table ||
              (row.original.suggestion?.length ?? 0) > 0) &&
            (row.original.item === 'mad' || row.original.item === 'sd')
          );
        }).length;
        return (
          <td className="py-2 px-4 border-t border-l border-gray-600">
            <p className="whitespace-nowrap text-left">= {total_general}</p>
            <p className="whitespace-nowrap text-left">= {total_diet}</p>
            <p className="whitespace-nowrap text-left">
              Projected Case Mix Group:{' '}
              {getSLPCategory(total_general, total_diet)} (CMI:{' '}
              {SLPMapping[getSLPCategory(total_general, total_diet)]})
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
