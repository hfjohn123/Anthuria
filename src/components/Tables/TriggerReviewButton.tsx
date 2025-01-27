import { Row, TableState } from '@tanstack/react-table';
import { TriggerFinal } from '../../types/TriggerFinal.ts';
import { useContext, useState } from 'react';
import highlightGenerator from '../../common/highlightGenerator.ts';
import clsx from 'clsx';
import { ThumbsUp } from '@phosphor-icons/react';
import CommentModal from '../../pages/TriggerWords/ReviewTriggers/CommentModal.tsx';
import usePutComment from '../../hooks/interface/usePutComment.ts';
import { AuthContext } from '../AuthWrapper.tsx';
import { useQueryClient } from '@tanstack/react-query';

export default function TriggerReviewButton({
  t,
  tableState,
  row,
}: {
  row: Row<TriggerFinal>;
  t: {
    trigger_word: string | null;
    summary: string;
    is_thumb_up?: boolean;
    update_time: Date;
    comment?: string;
    event_ids: number[];
  };
  tableState: TableState;
}) {
  const { route } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const putComment = usePutComment(route, queryClient);
  const [isthumbup, setThumbup] = useState(t.is_thumb_up || false);
  const [commentState, setCommentState] = useState(t.comment || null);
  return (
    <div
      key={t.trigger_word}
      className="border-y border-stroke flex justify-between py-[6px]"
    >
      {highlightGenerator(t.trigger_word || '', [
        ...((tableState.columnFilters.find((f) => f.id === 'trigger_word')
          ?.value || []) as string[]),
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
          title={segment.isMatch ? `Match: ${segment.term}` : undefined}
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
}
