import { Field, Label, Textarea } from '@headlessui/react';
import { useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../AuthWrapper.tsx';
import usePutComment from '../../hooks/interface/usePutComment.ts';

export default function CommentForm({
  commentState,
  setIsOpen,
  setCommentState,
}: {
  commentState: {
    progress_note_id: number;
    trigger_word: string;
    comment: string;
  };
  setIsOpen: any;
  setCommentState: any;
}) {
  const { route } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const putComment = usePutComment(route, queryClient);
  return (
    <form
      className="flex flex-col gap-5 justify-center w-full sm:w-[480px]"
      autoFocus
      onSubmit={(e) => {
        e.preventDefault();
        // e.stopPropagation();
        // putComment(row.id, trigger_word, );
        putComment.mutate({
          progress_note_id: commentState.progress_note_id,
          trigger_word: commentState.trigger_word,
          comment: commentState.comment,
          is_thumb_up: false,
        });
        setIsOpen(false);
      }}
    >
      <Field>
        <Label className="mb-1">Comment</Label>
        <Textarea
          className="w-full border border-stroke rounded-md focus:outline-primary p-2 dark:bg-boxdark dark:border-strokedark dark:outline-secondary"
          value={commentState.comment}
          onChange={(e) => {
            setCommentState((prev: any) => ({
              ...prev,
              comment: e.target.value,
            }));
          }}
          placeholder="Please Enter Your Comment Here"
        />
      </Field>
      <div className="flex gap-4 justify-end">
        <button
          type="reset"
          className="dark:text-bodydark1"
          onClick={() => {
            setIsOpen(false);
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-primary text-white dark:text-bodydark1 rounded p-2 dark:bg-secondary"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
