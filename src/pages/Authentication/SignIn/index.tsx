import { useState } from 'react';
import NoBar from '../../../layout/NoBar';
import Loader from '../../../common/Loader';
import { createToast } from '../../../hooks/fireToast';
import Session from 'supertokens-auth-react/recipe/session';
import { useQuery } from '@tanstack/react-query';
import { getRoute } from '../../../components/AuthWrapper.tsx';
import Passwordless from './Passwordless.tsx';
import Password from './Password.tsx';
import Logo from '../../../images/logo/logo_dark.png';
import { Navigate, useSearch } from '@tanstack/react-router';

function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearch({ from: '/auth' });
  const otp = !!searchParams.otp;
  const [isPasswordless, setIsPasswordless] = useState(otp);

  const route = getRoute();
  const {
    isPending: isSessionPending,
    data: isSession,
    error: sessionError,
    isError: isSessionError,
  } = useQuery({
    queryKey: ['session', route],
    queryFn: async () => await Session.doesSessionExist(),
  });
  if (isSessionError) {
    createToast('Login Failed', sessionError.message, 3, 'Login Failed');
  }

  if (isLoading || isSessionPending) {
    return <Loader />;
  }
  if (isSession) {
    return <Navigate to="/" />;
  }

  return (
    <NoBar>
      <div className="px-10 pt-5">
        <img src={Logo} alt="logo" className="w-50" />

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mx-auto mt-20 max-w-screen-md">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            {isPasswordless ? (
              <>
                <Passwordless
                  setIsLoading={setIsLoading}
                  isSession={isSession}
                  setIsPasswordless={setIsPasswordless}
                />
              </>
            ) : (
              <>
                <Password setIsPasswordless={setIsPasswordless} />
              </>
            )}
          </div>
        </div>
      </div>
    </NoBar>
  );
}

export default SignIn;
