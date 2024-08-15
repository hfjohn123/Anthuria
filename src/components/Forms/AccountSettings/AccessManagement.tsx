import {
  Button,
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Field,
  Input,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import UserName from '../../../images/icon/UserName.tsx';
import EmailIcon from '../../../images/icon/EmailIcon.tsx';
import Modal from '../../Modal/Modal.tsx';
import { ChevronDownIcon, PenSquare, Trash } from 'lucide-react';
import clsx from 'clsx';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { createToast } from '../../../hooks/fireToast.tsx';
import { AuthContext } from '../../AuthWrapper.tsx';
import ErrorPage from '../../../common/ErrorPage.tsx';
import Loader from '../../../common/Loader';

export default function AccessManagement({ queryClient }: any) {
  const { user_data, route, user_applications_locations } =
    useContext(AuthContext);
  const [editModal, setEditModal] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteModalData, setInviteModalData] = useState<{
    email: string;
    name: string;
  }>({
    email: '',
    name: '',
  });
  const [query, setQuery] = useState('');
  const [editModalData, setEditModalData] = useState<{
    name: string;
    email: string;
    phone: string;
    applications: any[];
  }>({
    name: '',
    email: '',
    phone: '',
    applications: [],
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
  const allLocations = user_applications_locations.find(
    (d: any) => d['id'] === 'access_management',
  )?.locations;
  const filteredLocations =
    query === ''
      ? [{ internal_facility_id: '*', facility_name: 'All Facilities' }].concat(
          allLocations || [],
        )
      : allLocations?.filter((location) => {
          return location.facility_name
            .toLowerCase()
            .includes(query.toLowerCase());
        });
  const [applicationOptions, setApplicationOptions] = useState<
    { label: string; value: string }[]
  >([]);
  useEffect(() => {
    if (!allApplications) return;
    setApplicationOptions(
      allApplications.filter(
        (app: any) =>
          !editModalData.applications.some(
            (appID: any) => app.value === appID.id,
          ),
      ),
    );
  }, [editModalData.applications]);

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
        previousData.members = previousData.members.filter(
          (d: any) => d.email !== email,
        );
        queryClient.setQueryData(['access_management', route], previousData);
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
  const updateUserAccess = useMutation({
    mutationFn: (data: any) => {
      return axios.post(`${route}/update_user_access`, data);
    },
    onError: (err: AxiosError) => {
      createToast('Update Failed', err.message, 3, 'Update Failed');
    },
    onSettled: () => {
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
                    name="fullName"
                    id="fullName"
                    disabled
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
                  {member.email !== user_data.email && (
                    <>
                      <p className="text-xs lg:hidden">Actions</p>
                      <Modal
                        isOpen={editModal}
                        setIsOpen={setEditModal}
                        title={'Member Information'}
                        button={<PenSquare />}
                        onOpenCallback={() => {
                          setEditModalData({
                            ...member,
                            phone: member.phone || '',
                          });
                        }}
                      >
                        <form
                          className="sm:w-150 w-screen"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const data = {
                              ...editModalData,
                              applications: editModalData.applications
                                .filter(
                                  (item: any) =>
                                    item.id !== 'access_management' &&
                                    typeof item.id === 'string',
                                )
                                .flatMap((item) => {
                                  return item.locations.map(
                                    (location: any) => ({
                                      id: item.id,
                                      location: location.internal_facility_id,
                                    }),
                                  );
                                }),
                            };
                            // console.log(data);
                            updateUserAccess.mutate(data);
                          }}
                        >
                          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                            <Field className="relative w-full sm:w-1/2">
                              <Label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Full Name
                              </Label>
                              <UserName className="absolute left-4.5 top-11.5" />
                              <Input
                                className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                type="text"
                                value={editModalData.name}
                                onChange={(e) => {
                                  setEditModalData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }));
                                }}
                              />
                            </Field>
                            <Field className="w-full sm:w-1/2">
                              <Label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Phone Number
                              </Label>
                              <Input
                                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                type="tel"
                                onChange={(e) => {
                                  setEditModalData((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                  }));
                                }}
                                value={editModalData.phone}
                              />
                            </Field>
                          </div>
                          <Field className="relative mb-5.5">
                            <Label className="mb-3 block text-sm font-medium text-black dark:text-white">
                              Email Address
                            </Label>
                            <EmailIcon className="absolute left-4.5 top-11.5" />
                            <div className="flex items-center flex-wrap">
                              <Input
                                className="basis-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary disabled:text-slate-400"
                                type="email"
                                disabled
                                value={editModalData.email}
                              />
                            </div>
                          </Field>
                          <div className="grid grid-cols-9 gap-4">
                            <p className="col-span-4">Applications</p>
                            <p className="col-span-4">Facilities</p>

                            {editModalData.applications
                              ?.filter(
                                (app: any) => app.id !== 'access_management',
                              )
                              .map((application: any) => {
                                return (
                                  <>
                                    <Field className="col-span-4">
                                      <Listbox
                                        value={application.id}
                                        onChange={(value) => {
                                          const newApplications =
                                            editModalData.applications.map(
                                              (app: any) => {
                                                if (app.id === application.id) {
                                                  return {
                                                    ...app,
                                                    id: value,
                                                  };
                                                }
                                                return app;
                                              },
                                            );
                                          setEditModalData((prev) => ({
                                            ...prev,
                                            applications: newApplications,
                                          }));
                                        }}
                                      >
                                        <ListboxButton
                                          className={clsx(
                                            'group relative block w-full rounded bg-slate-100 py-3 pr-8 pl-3 text-left border border-stroke ',
                                            'focus:border-primary has-[:focus]:border-primary focus:outline-none ',
                                          )}
                                        >
                                          <p className="text-nowrap overflow-x-hidden">
                                            {allApplications.find(
                                              (app: any) =>
                                                app.value === application.id,
                                            )?.label || 'Select Application'}
                                          </p>
                                          <ChevronDownIcon
                                            className="pointer-events-none absolute top-4 right-2.5 size-5"
                                            aria-hidden="true"
                                          />
                                        </ListboxButton>
                                        <ListboxOptions
                                          className={clsx(
                                            'w-[var(--button-width)] rounded border border-stroke [--anchor-gap:var(--spacing-1)] focus:outline-none absolute bg-white overflow-y-auto z-9 max-h-50',
                                          )}
                                        >
                                          {applicationOptions.map(
                                            (option: any) => (
                                              <ListboxOption
                                                key={option.value}
                                                value={option.value}
                                                className=" flex cursor-default items-center gap-2 rounded py-1 px-3 select-none data-[focus]:bg-secondary"
                                              >
                                                {option.label}
                                              </ListboxOption>
                                            ),
                                          )}
                                        </ListboxOptions>
                                      </Listbox>
                                    </Field>
                                    <Field className="col-span-4">
                                      <Combobox
                                        value={application.locations.map(
                                          (loc: any) =>
                                            loc.internal_facility_id,
                                        )}
                                        multiple={true}
                                        onChange={(value) => {
                                          setEditModalData((prev) => ({
                                            ...prev,
                                            applications: prev.applications.map(
                                              (app) => {
                                                if (app.id === application.id) {
                                                  return {
                                                    ...app,
                                                    locations:
                                                      allLocations?.filter(
                                                        (loc) =>
                                                          value.includes(
                                                            loc.internal_facility_id,
                                                          ),
                                                      ) || [],
                                                  };
                                                }
                                                return app;
                                              },
                                            ),
                                          }));
                                        }}
                                      >
                                        <ComboboxButton
                                          className={clsx(
                                            'relative flex flex-nowrap w-full rounded bg-slate-100 py-3 pr-8 pl-3 text-left border border-stroke ',
                                            'focus:border-primary  has-[:focus]:border-primary ',
                                          )}
                                        >
                                          <span className="text-nowrap    ">
                                            {application.locations.length}{' '}
                                            Facilities
                                          </span>
                                          <ComboboxInput
                                            onChange={(e) =>
                                              setQuery(e.target.value)
                                            }
                                            onBlur={() => setQuery('')}
                                            className="bg-transparent w-full peer pl-2 outline-none "
                                          />
                                          <ChevronDownIcon
                                            className="group pointer-events-none absolute top-4 right-2.5 size-5"
                                            aria-hidden="true"
                                          />
                                        </ComboboxButton>
                                        <ComboboxOptions
                                          className={clsx(
                                            'w-[var(--button-width)] rounded border border-stroke [--anchor-gap:var(--spacing-1)] focus:outline-none absolute bg-white overflow-y-auto z-9 max-h-50',
                                          )}
                                        >
                                          {filteredLocations?.map(
                                            (location) => {
                                              if (
                                                location.internal_facility_id ===
                                                '*'
                                              ) {
                                                return (
                                                  <div
                                                    key={'*'}
                                                    className="w-full flex top-0 bg-white sticky justify-between items-center gap-2 rounded py-1 px-3 select-none"
                                                  >
                                                    <Button
                                                      onClick={() => {
                                                        setEditModalData(
                                                          (prev) => ({
                                                            ...prev,
                                                            applications:
                                                              prev.applications.map(
                                                                (app) => {
                                                                  if (
                                                                    app.id ===
                                                                    application.id
                                                                  ) {
                                                                    return {
                                                                      ...app,
                                                                      locations:
                                                                        allLocations ||
                                                                        [],
                                                                    };
                                                                  }
                                                                  return app;
                                                                },
                                                              ),
                                                          }),
                                                        );
                                                      }}
                                                    >
                                                      All Facilities
                                                    </Button>
                                                    <Button
                                                      onClick={() => {
                                                        setEditModalData(
                                                          (prev) => ({
                                                            ...prev,
                                                            applications:
                                                              prev.applications.map(
                                                                (app) => {
                                                                  if (
                                                                    app.id ===
                                                                    application.id
                                                                  ) {
                                                                    return {
                                                                      ...app,
                                                                      locations:
                                                                        [],
                                                                    };
                                                                  }
                                                                  return app;
                                                                },
                                                              ),
                                                          }),
                                                        );
                                                      }}
                                                    >
                                                      Clear
                                                    </Button>
                                                  </div>
                                                );
                                              } else {
                                                return (
                                                  <ComboboxOption
                                                    key={
                                                      location.internal_facility_id
                                                    }
                                                    value={
                                                      location.internal_facility_id
                                                    }
                                                    className=" flex cursor-default items-center gap-2 rounded py-1 px-3 select-none data-[focus]:bg-secondary data-[selected]:bg-slate-200"
                                                  >
                                                    {location.facility_name}
                                                  </ComboboxOption>
                                                );
                                              }
                                            },
                                          )}
                                        </ComboboxOptions>
                                      </Combobox>
                                    </Field>
                                    <Button
                                      onClick={() => {
                                        setEditModalData((prev) => ({
                                          ...prev,
                                          applications:
                                            prev.applications.filter(
                                              (app) =>
                                                app.id !== application.id,
                                            ),
                                        }));
                                      }}
                                    >
                                      <Trash />
                                    </Button>
                                  </>
                                );
                              })}
                          </div>
                          <div className="flex justify-end gap-4.5 mt-7">
                            {editModalData.applications?.filter(
                              (app: any) => app.id !== 'access_management',
                            ).length < allApplications.length && (
                              <Button
                                className="flex mr-auto justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                                type="reset"
                                onClick={() => {
                                  setEditModalData((prevState) => ({
                                    ...prevState,
                                    applications: [
                                      ...prevState.applications,
                                      {
                                        id: prevState.applications.length,
                                        display_name: '',
                                        locations: [],
                                      },
                                    ],
                                  }));
                                }}
                              >
                                Add an application
                              </Button>
                            )}
                            <Button
                              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                              type="reset"
                              onClick={() => setEditModal(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                              type="submit"
                            >
                              Save
                            </Button>
                          </div>
                        </form>
                      </Modal>
                      <Button onClick={() => deleteUser.mutate(member.email)}>
                        <Trash />
                      </Button>
                    </>
                  )}
                </Field>
                <hr className=" border-1 border-stroke lg:hidden block basis-full last:hidden" />{' '}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4.5 mt-7">
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
                className="flex flex-col gap-3 w-100"
                onSubmit={(event) => {
                  event.preventDefault();
                  inviteUser.mutate(inviteModalData);
                  setInviteModalData({ email: '', name: '' });
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
          </div>
        </div>
      </div>
    </div>
  );
}
