import { Row, TableState } from '@tanstack/react-table';
import { TriggerFinal } from '../../../types/TriggerFinal.ts';

import DetailWithProgressNote from './DetailWithProgressNote.tsx';

export default function TriggerNoteDetail({
  row,
  tableState,
}: {
  row: Row<TriggerFinal>;
  tableState: TableState;
}) {
  return <DetailWithProgressNote row={row} tableState={tableState} />;
}
