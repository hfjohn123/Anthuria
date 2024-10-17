import HyperLink from '../../../components/Basic/HyerLink.tsx';
import ShowMoreText from 'react-show-more-text';
import { Bot } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { ThumbsDown, ThumbsUp } from '@phosphor-icons/react';
import Modal from '../../../components/Modal/Modal.tsx';
import CommentForm from '../../../components/Forms/CommentForm.tsx';
import { Row } from '@tanstack/react-table';
import { TriggerFinal } from '../../../types/TriggerFinal.ts';
import usePutComment from '../../../hooks/interface/usePutComment.ts';
import { useContext, useState } from 'react';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PrimaryButton from '../../../components/Basic/PrimaryButton.tsx';
import axios from 'axios';
import { createToast } from '../../../hooks/fireToast.tsx';

export default function TriggerNoteDetail({ row }: { row: Row<TriggerFinal> }) {
  const { route } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const putComment = usePutComment(route, queryClient);
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
  if (row.getValue('progress_note_id') === null)
    return (
      <div className="bg-slate-50 dark:bg-slate-900 px-4 text-sm py-4 flex flex-wrap">
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
                    {trigger_word}
                  </td>
                  <td className="pr-10">
                    <ShowMoreText
                      className="whitespace-pre-line"
                      keepNewLines
                      anchorClass="text-primary cursor-pointer block dark:text-secondary"
                    >
                      {summary}
                    </ShowMoreText>
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
  return (
    <div className="bg-slate-50 dark:bg-slate-900 px-4 text-sm py-4 flex flex-col gap-4.5">
      <table className="basis-full pb-3 border-stroke border-b border-spacing-y-2.5 border-separate">
        <thead>
          <tr>
            <th className="text-left w-2/12">
              <div className="flex gap-1.5">
                <p>Trigger</p>
                <Bot
                  data-tooltip-id="bot-tooltip"
                  data-tooltip-content="Trigger generated by AI from Progress Note"
                  className="size-5 block focus:outline-none"
                />
                <Tooltip id="bot-tooltip" />
              </div>
            </th>
            <th className="text-left pr-10 w-6/12">
              <div className="flex gap-1.5">
                <p>Explanations</p>
                <Bot
                  data-tooltip-id="bot-tooltip"
                  data-tooltip-content="Explanation generated by AI from Progress Note"
                  className="size-5 block focus:outline-none"
                />
                <Tooltip id="bot-tooltip" />
              </div>
            </th>
            <th className="text-left  w-2/12">
              <p>Review</p>
            </th>
            <th className="text-left w-2/12">
              <p>Actions</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {row.original.trigger_words.map(
            ({ trigger_word, is_thumb_up, summary, comment, event_ids }) => (
              <tr key={row.id + trigger_word}>
                <td className="whitespace-nowrap align-top flex items-center flex-nowrap">
                  {trigger_word}
                </td>
                <td className="pr-10">
                  <ShowMoreText
                    className="whitespace-pre-line"
                    keepNewLines
                    anchorClass="text-primary cursor-pointer block dark:text-secondary"
                  >
                    {summary}
                  </ShowMoreText>
                </td>
                <td className=" align-top	">
                  <div className=" flex items-center flex-nowrap gap-2">
                    {is_thumb_up ? (
                      <ThumbsUp
                        className="size-4 text-meta-3 cursor-pointer thumbs_up"
                        weight="fill"
                      />
                    ) : (
                      <ThumbsUp
                        className="size-4 cursor-pointer thumbs_up"
                        onClick={() =>
                          putComment.mutate({
                            progress_note_id: row.original.progress_note_id,
                            trigger_word: trigger_word,
                            comment: '',
                            is_thumb_up: true,
                          })
                        }
                      />
                    )}
                    {!is_thumb_up && comment !== null ? (
                      <Modal
                        isOpen={showModal}
                        setIsOpen={setShowModal}
                        classNameses={{
                          title: 'text-xl sm:text-2xl',
                        }}
                        title={'What is Going Wrong?'}
                        button={
                          <ThumbsDown
                            className="size-4 cursor-pointer text-meta-1 thumbs_down"
                            weight="fill"
                          />
                        }
                      >
                        <CommentForm
                          comment={{
                            comment: comment || '',
                            trigger_word,
                            progress_note_id: row.original.progress_note_id,
                          }}
                          setIsOpen={setShowModal}
                        />
                      </Modal>
                    ) : (
                      <Modal
                        isOpen={showModal}
                        setIsOpen={setShowModal}
                        classNameses={{
                          title: 'text-xl sm:text-2xl',
                        }}
                        title={'What is Going Wrong?'}
                        button={
                          <ThumbsDown className="size-4 cursor-pointer thumbs_down" />
                        }
                      >
                        <CommentForm
                          comment={{
                            comment: comment || '',
                            trigger_word,
                            progress_note_id: row.original.progress_note_id,
                          }}
                          setIsOpen={setShowModal}
                        />
                      </Modal>
                    )}
                  </div>
                </td>
                <td className="align-top ">
                  {row.original.upstream === 'MTX' ? (
                    event_ids && event_ids.length > 0 ? (
                      event_ids.map((event_id) => (
                        <HyperLink
                          key={event_id}
                          className="action_link"
                          href={`https://clearviewhcm.matrixcare.com/Zion?zionpagealias=EVENTVIEW&NSPID=${row.original.patient_id}&CHGPID=true&EVENTID=${event_id}&dashboardHomePage=true&OEType=Event&PATIENTID=${row.original.patient_id}`}
                        >
                          View the Event
                        </HyperLink>
                      ))
                    ) : trigger_word === 'Fall' ? (
                      <HyperLink
                        className="action_link"
                        tooltip_content={'Create an Event in MatrixCare'}
                        href={`https://clearviewhcm.matrixcare.com/Zion?zionpagealias=EVENTCREATE&PATIENTID=${row.original.patient_id}&formId=944&categoryName=Safety%20Events&formDescription=Post+Fall+Event+v3`}
                      >
                        Create Event
                      </HyperLink>
                    ) : trigger_word === 'Wound/Ulcer' ? (
                      <HyperLink
                        tooltip_content={'Create an Event in MatrixCare'}
                        className="action_link"
                        href={`https://clearviewhcm.matrixcare.com/Zion?zionpagealias=EVENTCREATE&PATIENTID=${row.original.patient_id}&formId=948&categoryName=Skin%20Integrity%20Events&formDescription=Wound+Other+Event`}
                      >
                        Create Event
                      </HyperLink>
                    ) : trigger_word === 'Weight Change' ? (
                      <p>Comming Soon</p>
                    ) : (
                      <HyperLink
                        tooltip_content={'Create an Event in MatrixCare'}
                        className="action_link"
                        href={`https://clearviewhcm.matrixcare.com/Zion?zionpagealias=EVENTCREATE&PATIENTID=${row.original.patient_id}`}
                      >
                        Create Event
                      </HyperLink>
                    )
                  ) : (
                    row.original.upstream === 'PCC' && <p>Comming Soon</p>
                  )}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
      <table className="pb-3 border-stroke border-spacing-y-2.5 border-separate">
        <thead>
          <tr>
            <th className="text-left w-2/12">Progress Note ID</th>
            <th className="text-left w-6/12">Progress Note</th>
            <th className="text-left w-2/12">Created By</th>
            <th className="text-left w-2/12">Created Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="align-top whitespace-nowrap">
              {row.getValue('progress_note_id')}
            </td>
            <td className="pr-10">
              <ShowMoreText
                className="whitespace-pre-line"
                keepNewLines
                anchorClass="text-primary cursor-pointer block dark:text-secondary "
              >
                {row.getValue('progress_note')}
              </ShowMoreText>
            </td>
            <td className="align-top whitespace-nowrap">
              {row.getValue('created_by')}
            </td>
            <td className=" whitespace-nowrap align-top">
              {new Date(row.getValue('created_date')).toLocaleDateString()}{' '}
              {new Date(row.getValue('created_date')).toLocaleTimeString(
                navigator.language,
                {
                  hour: '2-digit',
                  minute: '2-digit',
                },
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
