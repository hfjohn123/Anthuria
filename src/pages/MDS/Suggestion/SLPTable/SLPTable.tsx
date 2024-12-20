import {
  SLPItem_General,
  SLPItem_comorbidities_present,
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
import { ThumbsDown, ThumbsUp } from '@phosphor-icons/react';
import getFacetedUniqueValues from '../../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../../common/getFacetedMinMaxValues.ts';

import EvidenceModal from '../EvidenceModal.tsx';
import { SLPMapping } from '../../cmiMapping.ts';
import SmallTableWrapper from '../SmallTableWrapper.tsx';

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

export default function SLPTable({
  data,
}: {
  data: (SLPItem_General | SLPItem_comorbidities_present)[];
}) {
  const columns: ColumnDef<SLPItem_General | SLPItem_comorbidities_present>[] =
    [
      {
        accessorKey: 'condition',
        header: 'Condition',
        filterFn: 'arrIncludesSome',
        cell: (info) => {
          return (
            <td className="whitespace-normal max-w-[30vw] py-2 px-4 border-t ">
              {info.getValue() as string}
            </td>
          );
        },
        meta: {
          type: 'categorical',
        },
      },
      {
        accessorKey: 'is_mds',
        accessorFn: (row) => (row.is_mds ? 'Yes' : 'No'),
        header: 'Is Already in MDS Table',
        cell: (info) => {
          return (
            <td className="whitespace-nowrap py-2 px-4 border-t border-l">
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
              row.original.is_mds &&
              row.original.condition !== 'Mechanically Altered Diet' &&
              row.original.condition !== 'Swallowing Disorder'
            );
          }).length;
          const total_diet = info.table.getRowModel().rows.filter((row) => {
            return (
              row.original.is_mds &&
              (row.original.condition === 'Mechanically Altered Diet' ||
                row.original.condition === 'Swallowing Disorder')
            );
          }).length;
          return (
            <td className="py-2 px-4 border-t border-l">
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
        accessorFn: (row) => row.slp_entry,
        cell: (info) => {
          const value = info.getValue() as Array<
            ProgressNoteAndSummary | SLPEntry
          >;
          if (value && value.length > 0) {
            if (info.row.original.condition === 'Comorbidities Present') {
              return (
                <td className="py-2 px-4 border-t border-l">
                  {value.map((entry, index) => {
                    entry = entry as SLPEntry;
                    return (
                      <Fragment key={entry.comorbidity}>
                        {entry.new_icd10 && entry.new_icd10.length > 0 ? (
                          <EvidenceModal
                            icd10={{
                              icd10: entry.comorbidity,
                              progress_note: entry.new_icd10.flatMap(
                                (d) => d.progress_note,
                              ),
                              is_thumb_up: null,
                              comment: null,
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
                <td className="py-2 px-4 border-t border-l">
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
                      is_thumb_up: null, // or some default value
                      comment: null, // or some default value
                    }}
                  />
                </td>
              );
            }
          }
          return <td className="py-2 px-4 border-t border-l"></td>;
        },
        header: 'AI Suggested Conditions',
        footer: (info) => {
          const total_general = info.table.getRowModel().rows.filter((row) => {
            return (
              !row.original.is_mds &&
              row.original.is_suggest &&
              row.original.condition !== 'Mechanically Altered Diet' &&
              row.original.condition !== 'Swallowing Disorder'
            );
          }).length;
          const total_diet = info.table.getRowModel().rows.filter((row) => {
            return (
              !row.original.is_mds &&
              row.original.is_suggest &&
              (row.original.condition === 'Mechanically Altered Diet' ||
                row.original.condition === 'Swallowing Disorder')
            );
          }).length;
          return (
            <td className="py-2 px-4 border-t border-l">
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
        cell: () => {
          return (
            <td className=" py-2 px-4 border-t border-l">
              <div className="h-full flex items-center gap-2">
                <ThumbsUp className="size-5" />
                <ThumbsDown className="size-5" />
              </div>
            </td>
          );
        },
        footer: (info) => {
          const total_general = info.table.getRowModel().rows.filter((row) => {
            return (
              (row.original.is_mds || row.original.is_suggest) &&
              row.original.condition !== 'Mechanically Altered Diet' &&
              row.original.condition !== 'Swallowing Disorder'
            );
          }).length;
          const total_diet = info.table.getRowModel().rows.filter((row) => {
            return (
              (row.original.is_mds || row.original.is_suggest) &&
              (row.original.condition === 'Mechanically Altered Diet' ||
                row.original.condition === 'Swallowing Disorder')
            );
          }).length;
          return (
            <td className="py-2 px-4 border-t border-l">
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
