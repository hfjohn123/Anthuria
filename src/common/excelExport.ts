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
  console.log(lastHeaderGroup);
  ws.columns = lastHeaderGroup.headers
    .filter((h) => h.column.getIsVisible())
    .map((header) => {
      if (header.id === 'progress_note') {
        return {
          header: header.column.columnDef.header as string,
          key: header.id,
          width: 80,
          alignment: {
            wrapText: true,
          },
        };
      }
      return {
        header: header.column.columnDef.header as string,
        key: header.id,
        width: 20,
      };
    });

  const exportRows = applyFilters
    ? table.getFilteredRowModel().rows
    : table.getCoreRowModel().rows;

  exportRows.forEach((row) => {
    const cells = row.getVisibleCells();
    const values = cells.map((cell) => cell.getValue() ?? '');
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
