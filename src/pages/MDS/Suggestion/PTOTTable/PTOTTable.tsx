import {
  ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import { ThumbsDown, ThumbsUp } from '@phosphor-icons/react';
import { useState } from 'react';
import { FunctionalScore, PTOTFinal } from '../../../../types/MDSFinal.ts';
import getFacetedUniqueValues from '../../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../../common/getFacetedMinMaxValues.ts';
import SmallTableWrapper from '../SmallTableWrapper.tsx';
import { PTOTMapping } from '../../cmiMapping.ts';

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
          <td className="py-2 px-4  border-t border-l  bg-blue-50 font-medium">
            Total Score: {data.final_score}
          </td>
        );
      },
    },
    {
      accessorKey: 'review',
      header: 'Review',
      cell: () => (
        <td className="py-2 px-4 border-t border-l  last:border-r-0">
          <div className="flex items-center gap-2">
            <ThumbsUp className="size-5 cursor-pointer hover:text-blue-500" />
            <ThumbsDown className="size-5 cursor-pointer hover:text-red-500" />
          </div>
        </td>
      ),
      footer: () => {
        return (
          <td className="py-2 px-4  border-t border-l  last:border-r-0 font-medium">
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
