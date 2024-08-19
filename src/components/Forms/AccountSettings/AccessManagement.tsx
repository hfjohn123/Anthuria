import { Button, Field, Input, Label } from '@headlessui/react';
import UserName from '../../../images/icon/UserName.tsx';
import EmailIcon from '../../../images/icon/EmailIcon.tsx';
import Modal from '../../Modal/Modal.tsx';
import { useContext, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { createToast } from '../../../hooks/fireToast.tsx';
import { AuthContext } from '../../AuthWrapper.tsx';
import ErrorPage from '../../../common/ErrorPage.tsx';
import Loader from '../../../common/Loader';
import AccessManagementModal from '../../Modal/AcessManagementModal.tsx';
import DeleteUserModal from '../../Modal/DeleteUserModal.tsx';

export default function AccessManagement({ queryClient }: any) {
  const { user_data, route } = useContext(AuthContext);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteModalData, setInviteModalData] = useState<{
    email: string;
    name: string;
  }>({
    email: '',
    name: '',
  });

  const { isPending, isError, data, error }: any = useQuery({
    queryKey: ['access_management', route],
    queryFn: () =>
      axios.get(`${route}/access_management`).then((res) => res.data),
  });

  const allApplications =
    data &&
    data.all_applications.map((d: any) => ({
      value: d.id,
      label: d.display_name,
    }));

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
  if (isPending) {
    return <Loader />;
  }
  if (isError) {
    return <ErrorPage error={error.message} />;
  }
  return (
    <div className="col-span-5">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-7 dark:border-strokedar flex justify-between items-center">
          <h3 className="font-medium text-black dark:text-white">
            Access Management
          </h3>

          <p className="text-sm">
            {data.organization.seats === 0
              ? 'Unlimited seats'
              : `${data.members.length} / ${data.organization.seats} seats allocated`}
          </p>
        </div>
        <div className="px-7 lg:pt-7 pb-7">
          <div className="grid grid-cols-5 lg:grid-cols-12 w-full gap-x-10 ">
            <label className="col-span-3  text-sm font-medium text-black dark:text-white hidden lg:block">
              Full Name
            </label>
            <label className="col-span-7  text-sm font-medium text-black dark:text-white hidden lg:block">
              Email
            </label>
            <label className="col-span-2  text-sm font-medium text-black dark:text-white hidden lg:block">
              Action
            </label>
            {data.members.map((member: any) => (
              <div
                key={member.email}
                className="col-span-full grid grid-cols-5 lg:grid-cols-12 gap-x-10"
              >
                <Field className="mt-3 col-span-full w-full lg:col-span-3 relative">
                  <UserName className="absolute left-4.5 lg:top-3.5 top-9" />
                  <Label className="text-xs lg:hidden">Full Name</Label>
                  <Input
                    className="rounded w-full border border-stroke bg-gray py-3 pl-11.5  text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    disabled
                    name="fullName"
                    id="fullName"
                    value={member.name}
                  />
                </Field>
                <Field className="mt-3 col-span-full lg:col-span-7 relative ">
                  <EmailIcon className="absolute left-4.5 lg:top-3.5 top-9" />
                  <Label className="text-xs lg:hidden">Email Address</Label>
                  <Input
                    className="w-full rounded border border-stroke bg-gray py-3 pl-11.5  text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="email"
                    name="emailAddress"
                    id="emailAddress"
                    disabled
                    value={member.email}
                  />
                </Field>
                <Field className="mt-3 col-span-full lg:col-span-2 flex items-center gap-1">
                  <p className="text-xs lg:hidden">Actions</p>
                  <AccessManagementModal
                    allApplications={allApplications}
                    member={member}
                  />
                  {member.email !== user_data.email && (
                    <DeleteUserModal member={member} />
                  )}
                </Field>
                <hr className=" border-1 border-stroke lg:hidden block basis-full last:hidden" />{' '}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4.5 mt-7">
            {(data.organization.seats === 0 ||
              data.members.length < data.organization.seats) && (
              <Modal
                isOpen={inviteModal}
                setIsOpen={setInviteModal}
                title="Invite A New User"
                classNameses={{
                  button:
                    'flex whitespace-nowrap justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white',
                }}
                button={<p>Invite A New User</p>}
                onOpenCallback={() =>
                  setInviteModalData({ email: '', name: '' })
                }
              >
                <form
                  className="flex flex-col gap-3 w-100"
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
                    <Button
                      className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                    >
                      Send
                    </Button>
                  </div>
                </form>
              </Modal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
