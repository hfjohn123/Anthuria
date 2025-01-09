import { Button } from 'primereact/button';
import { ThumbsUp } from '@phosphor-icons/react';
import clsx from 'clsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import { useContext } from 'react';

export default function UpVoteButton({
  is_thumb_up,
  internal_facility_id,
  internal_patient_id,
  category,
  item,
}: {
  is_thumb_up: boolean;
  internal_facility_id: string;
  internal_patient_id: string;
  category: string;
  item: string;
}) {
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
        is_thumb_up: is_thumb_up ? 0 : 1,
        is_thumb_down: 0,
        comment: '',
      });
    },
    onSettled: async (data) => {
      await queryClient.cancelQueries({
        queryKey: [
          '/mds/view_pdpm_final_result_test',
          route,
          internal_patient_id,
          internal_facility_id,
        ],
      });
      queryClient.setQueryData(
        [
          '/mds/view_pdpm_final_result_test',
          route,
          internal_patient_id,
          internal_facility_id,
        ],
        data?.data,
      );
    },
  });
  return (
    <Button
      className={clsx(
        'bg-transparent border-0 p-0 m-0',
        commentMutation.isPending && 'p-disabled cursor-wait',
      )}
      disabled={commentMutation.isPending}
      onClick={() => {
        commentMutation.mutate({
          internal_facility_id,
          internal_patient_id,
          category,
          item,
        });
      }}
    >
      <ThumbsUp
        className={clsx(
          'size-5 cursor-pointer thumbs_up hover:text-blue-500',
          is_thumb_up || commentMutation.isPending
            ? 'text-blue-500'
            : 'text-body dark:text-bodydark',
        )}
        weight={is_thumb_up || commentMutation.isPending ? 'fill' : 'regular'}
      />
    </Button>
  );
}
