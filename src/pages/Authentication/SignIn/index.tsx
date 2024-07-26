import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../../../images/logo/logo.png';
import NoBar from '../../../layout/NoBar';
import Loader from '../../../common/Loader';
import { createToast } from '../../../hooks/fireToast';
import Session from 'supertokens-auth-react/recipe/session';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getRoute } from '../../../components/AuthWrapper.tsx';
import Passwordless from './Passwordless.tsx';
import Password from './Password.tsx';
function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordless, setIsPasswordless] = useState(true);
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyID');
  const redirect = searchParams.get('redirect');
  const navigate = useNavigate();
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
  const {
    isPending,
    data: canny_jwt,
    error,
    isError,
  } = useQuery({
    queryKey: ['canny', route],
    queryFn: () => axios.get(`${route}/canny_sso`).then((res) => res.data),
    enabled: !!redirect && !!companyId && !isSessionPending && isSession,
  });
  if (isSessionError) {
    createToast('Login Failed', sessionError.message, 3, 'Login Failed');
  }
  if (isError) {
    createToast(
      'Failed to Fetch Canny Token',
      error.message,
      3,
      'Login Failed',
    );
  }

  useEffect(() => {
    // Check if session exists
    (async () => {
      if (!isSessionPending && isSession) {
        setIsLoading(true);
        if (companyId && redirect && canny_jwt) {
          window.location.assign(
            `https://canny.io/api/redirects/sso?companyID=${companyId}&ssoToken=${canny_jwt}&redirect=${redirect}`,
          );
        } else if (!companyId && !redirect) {
          navigate('/');
        }
      }
    })();
  }, [isSession, canny_jwt]);

  if (isLoading || isSessionPending) {
    return <Loader />;
  }
  if (isSession && isPending) {
    return <Loader />;
  }

  return (
    <NoBar>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mt-10">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="py-17.5 px-26 text-center">
              <div className="flex items-center justify-center">
                <img src={Logo} alt="Logo" className="w-35" />
                <span className="text-6xl font-bold text-black">NOAH</span>
              </div>
            </div>
          </div>

          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
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
      </div>
    </NoBar>
  );
}

export default SignIn;
