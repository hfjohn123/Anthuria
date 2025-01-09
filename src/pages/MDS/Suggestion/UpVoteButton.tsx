import { Button } from 'primereact/button';
import { ThumbsUp } from '@phosphor-icons/react';
import clsx from 'clsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import { useContext, useState } from 'react';

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
  const [thumbUpState, setThumbState] = useState(is_thumb_up);
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
        is_thumb_up: thumbUpState ? 1 : 0,
        is_thumb_down: 0,
        comment: '',
      });
    },
    onMutate: async () => {
      setThumbState(!thumbUpState);

      await queryClient.cancelQueries({
        queryKey: [
          '/mds/view_pdpm_final_result_test',
          route,
          internal_patient_id,
          internal_facility_id,
        ],
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [
          '/mds/view_pdpm_final_result_test',
          route,
          internal_patient_id,
          internal_facility_id,
        ],
      });
    },
  });
  return (
    <Button
      className="bg-transparent border-0 p-0 m-0"
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
          thumbUpState ? 'text-blue-500' : 'text-body dark:text-bodydark',
        )}
        weight={thumbUpState ? 'fill' : 'regular'}
      />
    </Button>
  );
}
