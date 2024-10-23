import DefaultLayout from '../../layout/DefaultLayout.tsx';
import { useContext, useState } from 'react';
import { AuthContext } from '../../components/AuthWrapper.tsx';
import { useQueryClient } from '@tanstack/react-query';

import ErrorPage from '../../common/ErrorPage.tsx';
import PersonalInformationForm from '../../components/Forms/AccountSettings/PersonalInformationForm.tsx';
import useUpdateUser from '../../hooks/interface/modifyUser.ts';
import AccessManagement from '../../components/Forms/AccountSettings/AccessManagement.tsx';
import Loader from '../../common/Loader';
import UserPhoto from './UserPhoto.tsx';

const AccountSetting = () => {
  const queryClient = useQueryClient();
  const [isSent, setIsSent] = useState(false);
  const { route, user_applications_locations } = useContext(AuthContext);
  // console.log(croppedImage);
  const [loading, setLoading] = useState(false);
  const isAdmin = user_applications_locations.some(
    (d) => d['id'] === 'access_management',
  );

  const modifyUser = useUpdateUser(route, queryClient);

  if (loading) {
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
      <div className="mx-auto max-w-270 py-3 sm:py-9">
        <div className="grid grid-cols-5 gap-8">
          <PersonalInformationForm
            setLoading={setLoading}
            setIsSent={setIsSent}
            modifyUser={modifyUser}
          />
          <UserPhoto />

          {/* <!-- ===== Access Management ===== --> */}
          {isAdmin && <AccessManagement />}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AccountSetting;
