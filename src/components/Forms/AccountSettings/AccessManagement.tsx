import { Field, Input, Label } from '@headlessui/react';
import UserName from '../../../images/icon/UserName.tsx';
import EmailIcon from '../../../images/icon/EmailIcon.tsx';
import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../../AuthWrapper.tsx';
import ErrorPage from '../../../common/ErrorPage.tsx';
import Loader from '../../../common/Loader';
import AccessManagementModal from '../../../pages/AccountSetting/AcessManagementModal.tsx';
import DeleteUserModal from '../../../pages/AccountSetting/DeleteUserModal.tsx';
// import InviteUserModal from '../../../pages/AccountSetting/InviteUserModal.tsx';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';

export default function AccessManagement() {
  const { user_data, route } = useContext(AuthContext);

  // const actionTemplate = (rowData: any) => {
  //   return (
  //     <div className="mt-3 col-span-full lg:col-span-2 flex items-center gap-1">
  //       {/*<p className="text-xs lg:hidden">Actions</p>*/}
  //       <AccessManagementModal
  //         allApplications={allApplications}
  //         member={rowData}
  //       />
  //       {rowData.email !== user_data.email && (
  //         <DeleteUserModal member={rowData} />
  //       )}
  //     </div>
  //   );
  // };

  const { isPending, isError, data, error }: any = useQuery({
    queryKey: ['access_management', route],
    queryFn: ({ signal }) =>
      axios
        .get(`${route}/access_management`, { signal })
        .then((res) => res.data),
  });

  const allApplications =
    data &&
    data.all_applications.map((d: any) => ({
      value: d.id,
      label: d.display_name,
    }));

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
          {/*<DataTable value={data.members}>*/}
          {/*  <Column*/}
          {/*    field="name"*/}
          {/*    header="Name"*/}
          {/*    filter*/}
          {/*    filterPlaceholder="Search by name"*/}
          {/*    style={{ minWidth: '12rem' }}*/}
          {/*  />*/}
          {/*  <Column*/}
          {/*    field="email"*/}
          {/*    header="Email"*/}
          {/*    filter*/}
          {/*    filterPlaceholder="Search by Email"*/}
          {/*    style={{ minWidth: '12rem' }}*/}
          {/*  />*/}
          {/*  <Column*/}
          {/*    field="action"*/}
          {/*    header="Action"*/}
          {/*    body={actionTemplate}*/}
          {/*    style={{ minWidth: '12rem' }}*/}
          {/*  />*/}
          {/*</DataTable>*/}
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
              <AccessManagementModal
                allApplications={allApplications}
                newUser
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
