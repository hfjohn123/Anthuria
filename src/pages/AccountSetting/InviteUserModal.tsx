import Modal from '../../components/Modal/Modal.tsx';
import { Button, Field, Input, Label } from '@headlessui/react';
import EmailIcon from '../../images/icon/EmailIcon.tsx';
import UserName from '../../images/icon/UserName.tsx';
import { useContext, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { createToast } from '../../hooks/fireToast.tsx';
import { AuthContext } from '../../components/AuthWrapper.tsx';
import PrimaryButton from '../../components/Basic/PrimaryButton.tsx';

export default function InviteUserModal() {
  const { route } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteModalData, setInviteModalData] = useState<{
    email: string;
    name: string;
  }>({
    email: '',
    name: '',
  });

  const inviteUser = useMutation({
    mutationFn: ({ email, name }: { email: string; name: string }) => {
      return axios.post(`${route}/create_user`, { email, name });
    },
    onError: (err: AxiosError) => {
      if (err.response?.data) {
        createToast(
          'Invite Failed',
          (err.response.data as { detail: string }).detail,
          3,
          'Invite Failed',
        );
      } else {
        createToast(
          'Invite Failed',
          'Something went wrong',
          3,
          'Invite Failed',
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['access_management', route],
      });
    },
  });

  return (
    <Modal
      isOpen={inviteModal}
      setIsOpen={setInviteModal}
      title="Invite A New User"
      classNameses={{
        button:
          'flex whitespace-nowrap justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white',
      }}
      button={<p>Invite A New User</p>}
      onOpenCallback={() => setInviteModalData({ email: '', name: '' })}
    >
      <form
        className="flex flex-col gap-3 w-100 px-4"
        onSubmit={(event) => {
          event.preventDefault();
          inviteUser.mutate(inviteModalData);
          setInviteModal(false);
        }}
      >
        <Field className="relative">
          <Label className="mb-1 block text-sm font-medium text-black dark:text-white">
            Email
          </Label>
          <EmailIcon className="absolute left-3.5 top-9.5" />
          <Input
            type="email"
            required
            className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
            placeholder="Email"
            value={inviteModalData.email}
            onChange={(e) => {
              setInviteModalData((prev) => ({
                ...prev,
                email: e.target.value,
              }));
            }}
          />
        </Field>
        <Field className="relative">
          <Label className="mb-1 block text-sm font-medium text-black dark:text-white">
            Full Name
          </Label>
          <UserName className="absolute left-3.5 top-9.5" />
          <Input
            className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
            placeholder="Full Name"
            required
            value={inviteModalData.name}
            onChange={(e) => {
              setInviteModalData((prev) => ({
                ...prev,
                name: e.target.value,
              }));
            }}
          />
        </Field>
        <div className="flex justify-end gap-4.5 mt-3">
          <Button
            className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            type="reset"
            onClick={() => {
              setInviteModalData({ email: '', name: '' });
              setInviteModal(false);
            }}
          >
            Cancel
          </Button>
          <PrimaryButton className="py-2 px-6 font-medium" type="submit">
            Send
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
