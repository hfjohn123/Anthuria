import DefaultLayout from '../../layout/DefaultLayout.tsx';
import { Button, Field, Input, Label } from '@headlessui/react';
import { useContext, useState } from 'react';
import { AuthContext } from '../../components/AuthWrapper.tsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Modal from '../../components/Modal.tsx';
import { signUp } from 'supertokens-web-js/recipe/emailpassword';
import { createToast } from '../../hooks/fireToast.tsx';
import Loader from '../../common/Loader';
import sendEmailClicked from '../../common/sendEmailClicked.ts';
import ErrorPage from '../../common/ErrorPage.tsx';
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
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['access_management', route],
    queryFn: () =>
      axios.get(`${route}/access_management`).then((res) => res.data),
    enabled: user_applications_locations.some(
      (d) => d['id'] === 'access_management',
    ),
  });
  if (
    loading ||
    (user_applications_locations.some((d) => d['id'] === 'access_management') &&
      isPending)
  ) {
    return <Loader />;
  }
  if (isSent) {
    return (
      <ErrorPage error={'Password Reset Link is been Sent'}>
        <p>Check your email!</p>
      </ErrorPage>
    );
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
                      <span className="absolute left-4.5 top-11.5">
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                              fill=""
                            />
                          </g>
                        </svg>
                      </span>
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
                    <span className="absolute left-4.5 top-11.5">
                      <svg
                        className="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z"
                            fill=""
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z"
                            fill=""
                          />
                        </g>
                      </svg>
                    </span>
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
                  {data.members.map((member) => (
                    <>
                      <Field className="mt-3 col-span-full w-full lg:col-span-3 relative">
                        <span className="absolute left-4.5 lg:top-3.5 top-9">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
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
                        <span className="absolute left-4.5 top-9 lg:top-3.5">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
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
                      <Field className="mt-3 col-span-full lg:col-span-2 relative">
                        <p className="text-xs lg:hidden">Phone Number</p>
                      </Field>
                      <hr className=" border-1 border-stroke lg:hidden block basis-full last:hidden" />{' '}
                    </>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-4.5 mt-7">
                  <Button
                    className="flex sm:mr-auto whitespace-nowrap justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                    type="submit"
                  >
                    Invite A New User
                  </Button>
                  <Button
                    className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                    type="reset"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AccountSetting;
