import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { Table } from '@tanstack/react-table';

export default async function exportExcel(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>,
  filename: string,
  applyFilters = true,
) {
  const wb = new Workbook();
  const ws = wb.addWorksheet('Sheet 1');

  const lastHeaderGroup = table.getHeaderGroups().at(-1);
  if (!lastHeaderGroup) {
    console.error('No header groups found', table.getHeaderGroups());
    return;
  }
  const all_columns = table.getAllColumns();
  const columns = all_columns.filter(
    (column) => column.columnDef.meta?.download,
  );
  console.log(columns[5].getIsVisible());

  ws.columns = columns.map((column) => {
    return {
      header: column.columnDef.header as string,
      key: column.id,
      width: column.columnDef.meta?.excelWidth,
    };
  });

  const exportRows = applyFilters
    ? table.getFilteredRowModel().rows
    : table.getCoreRowModel().rows;

  exportRows.forEach((row) => {
    const values = ws.columns.map((col) => row.getValue(col.key as string));
    ws.addRow(values);
  });

  ws.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });
  for (let i = 2; i <= ws.rowCount; i++) {
    const row = ws.getRow(i);

    //Now loop through every row's cell and finally set alignment
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = {
        vertical: 'top',
        horizontal: 'left',
        wrapText: true,
      };
    });
  }

  // for csv: await wb.csv.writeBuffer();
  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), `${filename}.xlsx`);
}
