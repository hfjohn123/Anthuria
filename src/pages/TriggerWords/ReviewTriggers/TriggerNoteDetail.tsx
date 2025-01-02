import { Row, TableState } from '@tanstack/react-table';
import { TriggerFinal } from '../../../types/TriggerFinal.ts';

import DetailWithProgressNote from './DetailWithProgressNote.tsx';
import DetailWithNoProgressNote from './DetailWithNoProgressNote.tsx';

export default function TriggerNoteDetail({
  row,
  tableState,
}: {
  row: Row<TriggerFinal>;
  tableState: TableState;
}) {
  if (row.getValue('progress_note_id') === null)
    return <DetailWithNoProgressNote row={row} tableState={tableState} />;
  return <DetailWithProgressNote row={row} tableState={tableState} />;
}
