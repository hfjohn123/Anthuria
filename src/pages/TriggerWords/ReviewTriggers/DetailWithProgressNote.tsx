import { Row, TableState } from '@tanstack/react-table';
import { TriggerFinal } from '../../../types/TriggerFinal.ts';
import HighlightWrapper from '../../../components/Basic/HighlightWrapper.tsx';
import LineClampShowMore from '../../../common/LineClampShowMore.tsx';
import DataField from './DataField.tsx';
import MagicButton from '../../../images/icon/MagicButton.tsx';
import TriggerReviewButton from '../../../components/Tables/TriggerReviewButton.tsx';

export default function DetailWithProgressNote({
  row,
  tableState,
}: {
  row: Row<TriggerFinal>;
  tableState: TableState;
}) {
  const explanation = row.original.trigger_words
    .map((t) => t.trigger_word + ': ' + t.summary)
    .join('\n\n');

  return (
    <div className="bg-transparent  p-2.5 text-sm  flex flex-col gap-5 h-full w-full  ">
      {explanation && (
        <DataField
          title={
            <div className="text-[#7A7A7A] flex gap-2">
              AI Explanation <MagicButton className="size-5" />
            </div>
          }
        >
          <LineClampShowMore className="whitespace-pre-line" maxLines={3}>
            <HighlightWrapper
              text={explanation || ''}
              searchTerm={tableState.globalFilter || ''}
            />
          </LineClampShowMore>
        </DataField>
      )}
      <DataField
        title={
          <div className="text-[#7A7A7A] flex gap-2">
            AI Categories <MagicButton className="size-5" />
          </div>
        }
      >
        <div>
          {row.original.trigger_words.map((t) => (
            <TriggerReviewButton
              row={row}
              t={t}
              tableState={tableState}
              key={t.trigger_word}
            />
          ))}
        </div>
      </DataField>
      <div className="flex flex-col gap-2">
        <DataField title="Progress Note">
          <LineClampShowMore className="whitespace-pre-line">
            <HighlightWrapper
              text={row.getValue('progress_note') || ''}
              searchTerm={tableState.globalFilter || ''}
            />
          </LineClampShowMore>
        </DataField>
      </div>
      <div className="flex gap-5 justify-stretch ">
        <DataField
          className="flex-1"
          title="Author of note"
          content={row.getValue('revision_by')}
          searchTerm={tableState.globalFilter || ''}
        />
        <DataField
          className="flex-1"
          title="Date/Time"
          content={new Date(row.getValue('revision_date')).toLocaleString(
            navigator.language,
            {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            },
          )}
          searchTerm={tableState.globalFilter || ''}
        />
        <DataField
          className="flex-1"
          title="Progress Note ID"
          content={row.getValue('progress_note_id')}
          searchTerm={tableState.globalFilter || ''}
        />
      </div>
    </div>
  );
}
