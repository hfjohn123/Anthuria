import Modal from './Modal.tsx';
import { Trash } from 'lucide-react';
import { Button } from '@headlessui/react';
import { memo, useContext, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { createToast } from '../../hooks/fireToast.tsx';
import { AuthContext } from '../AuthWrapper.tsx';

const DeleteUserModal = memo(function DeleteUserModal({ member }: any) {
  const { route } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [deleteModal, setDeleteModal] = useState(false);
  const deleteUser = useMutation({
    mutationFn: (email: string) => {
      return axios.delete(`${route}/delete_orgnization_user`, {
        data: { email },
      });
    },
    onMutate: (email: string) => {
      queryClient.cancelQueries({
        queryKey: ['access_management', route],
      });

      const previousData: { members: any[] } | undefined =
        queryClient.getQueryData(['access_management', route]);
      if (previousData) {
        const newData = structuredClone(previousData);
        newData.members = newData.members.filter((d: any) => d.email !== email);
        queryClient.setQueryData(['access_management', route], newData);
      }
      return { previousData };
    },
    onError: (err: AxiosError) => {
      if (err.response?.data) {
        createToast(
          'Delete Failed',
          (err.response.data as { detail: string }).detail,
          3,
          'Delete Failed',
        );
      } else {
        createToast(
          'Delete Failed',
          'Something went wrong',
          3,
          'Delete Failed',
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['access_management', route],
      });
    },
  });

  return (
    <Modal
      isOpen={deleteModal}
      setIsOpen={setDeleteModal}
      button={<Trash />}
      title={`Delete ${member.name}- ${member.email} ?`}
    >
      <div className=" flex justify-end gap-5">
        <Button
          className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
          onClick={() => {
            setDeleteModal(false);
          }}
        >
          Cancel
        </Button>
        <Button
          className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
          onClick={() => {
            deleteUser.mutate(member.email);
            setDeleteModal(false);
          }}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
});
export default DeleteUserModal;
