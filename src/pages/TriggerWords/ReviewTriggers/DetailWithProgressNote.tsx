import { Row, TableState } from '@tanstack/react-table';
import { TriggerAPI, TriggerFinal } from '../../../types/TriggerFinal.ts';
import HighlightWrapper from '../../../components/Basic/HighlightWrapper.tsx';
import LineClampShowMore from '../../../common/LineClampShowMore.tsx';
import DataField from './DataField.tsx';
import MagicButton from '../../../images/icon/MagicButton.tsx';
import TriggerReviewButton from '../../../components/Tables/TriggerReviewButton.tsx';
import { useContext, useEffect, useMemo } from 'react';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { handleClick } from '../../MDS/Suggestion/EvidenceModal.tsx';
import { Button } from 'primereact/button';
import { StartEnd } from './ReviewTriggers.tsx';

export default function DetailWithProgressNote({
  row,
  tableState,
}: {
  row: Row<TriggerFinal>;
  tableState: TableState;
}) {
  const { user_data, route } = useContext(AuthContext);
  const explanation = useMemo(() => {
    return row.original.trigger_words
      .map((t) => `${t.trigger_word}: ${t.summary}`)
      .join('\n\n');
  }, [row.original.trigger_words]);
  const { start, end } = useContext(StartEnd);
  const queryClient = useQueryClient();
  const putTouchLog = useMutation({
    mutationFn: async () => {
      return axios.put(`${route}/touch_log`, {
        internal_facility_id: row.original.internal_facility_id,
        internal_patient_id: row.original.internal_patient_id,
        progress_note_id: row.original.progress_note_id,
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['trigger_word_view_trigger_word_detail_final'],
      });
      const previousData = queryClient.getQueryData(
        user_data.organization_id === 'AVHC'
          ? ['trigger_word_view_trigger_word_detail_final', route]
          : ['trigger_word_view_trigger_word_detail_final', start, end, route],
      );
      queryClient.setQueryData(
        user_data.organization_id === 'AVHC'
          ? ['trigger_word_view_trigger_word_detail_final', route]
          : ['trigger_word_view_trigger_word_detail_final', start, end, route],
        (oldData: TriggerAPI) => {
          if (oldData) {
            return {
              ...oldData,
              data: oldData.data.map((d) => {
                if (
                  d.patient_id === row.original.patient_id &&
                  d.internal_facility_id ===
                    row.original.internal_facility_id &&
                  d.progress_note_id === row.original.progress_note_id
                ) {
                  return {
                    ...d,
                    touched: 1,
                  };
                }
                return d;
              }),
            };
          }
        },
      );
      return { previousData };
    },
    onSuccess: async () => {
      await queryClient.cancelQueries({
        queryKey: ['trigger_word_view_trigger_word_detail_final'],
      });
      queryClient.invalidateQueries({
        queryKey: ['trigger_word_view_trigger_word_detail_final'],
        type: 'all',
      });
    },
  });
  useEffect(() => {
    if (
      row.original.touched === 0 &&
      (user_data.organization_id !== 'the_triedge_labs' ||
        user_data.email === 'qi.song@triedgelab.com' ||
        user_data.email === 'sam.pan@triedgelab.com') &&
      (!user_data.email.endsWith('theportopiccologroup.com') ||
        user_data.email === 'testavetura@theportopiccologroup.com') &&
      !user_data.email.endsWith('anthuria.ai')
    )
      putTouchLog.mutate();
  }, [
    row.original.internal_facility_id,
    row.original.internal_patient_id,
    row.original.progress_note_id,
  ]);

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
        <DataField title={'Progress Note ID'}>
          <Button
            className="bg-transparent border-0 text-primary p-1"
            onClick={() =>
              handleClick(
                row.original.progress_note_id,
                row.original.url_header || '',
                row.original.patient_id,
                row.original.internal_facility_id,
              )
            }
          >
            {row.original.progress_note_id}
          </Button>
        </DataField>
      </div>
      <br />
    </div>
  );
}
