import { Row, TableState } from '@tanstack/react-table';
import { TriggerFinal } from '../../../types/TriggerFinal.ts';
import { useQueryClient } from '@tanstack/react-query';
import usePutComment from '../../../hooks/interface/usePutComment.ts';
import { useContext, useState } from 'react';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import HighlightWrapper from '../../../components/Basic/HighlightWrapper.tsx';
import LineClampShowMore from '../../../common/LineClampShowMore.tsx';
import DataField from './DataField.tsx';
import { ThumbsUp } from '@phosphor-icons/react';
import CommentModal from './CommentModal.tsx';
import highlightGenerator from '../../../common/highlightGenerator.ts';
import clsx from 'clsx';
import MagicButton from '../../../images/icon/MagicButton.tsx';
import { Divider } from 'primereact/divider';

export default function DetailWithProgressNote({
  row,
  tableState,
}: {
  row: Row<TriggerFinal>;
  tableState: TableState;
}) {
  const { route } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const putComment = usePutComment(route, queryClient);
  const explanation = row.original.trigger_words
    .map((t) => t.trigger_word + ': ' + t.summary)
    .join('\n\n');

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-2.5 text-sm  flex gap-5 relative overflow-visible">
      <div
        className="flex flex-col gap-5 basis-1/3 justify-start sticky self-start	"
        style={{ top: 'calc(var(--filter-height, 0px) + 4rem)' }}
      >
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
            {row.original.trigger_words.map((t) => {
              const [isthumbup, setThumbup] = useState(t.is_thumb_up || false);
              const [commentState, setCommentState] = useState(
                t.comment || null,
              );
              return (
                <div
                  key={t.trigger_word}
                  className="border-y border-stroke flex justify-between py-[6px]"
                >
                  {highlightGenerator(t.trigger_word || '', [
                    ...((tableState.columnFilters.find(
                      (f) => f.id === 'trigger_word',
                    )?.value || []) as string[]),
                    tableState.globalFilter,
                  ]).map((segment, index) => (
                    <span
                      key={index}
                      className={clsx(
                        'px-2.5 rounded-lg',
                        segment.isMatch && segment.termIndex !== undefined
                          ? `bg-yellow-200`
                          : 'bg-slate-300',
                      )}
                      title={
                        segment.isMatch ? `Match: ${segment.term}` : undefined
                      }
                    >
                      {segment.text}
                    </span>
                  ))}
                  <div className=" flex items-center flex-nowrap gap-2">
                    {isthumbup ? (
                      <ThumbsUp
                        className="size-5 text-meta-3 cursor-pointer thumbs_up"
                        weight="fill"
                      />
                    ) : (
                      <ThumbsUp
                        className="size-5 cursor-pointer thumbs_up text-body"
                        onClick={() => {
                          setThumbup(true);
                          putComment.mutate({
                            progress_note_id: row.original.progress_note_id,
                            trigger_word: t.trigger_word || '',
                            comment: '',
                            is_thumb_up: true,
                          });
                        }}
                      />
                    )}
                    {!isthumbup && commentState !== null ? (
                      <CommentModal
                        data={{
                          comment: commentState || '',
                          trigger_word: t.trigger_word || '',
                          progress_note_id: row.original.progress_note_id,
                        }}
                        active={true}
                        setThumbUp={setThumbup}
                        setCommentState={setCommentState}
                      />
                    ) : (
                      <CommentModal
                        data={{
                          comment: commentState || '',
                          trigger_word: t.trigger_word || '',
                          progress_note_id: row.original.progress_note_id,
                        }}
                        setThumbUp={setThumbup}
                        setCommentState={setCommentState}
                        active={false}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DataField>
      </div>
      <Divider layout="vertical" />
      <div className="flex flex-col gap-5 basis-2/3">
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
    </div>
  );
}
