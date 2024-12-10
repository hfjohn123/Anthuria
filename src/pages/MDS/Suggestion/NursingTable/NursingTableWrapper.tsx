import SmallTableWrapper from '../SmallTableWrapper.tsx';
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
import getFacetedUniqueValues from '../../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../../common/getFacetedMinMaxValues.ts';

const permanentColumnFilters = ['mds_item'];

export default function NursingTableWrapper({ data }: { data: any }) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'mds_item',
      header: 'MDS Item',
      filterFn: 'arrIncludesSome',
      cell: (info) => (
        <td className="py-2 px-4 border-t ">{info.getValue() as string}</td>
      ),
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: (info) => (
        <td className="py-2 px-4 border-t border-l whitespace-pre-line">
          {info.getValue() as string}
        </td>
      ),
    },
    // {
    //   accessorKey: 'is_in_mds',
    //   header: 'Is Already in MDS Table',
    //   cell: (info) => (
    //     <td className="py-2 px-4 border-t border-l whitespace-nowrap">
    //       {info.row.original.suggestion ? 'Yes' : 'No'}
    //     </td>
    //   ),
    // },

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
      accessorKey: 'review',
      header: 'Review',
      cell: () => (
        <td className="py-2 px-4 border-t border-l">
          <div className="flex items-center gap-2">
            <ThumbsUp className="size-5 cursor-pointer hover:text-blue-500" />
            <ThumbsDown className="size-5 cursor-pointer hover:text-red-500" />
          </div>
        </td>
      ),
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
