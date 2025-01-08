import { useContext, useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { FloatLabel } from 'primereact/floatlabel';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../../../components/AuthWrapper.tsx';

export default function MDSCommentForm({
  comment,
  setIsOpen,
}: {
  comment: string;

  setIsOpen: any;
}) {
  const [commentState, setCommentState] = useState(comment);
  const { route } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const commentMutation = useMutation({
    mutationFn: async ({
      internal_facility_id,
      internal_patient_id,
      category,
      item,
    }: {
      internal_facility_id: string;
      internal_patient_id: string;
      category: string;
      item: string;
    }) => {
      if (!internal_facility_id || !internal_patient_id || !category || !item)
        return;
      return axios.put(`${route}/mds/comment`, {
        internal_facility_id,
        internal_patient_id,
        category,
        item,
        is_thumb_up: 1,
        is_thumb_down: 0,
        comment: '',
      });
    },
    onMutate: () => {
      // setThumbState(true);
    },
    // onSettled: () => {
    //   queryClient.invalidateQueries({
    //     queryKey: [
    //       '/mds/view_pdpm_final_result_test',
    //       route,
    //       internal_patient_id,
    //     ],
    //   });
    // },
  });
  return (
    <form
      className="flex flex-col gap-5 justify-center w-full px-4"
      autoFocus
      onSubmit={(e) => {
        e.preventDefault();
        // e.stopPropagation();
        // putComment.mutate({
        //   progress_note_id: commentState.progress_note_id,
        //   trigger_word: commentState.trigger_word,
        //   comment: commentState.comment,
        //   is_thumb_up: false,
        // });
        setIsOpen(false);
      }}
    >
      <FloatLabel className="mt-7">
        <InputTextarea
          className="w-full border border-stroke rounded-md focus:outline-primary p-2 dark:bg-boxdark dark:border-strokedark dark:outline-secondary"
          value={commentState}
          onChange={(e) => {
            setCommentState(() => e.target.value);
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
