import { Button, Field, Input, Label } from '@headlessui/react';
import UserName from '../../../images/icon/UserName.tsx';
import EmailIcon from '../../../images/icon/EmailIcon.tsx';
import sendEmailClicked from '../../../common/sendEmailClicked.ts';
import Modal from '../../Modal/Modal.tsx';
import { createToast } from '../../../hooks/fireToast.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { AuthContext } from '../../AuthWrapper.tsx';
import { signUp } from 'supertokens-web-js/recipe/emailpassword';
import PrimaryButton from '../../Basic/PrimaryButton.tsx';

export async function signUpClicked(
  email: string,
  password: string,
  setShowPasswordModal?: Dispatch<SetStateAction<boolean>>,
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
      setShowPasswordModal?.(false);
      createToast('Password Set Successful', '', 0, 'Password Set Successful');
      window.location.href = '/';
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
export default function PersonalInformationForm({
  setLoading,
  setIsSent,
  modifyUser,
}: any) {
  const queryClient = useQueryClient();
  const { user_data, route } = useContext(AuthContext);
  const [user, setUser] = useState(user_data);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
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
                        sendEmailClicked(user_data.email, setIsSent).finally(
                          () => {
                            setLoading(false);
                          },
                        );
                      }}
                    >
                      Request to Change
                    </Button>
                  </div>
                </div>
              ) : (
                <Modal
                  title={'Set up a Password'}
                  button={<p>Set up a Password</p>}
                  classNameses={{
                    button:
                      'flex whitespace-nowrap justify-center rounded border border-stroke py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white w-full',
                  }}
                  isOpen={showPasswordModal}
                  setIsOpen={setShowPasswordModal}
                >
                  <form
                    className="flex flex-col gap-4.5 px-4"
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
                          onChange={(event) => setPassword(event.target.value)}
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
              <PrimaryButton className="py-2 px-6 font-medium " type="submit">
                Save
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
