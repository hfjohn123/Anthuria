import PrimaryButton from '../../../components/Basic/PrimaryButton.tsx';
import { Row, TableState } from '@tanstack/react-table';
import { TriggerFinal } from '../../../types/TriggerFinal.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { createToast } from '../../../hooks/fireToast.tsx';
import { useContext } from 'react';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import HighlightWrapper from '../../../components/Basic/HighlightWrapper.tsx';
import LineClampShowMore from '../../../common/LineClampShowMore.tsx';

export default function DetailWithNoProgressNote({
  row,
  tableState,
}: {
  row: Row<TriggerFinal>;
  tableState: TableState;
}) {
  const { route } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const acknowledgeWeightChange = useMutation({
    mutationFn: async ({
      patient_id,
      internal_facility_id,
    }: {
      patient_id: string;
      internal_facility_id: string;
    }) => {
      return axios.put(`${route}/trigger_word_weight_change_ack`, {
        patient_id,
        internal_facility_id,
      });
    },
    onMutate: async ({
      patient_id,
      internal_facility_id,
    }: {
      patient_id: string;
      internal_facility_id: string;
    }) => {
      await queryClient.cancelQueries({
        queryKey: ['trigger_word_view_trigger_word_detail_final', route],
      });
      const previousData = queryClient.getQueryData([
        'trigger_word_view_trigger_word_detail_final',
        route,
      ]);
      if (previousData) {
        const newData = structuredClone(previousData) as TriggerFinal[];
        for (let i = 0; i < newData.length; i++) {
          if (
            newData[i].patient_id === patient_id &&
            newData[i].internal_facility_id === internal_facility_id &&
            newData[i].progress_note_id === null &&
            newData[i].trigger_words[0].trigger_word === 'Weight Change'
          ) {
            newData[i].trigger_words[0].is_thumb_up = true;
          }
        }
        queryClient.setQueryData(
          ['trigger_word_view_trigger_word_detail_final', route],
          newData,
        );
      }
      return { previousData };
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(
        ['trigger_word_view_trigger_word_detail_final', route],
        context?.previousData,
      );
      createToast(
        'Fail to Acknowledge Weight Change',
        error.message,
        3,
        'Fail to Acknowledge Weight Change',
      );
    },
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-2.5 text-sm flex flex-wrap">
      <table className="basis-full pb-3 border-stroke border-spacing-y-2.5 border-separate">
        <thead>
          <tr>
            <th className="text-left w-2/12">
              <div className="flex gap-1.5">
                <p>Trigger</p>
              </div>
            </th>
            <th className="text-left pr-10 w-8/12">
              <div className="flex gap-1.5">
                <p>Explanations</p>
              </div>
            </th>
            <th className="text-left pr-10 w-2/12">
              <p>Review</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {row.original.trigger_words.map(
            ({ trigger_word, summary, is_thumb_up }) => (
              <tr key={row.id + trigger_word}>
                <td className="whitespace-nowrap align-top flex items-center flex-nowrap">
                  <HighlightWrapper
                    text={trigger_word || ''}
                    searchTerm={tableState.globalFilter}
                  />
                </td>
                <td className="pr-10">
                  <LineClampShowMore className="whitespace-pre-line">
                    <HighlightWrapper
                      text={summary}
                      searchTerm={tableState.globalFilter}
                    />
                  </LineClampShowMore>
                </td>
                <td className="align-top whitespace-nowrap">
                  {is_thumb_up ? (
                    <PrimaryButton disabled>Acknowledged</PrimaryButton>
                  ) : (
                    <PrimaryButton
                      onClick={() =>
                        acknowledgeWeightChange.mutate({
                          patient_id: row.original.patient_id,
                          internal_facility_id:
                            row.original.internal_facility_id,
                        })
                      }
                    >
                      Acknowledge
                    </PrimaryButton>
                  )}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
