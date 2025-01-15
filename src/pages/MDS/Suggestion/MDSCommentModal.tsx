import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { ThumbsDown } from '@phosphor-icons/react';
import { Button } from 'primereact/button';
import clsx from 'clsx';
import { Dialog } from 'primereact/dialog';
import MDSCommentForm from './MDSCommentForm.tsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../../../components/AuthWrapper.tsx';

export default function MDSCommentModal({
  comment,
  is_thumb_down,
  internal_facility_id,
  internal_patient_id,
  category,
  item,
  setThumbDownState,
  setThumbUpState,
}: {
  comment: string;
  is_thumb_down: number;
  internal_facility_id: string;
  internal_patient_id: string;
  category: string;
  item: string;
  setThumbUpState: Dispatch<SetStateAction<number>>;
  setThumbDownState: Dispatch<SetStateAction<number>>;
}) {
  const [showModal, setShowModal] = useState(false);
  const { route } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: async ({
      internal_facility_id,
      internal_patient_id,
      category,
      item,
      comment,
    }: {
      internal_facility_id: string;
      internal_patient_id: string;
      category: string;
      item: string;
      comment: string;
    }) => {
      if (!internal_facility_id || !internal_patient_id || !category || !item)
        return;
      return axios.put(`${route}/mds/comment`, {
        internal_facility_id,
        internal_patient_id,
        category,
        item,
        is_thumb_up: 0,
        is_thumb_down: is_thumb_down ? 1 : 0,
        comment,
      });
    },
    onMutate: async () => {
      setThumbDownState(is_thumb_down === 1 ? 0 : 1);
      console.log('test');
      setThumbUpState(0);

      await queryClient.cancelQueries({
        queryKey: [
          '/mds/view_pdpm_final_result_test',
          route,
          internal_patient_id,
          internal_facility_id,
        ],
      });
      await queryClient.cancelQueries({
        queryKey: ['/mds/view_pdpm_mds_patient_list', route],
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
      queryClient.invalidateQueries({
        queryKey: ['/mds/view_pdpm_mds_patient_list', route],
      });
    },
  });
  if (is_thumb_down) {
    return (
      <Button
        onClick={(event) => {
          event.stopPropagation();
          commentMutation.mutate({
            internal_facility_id,
            internal_patient_id,
            category,
            item,
            comment,
          });
        }}
        className="bg-transparent border-0 p-0 m-0"
      >
        <ThumbsDown
          className={clsx(
            'size-5 cursor-pointer thumbs_down hover:text-red-500 text-red-500',
          )}
          weight="fill"
        />
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={(event) => {
          event.stopPropagation();
          queryClient.cancelQueries({
            queryKey: [
              '/mds/view_pdpm_final_result_test',
              route,
              internal_patient_id,
              internal_facility_id,
            ],
          });
          queryClient.cancelQueries({
            queryKey: ['/mds/view_pdpm_mds_patient_list', route],
          });

          setShowModal(true);
        }}
        className="bg-transparent border-0 p-0 m-0"
      >
        <ThumbsDown
          className={clsx(
            'size-5 cursor-pointer thumbs_down hover:text-red-500',
            'text-body dark:text-bodydark',
          )}
          weight={'regular'}
        />
      </Button>
      <Dialog
        header="What was inaccurate about this suggestion?"
        visible={showModal}
        dismissableMask
        resizable
        className="w-[60rem] overflow-hidden"
        onHide={() => {
          if (!showModal) return;
          setShowModal(false);
        }}
        maximizable
      >
        <div>
          <p className="italic">Please help correct this PDPM suggestion.</p>
          <MDSCommentForm
            comment={comment}
            setIsOpen={setShowModal}
            internal_facility_id={internal_facility_id}
            internal_patient_id={internal_patient_id}
            category={category}
            item={item}
            // thumbDownState={thumbDownState}
            // setThumbDownState={setThumbDownState}
            commentMutation={commentMutation}
          />
        </div>
      </Dialog>
    </>
  );
}
