import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

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
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['trigger_word_view_trigger_word_detail_final', route],
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['trigger_word_view_trigger_word_detail_final', route],
      });
    },
  });

  return { mutate, ...rest };
};

export default usePutComment;
