import { Field, Label, Textarea } from '@headlessui/react';
import { useContext } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../AuthWrapper.tsx';
import { createToast } from '../../hooks/fireToast.tsx';

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
  const putComment = useMutation({
    mutationFn: async ({
      progress_note_id,
      trigger_word,
      comment,
    }: {
      progress_note_id: number;
      trigger_word: string;
      comment: string;
    }) => {
      const progress_note_id_str = String(progress_note_id);
      return axios.put(`${route}/trigger_comment`, {
        progress_note_id: progress_note_id_str,
        trigger_word,
        comment,
      });
    },
    onMutate: async ({
      progress_note_id,
      trigger_word,
      comment,
    }: {
      progress_note_id: number;
      trigger_word: string;
      comment: string;
    }) => {
      await queryClient.cancelQueries({ queryKey: ['trigger-words', route] });
      const previousData = queryClient.getQueryData<any[]>([
        'trigger-words',
        route,
      ]);
      if (previousData) {
        const newData = structuredClone(previousData);
        for (let i = 0; i < newData.length; i++) {
          if (newData[i].progress_note_id === progress_note_id) {
            for (let j = 0; j < newData[i].trigger_words.length; j++) {
              if (newData[i].trigger_words[j].trigger_word === trigger_word) {
                newData[i].trigger_words[j].comment = comment;
              }
            }
          }
        }
        queryClient.setQueryData(['trigger-words', route], newData);
      }
      return { previousData };
    },
    onSuccess: () => {
      createToast(
        'Comment Successfully Updated',
        'Thanks for your feedback!',
        0,
        'Comment Updated',
      );
    },
    onError: (err: any) => {
      createToast(
        'Comment Update Failed',
        err.message,
        3,
        'Comment Update Failed',
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trigger-words', route] });
    },
  });
  return (
    <form
      className="flex flex-col gap-5 justify-center w-full sm:w-100"
      autoFocus
      onSubmit={(e) => {
        e.preventDefault();
        // e.stopPropagation();
        // putComment(row.id, trigger_word, );
        putComment.mutate({
          progress_note_id: commentState.progress_note_id,
          trigger_word: commentState.trigger_word,
          comment: commentState.comment,
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
