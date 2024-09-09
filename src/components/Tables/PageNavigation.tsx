export default function PageNavigation({
  table,
  tableState,
}: {
  table: any;
  tableState: any;
}) {
  return (
    <div className="flex items-center gap-2 px-2 py-2  w-full text-sm sm:text-base ">
      <button
        className="border rounded p-1 disabled:opacity-30 hidden sm:block"
        onClick={() => table.firstPage()}
        disabled={!table.getCanPreviousPage()}
      >
        {'<<'}
      </button>
      <button
        className="border rounded p-1 disabled:opacity-30"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        {'<'}
      </button>
      <button
        className="border rounded p-1 disabled:opacity-30"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        {'>'}
      </button>
      <button
        className="border rounded p-1 disabled:opacity-30 hidden sm:block"
        onClick={() => table.lastPage()}
        disabled={!table.getCanNextPage()}
      >
        {'>>'}
      </button>
      <span className="flex items-center gap-1 whitespace-nowrap">
        <div>Page</div>
        <strong>
          {tableState.pagination.pageIndex + 1} of{' '}
          {table.getPageCount().toLocaleString()}
        </strong>
      </span>
      <span className="flex items-center gap-1 whitespace-nowrap text-sm sm:text-base">
        | Go to page:
        <input
          type="number"
          onChange={(e) => {
            const page = e.target.value
              ? Math.min(Number(e.target.value) - 1, table.getPageCount() - 1)
              : 0;
            table.setPageIndex(page);
          }}
          value={tableState.pagination.pageIndex + 1}
          className="border border-stroke p-1 rounded w-6 sm:w-16 bg-transparent"
        />
      </span>
      <select
        value={tableState.pagination.pageSize}
        onChange={(e) => {
          table.setPageSize(Number(e.target.value));
        }}
        className="bg-transparent"
      >
        {[10, 20, 30, 50, 100, 200].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </select>
    </div>
  );
}
