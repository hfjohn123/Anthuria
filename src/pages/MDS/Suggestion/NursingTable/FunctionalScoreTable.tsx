import SmallTableWrapper from '../SmallTableWrapper.tsx';
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import {
  FunctionalScore,
  NursingFunctionalScore,
} from '../../../../types/MDSFinal.ts';
import { ThumbsDown, ThumbsUp } from '@phosphor-icons/react';
import { useState } from 'react';
import getFacetedUniqueValues from '../../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../../common/getFacetedMinMaxValues.ts';
import clsx from 'clsx';

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
export default function FunctionalScoreTable({
  data,
}: {
  data: NursingFunctionalScore;
}) {
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
            className="py-2 px-4 border-t border-l  first:border-l-0 align-top bg-white"
          >
            {info.getValue() as string}
          </td>
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
        <td className="py-2 px-4 border-t border-l ">
          {info.getValue() as string}
        </td>
      ),
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'individual_function_score',
      header: 'Function Score',
      cell: (info) => (
        <td className="py-2 px-4 border-t border-l  whitespace-nowrap">
          {info.getValue() as string}
        </td>
      ),
      filterFn: 'arrIncludesSome',
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'suggestion',
      header: 'AI Suggested Conditions',
      cell: (info) => (
        <td className="py-2 px-4 border-t border-l ">
          {(info.getValue() as string[])?.join(', ') || ''}
        </td>
      ),
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
            className="py-2 px-4 border-t border-l  bg-blue-50 align-top"
          >
            {info.getValue() as string}
          </td>
        );
      },
      footer: () => {
        return (
          <td className="py-2 px-4  border-t  border-l  bg-blue-50 font-medium">
            Total Score: {data.final_score}
          </td>
        );
      },
    },
    {
      accessorKey: 'review',
      header: 'Review',
      cell: () => (
        <td className="py-2 px-4 border-t border-l ">
          <div className="flex items-center gap-2">
            <ThumbsUp className="size-5 cursor-pointer hover:text-blue-500" />
            <ThumbsDown className="size-5 cursor-pointer hover:text-red-500" />
          </div>
        </td>
      ),
      // footer: () => {
      //   return (
      //     <td className="py-2 px-4  border-r  last:border-r-0 font-medium">
      //       Case Mix Group: {data.mix_group}
      //     </td>
      //   );
      // },
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
    <div className={clsx('flex flex-col', data.function_score_all && 'gap-3')}>
      <p className="font-semibold">Functional Score: {data.final_score}</p>
      {data.function_score_all ? (
        <SmallTableWrapper
          permanentColumnFilters={permanentColumnFilters}
          table={table}
          tableState={tableState}
          setTableState={setTableState}
        />
      ) : (
        <p>No Functional Score Available</p>
      )}
    </div>
  );
}
