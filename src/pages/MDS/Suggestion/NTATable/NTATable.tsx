import {
  NTAICD10,
  ProgressNoteAndSummary,
} from '../../../../types/MDSFinal.ts';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import { Fragment, useState } from 'react';
import ProgressNoteModal from '../ProgressNoteModal.tsx';
import { Tooltip } from 'react-tooltip';
import { ThumbsUp } from '@phosphor-icons/react';
import MDSCommentModal from '../MDSCommentModal.tsx';
import getFacetedUniqueValues from '../../../../common/getFacetedUniqueValues.ts';
import getFacetedMinMaxValues from '../../../../common/getFacetedMinMaxValues.ts';
import Select from 'react-select';
import filterSelectStyles from '../../../../components/Select/filterSelectStyles.ts';
import FilterValueContainer from '../../../../components/Select/FilterValueContainer.tsx';
import CheckboxOption from '../../../../components/Select/CheckboxOption.tsx';
import handleFilterChange from '../../../../components/Tables/handleFilterChange.ts';
import { Button } from '@headlessui/react';
import clsx from 'clsx';

const permanentColumnFilters = ['icd10', 'comorbidity'];

export default function NTATable({ data }: { data: NTAICD10[] }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const columns: ColumnDef<NTAICD10>[] = [
    {
      accessorKey: 'icd10',
      header: 'Potential ICD-10 Code',
      filterFn: 'arrIncludesSome',
      cell: (info) => {
        return <p className="whitespace-nowrap">{info.getValue() as string}</p>;
      },
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'comorbidity',
      header: 'Comorbidity',
      filterFn: 'arrIncludesSome',
      cell: (info) => {
        return (
          <p className="whitespace-normal max-w-[30vw]">
            {info.getValue() as string}
          </p>
        );
      },
      meta: {
        type: 'categorical',
      },
    },
    {
      accessorKey: 'progress_note',
      accessorFn: (row) => row.progress_note,
      cell: (info) => {
        return (
          <div className="max-w-[30vw]">
            <p className="line-clamp-3 whitespace-normal">
              {(info.getValue() as ProgressNoteAndSummary[]).map(
                ({ highlights, explanation }, index) => (
                  <Fragment key={index}>
                    <span
                      data-tooltip-id="explanation-tooltip"
                      data-tooltip-content={explanation}
                      className="whitespace-normal"
                    >
                      Highlights: {highlights}
                    </span>
                    {index <
                      (info.getValue() as ProgressNoteAndSummary[]).length -
                        1 && <br />}
                  </Fragment>
                ),
              )}
            </p>
            <ProgressNoteModal
              progressNoteAndSummary={
                info.getValue() as ProgressNoteAndSummary[]
              }
            />
            <Tooltip
              id="explanation-tooltip"
              className="whitespace-normal sm:max-w-[40vw] max-w-[95vw] z-99"
            />
          </div>
        );
      },
      header: 'Progress Note/Explanation',
    },
    {
      accessorKey: 'review',
      accessorFn: (row) => {
        return {
          is_thumb_up: row.is_thumb_up,
          comment: row.comment,
        };
      },
      header: 'Review',
      cell: (info) => {
        const { is_thumb_up, comment } = info.getValue() as {
          is_thumb_up: boolean;
          comment: string;
        };
        return (
          <div className=" flex items-center flex-nowrap gap-2 ">
            {is_thumb_up ? (
              <ThumbsUp
                className="size-4 text-meta-3 cursor-pointer"
                weight="fill"
              />
            ) : (
              <ThumbsUp
                className="size-4 cursor-pointer"
                // onClick={() =>
                //   putComment.mutate({
                //     progress_note_id: row.original.progress_note_id,
                //     trigger_word: trigger_word,
                //     comment: '',
                //     is_thumb_up: true,
                //   })
                // }
              />
            )}
            <MDSCommentModal comment={comment} is_thumb_up={is_thumb_up} />
          </div>
        );
      },
    },
    {
      accessorKey: 'action',
      header: 'Actions',
      cell: () => {
        return <p className="whitespace-nowrap">Coming Soon</p>;
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
    <div className="py-5 px-5 ">
      <div className="w-full flex items-center gap-3 mt-1">
        {permanentColumnFilters.map((filter) => (
          <Select
            classNames={{ ...filterSelectStyles }}
            key={filter}
            placeholder={table.getColumn(filter)?.columnDef.header as string}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            components={{
              IndicatorSeparator: () => null,
              ValueContainer: FilterValueContainer,
              Option: CheckboxOption,
            }}
            isClearable={true}
            isMulti={true}
            value={
              tableState.columnFilters.find((f) => f.id === filter)
                ? (
                    tableState.columnFilters.find((f) => f.id === filter)
                      ?.value as string[]
                  ).map((s) => ({
                    label: s,
                    value: s,
                  }))
                : []
            }
            name={filter}
            options={Array.from(
              table?.getColumn(filter)?.getFacetedUniqueValues()?.keys() ?? [],
            ).map((key) => ({
              label: key,
              value: key,
            }))}
            onChange={(selected, action) => {
              handleFilterChange(selected, action, setTableState);
            }}
          />
        ))}
        {tableState.columnFilters.length > 0 && (
          <Button
            color="secondary"
            onClick={() =>
              setTableState((prev) => ({ ...prev, columnFilters: [] }))
            }
          >
            Clear all
          </Button>
        )}
      </div>
      <table className="mt-3 w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="py-2 border-y-[1.5px] border-stroke dark:border-strokedark text-left select-none group whitespace-nowrap text-body-2"
                  >
                    {header.isPlaceholder ? null : (
                      <span>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="w-full">
          {table.getRowModel().rows.map((row, index) => {
            return (
              <tr
                key={row.id}
                className={clsx(index > 2 && !expanded && 'hidden')}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      key={cell.id}
                      className={clsx(
                        'py-2 border-b-[1.5px] border-stroke dark:border-strokedark',
                        cell.column.columnDef.meta?.wrap,
                      )}
                    >
                      {
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        ) as string
                      }
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.length === 0 && <p>No ICD-10 Codes</p>}
      {data.length > 3 && (
        <Button
          className="text-primary self-start"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
      )}
    </div>
  );
}
