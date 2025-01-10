import { useContext, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../AuthWrapper.tsx';
import usePutComment from '../../hooks/interface/usePutComment.ts';
import { InputTextarea } from 'primereact/inputtextarea';
import { FloatLabel } from 'primereact/floatlabel';

export default function CommentForm({
  comment,
  setIsOpen,
  setThumbUp,
  setCommentState,
}: {
  comment: {
    progress_note_id: number;
    trigger_word: string;
    comment: string;
  };
  setIsOpen: any;
  setThumbUp: any;
  setCommentState: any;
}) {
  const { route } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [commentTemp, setCommentTemp] = useState(comment.comment);
  const putComment = usePutComment(route, queryClient);
  return (
    <form
      className="flex flex-col gap-5 justify-center w-full px-4"
      autoFocus
      onSubmit={(e) => {
        e.preventDefault();
        // e.stopPropagation();
        // putComment(row.id, trigger_word, );
        putComment.mutate({
          progress_note_id: comment.progress_note_id,
          trigger_word: comment.trigger_word,
          comment: commentTemp,
          is_thumb_up: false,
        });
        setThumbUp(false);
        setIsOpen(false);
        setCommentState(commentTemp);
      }}
    >
      <FloatLabel className="mt-7">
        <InputTextarea
          className="w-full border border-stroke rounded-md focus:outline-primary p-2 dark:bg-boxdark dark:border-strokedark dark:outline-secondary"
          value={commentTemp}
          onChange={(e) => {
            setCommentTemp(e.target.value);
          }}
          autoResize
          rows={5}
          placeholder="Please Enter Your Comment Here"
        />
        <label>Comment</label>
      </FloatLabel>
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
