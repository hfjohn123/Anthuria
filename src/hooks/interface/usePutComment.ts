import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { createToast } from '../fireToast.tsx';

const usePutComment = (route: string, queryClient: any) => {
  const { mutate, ...rest } = useMutation({
    mutationFn: async ({
      progress_note_id,
      trigger_word,
      comment,
      is_thumb_up,
    }: {
      progress_note_id: number;
      trigger_word: string;
      comment: string;
      is_thumb_up: boolean;
    }) => {
      const progress_note_id_str = String(progress_note_id);

      return axios.put(`${route}/trigger_comment`, {
        progress_note_id: progress_note_id_str,
        trigger_word,
        comment,
        is_thumb_up,
      });
    },
    onMutate: async ({
      progress_note_id,
      trigger_word,
      comment,
      is_thumb_up,
    }: {
      progress_note_id: number;
      trigger_word: string;
      comment: string;
      is_thumb_up: boolean;
    }) => {
      await queryClient.cancelQueries({
        queryKey: ['trigger_word_view_trigger_word_detail_final', route],
      });
      const previousData = queryClient.getQueryData([
        'trigger_word_view_trigger_word_detail_final',
        route,
      ]);
      if (previousData) {
        const newData = structuredClone(previousData);
        for (let i = 0; i < newData.length; i++) {
          if (newData[i].progress_note_id === progress_note_id) {
            for (let j = 0; j < newData[i].trigger_words.length; j++) {
              if (newData[i].trigger_words[j].trigger_word === trigger_word) {
                newData[i].trigger_words[j].comment = comment;
                newData[i].trigger_words[j].is_thumb_up = is_thumb_up;
              }
            }
          }
        }
        queryClient.setQueryData(
          ['trigger_word_view_trigger_word_detail_final', route],
          newData,
        );
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
    onError: (error, _variables, context) => {
      createToast(
        'Comment Update Failed',
        error.message,
        3,
        'Comment Update Failed',
      );
      queryClient.setQueryData(
        ['trigger_word_view_trigger_word_detail_final', route],
        context?.previousData,
      );
    },
  });

  return { mutate, ...rest };
};

export default usePutComment;
