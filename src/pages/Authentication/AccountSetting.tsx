import DefaultLayout from '../../layout/DefaultLayout.tsx';
import {
  Button,
  Field,
  Input,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { useContext, useState } from 'react';
import { AuthContext } from '../../components/AuthWrapper.tsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Modal from '../../components/Modal/Modal.tsx';
import { signUp } from 'supertokens-web-js/recipe/emailpassword';
import { createToast } from '../../hooks/fireToast.tsx';
import Loader from '../../common/Loader';
import sendEmailClicked from '../../common/sendEmailClicked.ts';
import ErrorPage from '../../common/ErrorPage.tsx';
import { ChevronDownIcon, PenSquare, Trash } from 'lucide-react';
import clsx from 'clsx';
import UserName from '../../images/icon/UserName.tsx';
import EmailIcon from '../../images/icon/EmailIcon.tsx';

async function signUpClicked(
  email: string,
  password: string,
  setShowPasswordModal: any,
) {
  try {
    const response = await signUp({
      formFields: [
        {
          id: 'email',
          value: email,
        },
        {
          id: 'password',
          value: password,
        },
      ],
    });

    if (response.status === 'FIELD_ERROR') {
      // one of the input formFields failed validaiton
      response.formFields.forEach((formField) => {
        if (formField.id === 'email') {
          // Email validation failed (for example incorrect email syntax),
          // or the email is not unique.
          createToast(
            'Password Set Failed',
            formField.error,
            3,
            'Password Set Failed',
          );
        } else if (formField.id === 'password') {
          // Password validation failed.
          // Maybe it didn't match the password strength
          createToast('Login Failed', formField.error, 3, 'Login Failed');
        }
      });
    } else if (response.status === 'SIGN_UP_NOT_ALLOWED') {
      // the reason string is a user friendly message
      // about what went wrong. It can also contain a support code which users
      // can tell you so you know why their sign up was not allowed.
      createToast('Login Failed', response.reason, 3, 'Login Failed');
    } else {
      // sign up successful. The session tokens are automatically handled by
      // the frontend SDK.
      setShowPasswordModal(false);
      createToast('Password Set Successful', '', 0, 'Password Set Successful');
    }
  } catch (err: any) {
    if (err.isSuperTokensGeneralError === true) {
      // this may be a custom error message sent from the API by you.
      // it can also be a generic error message
      createToast('Login Failed', err.message, 3, 'Login Failed');
    } else {
      // this is an unexpected error
      createToast('Login Failed', err.message, 3, 'Login Failed');
    }
  }
}
const AccountSetting = () => {
  const queryClient = useQueryClient();
  const [isSent, setIsSent] = useState(false);
  const { user_data, route, user_applications_locations } =
    useContext(AuthContext);
  const [user, setUser] = useState(user_data);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editModdalData, setEditModalData] = useState<{
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
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteModalData, setInviteModalData] = useState<{
    email: string;
    name: string;
  }>({
    email: '',
    name: '',
  });
  const isAdmin = user_applications_locations.some(
    (d) => d['id'] === 'access_management',
  );
  const modifyUser = useMutation({
    mutationFn: (user: any) => {
      return axios.put(`${route}/user`, user);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['user', route],
      });
    },
  });
  const { isPending, isError, data, error }: any = useQuery({
    queryKey: ['access_management', route],
    queryFn: () =>
      axios.get(`${route}/access_management`).then((res) => res.data),
    enabled: isAdmin,
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

  const allApplications =
    data &&
    data.all_applications.map((d: any) => ({
      value: d.id,
      label: d.display_name,
    }));
  const allLocations = user_applications_locations.find(
    (d: any) => d['id'] === 'access_management',
  )?.locations;
  const [applicationOptions, setApplicationOptions] = useState<
    { label: string; value: string }[]
  >([]);
  if (loading || (isAdmin && isPending)) {
    return <Loader />;
  }
  if (isSent) {
    return (
      <ErrorPage error={'Password Reset Link is been Sent'}>
        <p>Check your email!</p>
      </ErrorPage>
    );
  }
  if (isError) {
    return <ErrorPage error={error.message} />;
  }
  return (
    <DefaultLayout title="Account Settings">
      <div className="mx-auto max-w-270">
        <div className="grid grid-cols-5 gap-8">
          {/* <!-- ===== Personal Information ===== --> */}
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Personal Information
                </h3>
              </div>
              <div className="p-7">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    modifyUser.mutate(user);
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
                        value={user.name}
                        onChange={(e) => {
                          setUser((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }));
                        }}
                      />
                    </Field>
                    <Field className="w-full sm:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Phone Number
                      </label>
                      <Input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="tel"
                        onChange={(e) => {
                          setUser((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }));
                        }}
                        value={user.phone}
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
                        disabled
                        className="basis-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="email"
                        value={user.email}
                      />
                    </div>
                  </Field>
                  <Field className="mb-5.5 ">
                    <Label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Password
                    </Label>
                    {user_data.hasPassword ? (
                      <div className="relative">
                        <div className="flex items-center flex-wrap">
                          <Input
                            className="basis-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="password"
                            disabled
                            placeholder={'**********'}
                          />
                          <Button
                            className="md:absolute md:right-2 text-primary"
                            onClick={() => {
                              setLoading(true);
                              sendEmailClicked(
                                user_data.email,
                                setIsSent,
                              ).finally(() => {
                                setLoading(false);
                              });
                            }}
                          >
                            Request to Change
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Modal
                        title={'Set up a Password'}
                        button={<button>Set up a Password</button>}
                        classNameses={{
                          button:
                            'flex whitespace-nowrap justify-center rounded border border-stroke py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white w-full',
                        }}
                        isOpen={showPasswordModal}
                        setIsOpen={setShowPasswordModal}
                      >
                        <form
                          className="flex flex-col gap-4.5"
                          onSubmit={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setLoading(true);
                            if (password !== confirmPassword) {
                              createToast(
                                "Passwords don't match",
                                '',
                                2,
                                "Passwords don't match",
                              );
                              return;
                            }
                            signUpClicked(
                              user_data.email,
                              password,
                              setShowPasswordModal,
                            ).finally(() => {
                              setLoading(false);
                              queryClient.invalidateQueries({
                                queryKey: ['user', route],
                              });
                            });
                          }}
                        >
                          <Field className="flex flex-col">
                            <Label className="mb-2.5 font-medium text-black text-sm dark:text-white flex justify-between">
                              Password
                            </Label>
                            <div className="relative">
                              <Input
                                value={password}
                                onChange={(event) =>
                                  setPassword(event.target.value)
                                }
                                type="password"
                                placeholder="New password"
                                className="lg:min-w-100 rounded-lg border border-stroke bg-transparent py-2 pl-3 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                              />

                              <span className="absolute right-4 top-2">
                                <svg
                                  className="fill-current"
                                  width="22"
                                  height="22"
                                  viewBox="0 0 22 22"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <g opacity="0.5">
                                    <path
                                      d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                                      fill=""
                                    />
                                    <path
                                      d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                                      fill=""
                                    />
                                  </g>
                                </svg>
                              </span>
                            </div>
                          </Field>
                          <Field className="flex flex-col">
                            <Label className="mb-2.5 font-medium text-sm text-black dark:text-white flex justify-between">
                              Confirm Password
                            </Label>
                            <div className="relative">
                              <Input
                                value={confirmPassword}
                                onChange={(event) =>
                                  setConfirmPassword(event.target.value)
                                }
                                type="password"
                                placeholder="Re-enter new password"
                                className="lg:min-w-100 rounded-lg border border-stroke bg-transparent py-2 pl-3 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                              />

                              <span className="absolute right-4 top-2">
                                <svg
                                  className="fill-current"
                                  width="22"
                                  height="22"
                                  viewBox="0 0 22 22"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <g opacity="0.5">
                                    <path
                                      d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                                      fill=""
                                    />
                                    <path
                                      d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                                      fill=""
                                    />
                                  </g>
                                </svg>
                              </span>
                            </div>
                          </Field>
                          <Button
                            className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                            type="submit"
                          >
                            Save
                          </Button>
                        </form>
                      </Modal>
                    )}
                  </Field>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="reset"
                      onClick={() => setUser(user_data)}
                    >
                      Reset
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* <!-- ===== User Photo ===== --> */}
          <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Your Photo
                </h3>
              </div>
              <div className="p-7">
                <form action="#">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full">
                      <img
                        className="rounded-full"
                        src={
                          user.picture ||
                          'https://ui-avatars.com/api/?background=random&name=' +
                            user_data.name +
                            ''
                        }
                        alt="User"
                      />
                    </div>
                    <div>
                      <span className="mb-1.5 text-black dark:text-white">
                        Edit your photo
                      </span>
                      <span className="flex gap-2.5">
                        <button className="text-sm hover:text-primary">
                          Delete
                        </button>
                        {/*<button className="text-sm hover:text-primary">*/}
                        {/*  Update*/}
                        {/*</button>*/}
                      </span>
                    </div>
                  </div>

                  <div
                    id="FileUpload"
                    className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
                  >
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                    />
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                            fill="#3C50E0"
                          />
                        </svg>
                      </span>
                      <p>
                        <span className="text-primary">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                      <p>(max, 800 X 800px)</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <Button
                      className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="submit"
                    >
                      Reset
                    </Button>
                    <Button
                      className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                    >
                      Save
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* <!-- ===== Access Management ===== --> */}
          {isAdmin && (
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
                      <>
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
                          <Label className="text-xs lg:hidden">
                            Email Address
                          </Label>
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
                          {member.email !== user.email && (
                            <>
                              <p className="text-xs lg:hidden">Actions</p>
                              <Modal
                                isOpen={editModal}
                                setIsOpen={setEditModal}
                                title={'Member Information'}
                                button={<PenSquare />}
                                onOpenCallback={() => {
                                  setEditModalData(member);
                                  setApplicationOptions(
                                    allApplications.filter(
                                      (app: any) =>
                                        !member.applications.some(
                                          (appID: any) =>
                                            app.value === appID.id,
                                        ),
                                    ),
                                  );
                                }}
                              >
                                <form
                                  className="sm:w-150 w-screen"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    modifyUser.mutate(user);
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
                                        value={editModdalData.name}
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
                                        value={editModdalData.phone}
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
                                        onChange={(e) => {
                                          setEditModalData((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                          }));
                                        }}
                                        value={editModdalData.email}
                                      />
                                    </div>
                                  </Field>
                                  <div className="grid grid-cols-9 gap-4">
                                    <p className="col-span-4">Applications</p>
                                    <p className="col-span-4">Facilities</p>

                                    {editModdalData.applications
                                      ?.filter(
                                        (app: any) =>
                                          app.id !== 'access_management',
                                      )
                                      .map((application: any) => {
                                        return (
                                          <>
                                            <Field className="col-span-4">
                                              <Listbox
                                                value={application.id}
                                                onChange={(value) => {
                                                  const newApplications =
                                                    editModdalData.applications.map(
                                                      (app: any) => {
                                                        if (
                                                          app.id ===
                                                          application.id
                                                        ) {
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
                                                    applications:
                                                      newApplications,
                                                  }));
                                                  setApplicationOptions(
                                                    allApplications.filter(
                                                      (app: any) =>
                                                        !newApplications.some(
                                                          (appID: any) =>
                                                            app.value ===
                                                            appID.id,
                                                        ),
                                                    ),
                                                  );
                                                }}
                                              >
                                                <ListboxButton
                                                  className={clsx(
                                                    'group relative block w-full rounded bg-slate-100 py-3 pr-8 pl-3 text-left border border-stroke ',
                                                    'focus:border-primary data-[focus]:border-primary focus:outline-none ',
                                                  )}
                                                >
                                                  <p className="text-nowrap overflow-x-hidden">
                                                    {allApplications.find(
                                                      (app: any) =>
                                                        app.value ===
                                                        application.id,
                                                    )?.label ||
                                                      'Select Application'}
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
                                              <Listbox
                                                value={application.locations.map(
                                                  (loc: any) =>
                                                    loc.internal_facility_id,
                                                )}
                                                multiple={true}
                                                onChange={(value) => {
                                                  setEditModalData((prev) => ({
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
                                                <ListboxButton
                                                  className={clsx(
                                                    'relative block w-full rounded bg-slate-100 py-3 pr-8 pl-3 text-left border border-stroke ',
                                                    'focus:border-primary  data-[focus]:border-primary',
                                                  )}
                                                >
                                                  {application.locations.length}{' '}
                                                  Facilities
                                                  <ChevronDownIcon
                                                    className="group pointer-events-none absolute top-4 right-2.5 size-5"
                                                    aria-hidden="true"
                                                  />
                                                </ListboxButton>
                                                <ListboxOptions
                                                  className={clsx(
                                                    'w-[var(--button-width)] rounded border border-stroke [--anchor-gap:var(--spacing-1)] focus:outline-none absolute bg-white overflow-y-auto z-9 max-h-50',
                                                  )}
                                                >
                                                  {allLocations?.map(
                                                    (location) => (
                                                      <ListboxOption
                                                        key={
                                                          location.internal_facility_id
                                                        }
                                                        value={
                                                          location.internal_facility_id
                                                        }
                                                        className=" flex cursor-default items-center gap-2 rounded py-1 px-3 select-none data-[focus]:bg-secondary data-[selected]:bg-slate-200"
                                                      >
                                                        {location.facility_name}
                                                      </ListboxOption>
                                                    ),
                                                  )}
                                                </ListboxOptions>
                                              </Listbox>
                                            </Field>
                                            <Button
                                              onClick={() => {
                                                setEditModalData((prev) => ({
                                                  ...prev,
                                                  applications:
                                                    prev.applications.filter(
                                                      (app) =>
                                                        app.id !==
                                                        application.id,
                                                    ),
                                                }));
                                                if (
                                                  application.display_name !==
                                                  ''
                                                ) {
                                                  setApplicationOptions(
                                                    (prevState) => [
                                                      ...prevState,
                                                      {
                                                        label:
                                                          application.display_name,
                                                        value: application.id,
                                                      },
                                                    ],
                                                  );
                                                }
                                              }}
                                            >
                                              <Trash />
                                            </Button>
                                          </>
                                        );
                                      })}
                                  </div>
                                  <div className="flex justify-end gap-4.5 mt-7">
                                    {editModdalData.applications?.filter(
                                      (app: any) =>
                                        app.id !== 'access_management',
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
                                                id: prevState.applications
                                                  .length,
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
                              <Button
                                onClick={() => deleteUser.mutate(member.email)}
                              >
                                <Trash />
                              </Button>
                            </>
                          )}
                        </Field>
                        <hr className=" border-1 border-stroke lg:hidden block basis-full last:hidden" />{' '}
                      </>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-4.5 mt-7">
                    <Modal
                      isOpen={inviteModal}
                      setIsOpen={setInviteModal}
                      title="Invite A New User"
                      button={
                        <Button
                          className="flex whitespace-nowrap justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                          type="submit"
                        >
                          Invite A New User
                        </Button>
                      }
                      onCloseCallback={() =>
                        setInviteModalData({ email: '', name: '' })
                      }
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
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AccountSetting;
