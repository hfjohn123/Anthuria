import { Field, Input, Label } from '@headlessui/react';
import { Button } from 'primereact/button';
import UserName from '../../../images/icon/UserName.tsx';
import EmailIcon from '../../../images/icon/EmailIcon.tsx';
import sendEmailClicked from '../../../common/sendEmailClicked.ts';
import { useContext, useState } from 'react';
import { AuthContext } from '../../AuthWrapper.tsx';

export default function PersonalInformationForm({
  setLoading,
  setIsSent,
  modifyUser,
}: any) {
  const { user_data } = useContext(AuthContext);
  const [user, setUser] = useState(user_data);

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
              <div className="relative">
                <div className="flex items-center flex-wrap">
                  <Input
                    className="basis-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="password"
                    disabled
                    placeholder={'**********'}
                  />
                  <Button
                    className="md:absolute md:right-2 bg-transparent"
                    onClick={() => {
                      setLoading(true);
                      sendEmailClicked(user_data.email, setIsSent).finally(
                        () => {
                          setLoading(false);
                        },
                      );
                    }}
                    label={'Request to Change'}
                    pt={{
                      label: () => 'no-underline',
                    }}
                  />
                </div>
              </div>
            </Field>

            <div className="flex justify-end gap-4.5">
              <button
                className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                type="reset"
                onClick={() => setUser(user_data)}
              >
                Reset
              </button>
              <Button className="py-2 px-6 font-medium " type="submit">
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
