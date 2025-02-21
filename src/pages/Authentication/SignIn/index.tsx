import { useEffect, useState } from 'react';
import NoBar from '../../../layout/NoBar';
import Loader from '../../../common/Loader';
import Session from 'supertokens-web-js/recipe/session';
import { useQuery } from '@tanstack/react-query';
import { getRoute } from '../../../components/AuthWrapper.tsx';
import Passwordless from './Passwordless.tsx';
import Password from './Password.tsx';
import Logo from '../../../images/logo/logo_dark.png';
import { Navigate, useNavigate, useSearch } from '@tanstack/react-router';
import { useToast } from '../../../components/ToastProvider.tsx';

function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearch({ from: '/auth' });
  const navigate = useNavigate();
  const otp = !!searchParams.otp;
  const [isPasswordless, setIsPasswordless] = useState(otp);
  const toast = useToast();
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
    toast?.show({
      severity: 'error',
      summary: 'Error',
      detail: sessionError?.message,
      life: 3000,
    });
  }
  useEffect(() => {
    navigate({
      // @ts-expect-error Tanstack router types are wrong
      search: { otp: isPasswordless },
    });
  }, [isPasswordless, navigate]);

  if (isLoading || isSessionPending) {
    return <Loader />;
  }
  if (isSession) {
    return <Navigate to="/" reloadDocument={true} />;
  }

  return (
    <NoBar>
      <div className="sm:px-10 pt-5">
        <img src={Logo} alt="logo" className="w-50" />

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:mx-auto mt-20 max-w-screen-md">
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
