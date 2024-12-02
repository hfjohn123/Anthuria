import { Row } from '@tanstack/react-table';
import { TriggerFinal } from '../../../types/TriggerFinal.ts';

import DetailWithProgressNote from './DetailWithProgressNote.tsx';
import DetailWithNoProgressNote from './DetailWithNoProgressNote.tsx';

export default function TriggerNoteDetail({ row }: { row: Row<TriggerFinal> }) {
  if (row.getValue('progress_note_id') === null)
    return <DetailWithNoProgressNote row={row} />;
  return <DetailWithProgressNote row={row} />;
}
