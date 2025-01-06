import Modal from '../../components/Modal/Modal.tsx';
import { ChevronDownIcon, PenSquare, Trash } from 'lucide-react';
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
import UserName from '../../images/icon/UserName.tsx';
import EmailIcon from '../../images/icon/EmailIcon.tsx';
import clsx from 'clsx';
import { useEffect, useState, useContext, memo } from 'react';
import { AuthContext } from '../../components/AuthWrapper.tsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { createToast } from '../../hooks/fireToast.tsx';
import PrimaryButton from '../../components/Basic/PrimaryButton.tsx';

const AccessManagementModal = memo(function AccessManagementModal({
  allApplications,
  member,
}: any) {
  const { user_applications_locations, route } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [editModal, setEditModal] = useState(false);
  const [applicationOptions, setApplicationOptions] = useState<
    { label: string; value: string }[]
  >([]);
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
  const [query, setQuery] = useState('');

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

  const updateUserAccess = useMutation({
    mutationFn: (data: any) => {
      return axios.post(`${route}/update_user_access`, data);
    },
    onError: (err: AxiosError) => {
      createToast('Update Failed', err.message, 3, 'Update Failed');
    },
    onSuccess: () => {
      createToast(
        'Update Successful',
        'Update Successful',
        0,
        'Update Successful',
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['access_management', route],
      });
    },
  });

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

  return (
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
        className="sm:w-150 w-screen px-4"
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
                return item.locations.map((location: any) => ({
                  id: item.id,
                  location: location.internal_facility_id,
                }));
              }),
          };
          // console.log(data);
          updateUserAccess.mutate(data);
          setEditModal(false);
        }}
      >
        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row ">
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
              className="basis-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="email"
              disabled
              value={editModalData.email}
            />
          </div>
        </Field>
        <div className="grid grid-cols-9 gap-4">
          <Label className="col-span-4 block text-sm font-medium text-black dark:text-white">
            Applications
          </Label>
          <Label className="col-span-4 block text-sm font-medium text-black dark:text-white">
            Facilities
          </Label>

          {editModalData.applications
            ?.filter((app: any) => app.id !== 'access_management')
            .map((application: any) => {
              return (
                <div
                  key={application.id}
                  className="grid col-span-9 grid-cols-9 gap-4"
                >
                  <Field className="col-span-4">
                    <Listbox
                      value={application.id}
                      onChange={(value) => {
                        const newApplications = editModalData.applications.map(
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
                            (app: any) => app.value === application.id,
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
                        {applicationOptions.map((option: any) => (
                          <ListboxOption
                            key={option.value}
                            value={option.value}
                            className=" flex cursor-default items-center gap-2 rounded py-1 px-3 select-none data-[focus]:bg-secondary"
                          >
                            {option.label}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </Listbox>
                  </Field>
                  <Field className="col-span-4">
                    <Combobox
                      value={application.locations.map(
                        (loc: any) => loc.internal_facility_id,
                      )}
                      multiple={true}
                      onChange={(value) => {
                        setEditModalData((prev) => ({
                          ...prev,
                          applications: prev.applications.map((app) => {
                            if (app.id === application.id) {
                              return {
                                ...app,
                                locations:
                                  allLocations?.filter((loc) =>
                                    value.includes(loc.internal_facility_id),
                                  ) || [],
                              };
                            }
                            return app;
                          }),
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
                          {application.locations.length} Facilities
                        </span>
                        <ComboboxInput
                          onChange={(e) => setQuery(e.target.value)}
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
                        {filteredLocations?.map((location) => {
                          if (location.internal_facility_id === '*') {
                            return (
                              <div
                                key={'*'}
                                className="w-full flex top-0 bg-white sticky justify-between items-center gap-2 rounded py-1 px-3 select-none"
                              >
                                <Button
                                  onClick={() => {
                                    setEditModalData((prev) => ({
                                      ...prev,
                                      applications: prev.applications.map(
                                        (app) => {
                                          if (app.id === application.id) {
                                            return {
                                              ...app,
                                              locations: allLocations || [],
                                            };
                                          }
                                          return app;
                                        },
                                      ),
                                    }));
                                  }}
                                >
                                  All Facilities
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditModalData((prev) => ({
                                      ...prev,
                                      applications: prev.applications.map(
                                        (app) => {
                                          if (app.id === application.id) {
                                            return {
                                              ...app,
                                              locations: [],
                                            };
                                          }
                                          return app;
                                        },
                                      ),
                                    }));
                                  }}
                                >
                                  Clear
                                </Button>
                              </div>
                            );
                          } else {
                            return (
                              <ComboboxOption
                                key={location.internal_facility_id}
                                value={location.internal_facility_id}
                                className=" flex cursor-default items-center gap-2 rounded py-1 px-3 select-none data-[focus]:bg-secondary data-[selected]:bg-slate-200"
                              >
                                {location.facility_name}
                              </ComboboxOption>
                            );
                          }
                        })}
                      </ComboboxOptions>
                    </Combobox>
                  </Field>
                  <Button
                    onClick={() => {
                      setEditModalData((prev) => ({
                        ...prev,
                        applications: prev.applications.filter(
                          (app) => app.id !== application.id,
                        ),
                      }));
                    }}
                  >
                    <Trash />
                  </Button>
                </div>
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
          <PrimaryButton className="py-2 px-6 font-medium" type="submit">
            Save
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
});

export default AccessManagementModal;
