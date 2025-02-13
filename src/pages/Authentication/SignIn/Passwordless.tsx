import {
  Dispatch,
  FormEvent,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { createToast } from '../../../hooks/fireToast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from '@tanstack/react-router';
import {
  clearLoginAttemptInfo,
  consumeCode,
  createCode,
  getLoginAttemptInfo,
  resendCode,
} from 'supertokens-web-js/recipe/passwordless';

class MyError {
  constructor(
    public message: string,
    public isSuperTokensGeneralError: boolean,
  ) {}
}

export async function sendOTP(
  email: string,
  setHasOTPBeenSent?: Dispatch<SetStateAction<boolean>>,
) {
  const response = await createCode({
    email,
  });

  if (response.status === 'SIGN_IN_UP_NOT_ALLOWED') {
    setHasOTPBeenSent?.(false);
    createToast('Forbidden', response.reason, 3, 'Forbidden');
  }
}

async function hasInitialOTPBeenSent() {
  return (await getLoginAttemptInfo()) !== undefined;
}

async function resendOTP(navigate: any) {
  try {
    const response = await resendCode();

    if (response.status === 'RESTART_FLOW_ERROR') {
      await clearLoginAttemptInfo();
      createToast(
        'Login Failed',
        'Login failed. Please try again',
        3,
        'Login Failed',
      );
      navigate({ to: '/auth' });
    } else {
      // OTP resent successfully.
      createToast(
        'OTP Sent',
        'Please check your email for the OTP',
        1,
        'OTP Sent',
      );
    }
  } catch (err) {
    if (err instanceof MyError) {
      if (err.isSuperTokensGeneralError) {
        // this may be a custom error message sent from the API by you.
        createToast('Error', err.message, 3, 'Login Failed');
      } else {
        createToast('Error', 'Oops! Something went wrong.', 3, 'Login failed');
      }
    }
  }
}

function Passwordless({ setIsLoading, isSession, setIsPasswordless }: any) {
  const [email, setEmail] = useState<string | undefined>();
  const [otp, setOtp] = useState<string | undefined>();
  const [hasOTPBeenSent, setHasOTPBeenSent] = useState(false);
  const [timer, setTimer] = useState(30);
  const navigate = useNavigate();
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    // Check if session exists
    (async () => {
      setIsLoading(true);
      setHasOTPBeenSent(await hasInitialOTPBeenSent());
    })()
      .catch((error) => {
        createToast('Login Failed', error.message, 3, 'Login Failed');
        setHasOTPBeenSent(false);
      })
      .finally(() => {
        if (!isSession) setIsLoading(false);
      });
  }, [isSession]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) {
      createToast('Login Failed', 'Missing Email', 3, 'Missing Email');
      return;
    }
    sendOTP(email, setHasOTPBeenSent).catch((error) => {
      setHasOTPBeenSent(false);
      createToast('Login Failed', error.message, 3, 'Login Failed');
    });
    setHasOTPBeenSent(true);
    setOtp('');
    setTimer(30);
  }

  function handleOTPSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!otp) {
      createToast('Login Failed', 'Please enter OPT', 3, 'Missing OPT');
      return;
    }
    setIsLoading(true);
    consumeCode({
      userInputCode: otp,
    })
      .then((response) => {
        if (response.status === 'OK') {
          navigate({ to: '/' });
          // setIsLoading(false);
        } else if (response.status === 'INCORRECT_USER_INPUT_CODE_ERROR') {
          createToast(
            'Error',
            'Wrong OTP! Please try again. Number of attempts left: ' +
              (response.maximumCodeInputAttempts -
                response.failedCodeInputAttemptCount),
            3,
            'Wrong OTP!',
          );
        } else if (response.status === 'EXPIRED_USER_INPUT_CODE_ERROR') {
          clearLoginAttemptInfo()
            .then(() => setHasOTPBeenSent(false))
            .catch(() => {
              createToast(
                'Error',
                'Failed to clear login attempt info',
                3,
                'Failed to clear login attempt info',
              );
            });
        } else {
          clearLoginAttemptInfo()
            .then(() => setHasOTPBeenSent(false))
            .catch(() => {
              createToast(
                'Error',
                'Failed to clear login attempt info',
                3,
                'Failed to clear login attempt info',
              );
            });
        }
      })
      .catch((error) => {
        createToast('Login Failed', error.message, 3, 'Login Failed');
      })
      .finally(() => setIsLoading(false));
  }

  function handleResendOTP() {
    resendOTP(navigate);
    setTimer(30);
  }

  return (
    <Fragment>
      {hasOTPBeenSent ? (
        <div className="flex gap-4 items-center">
          <ArrowLeftIcon
            className="size-9 mb-9"
            role="button"
            onClick={() => {
              clearLoginAttemptInfo()
                .then(() => setHasOTPBeenSent(false))
                .catch((error) =>
                  createToast(
                    'Failed to clear login attempt info',
                    error.message,
                    3,
                    'Failed to clear login attempt info',
                  ),
                );
            }}
          />
          <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
            Enter the one time passcode sent to your email
          </h2>
        </div>
      ) : (
        <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
          Welcome to Anthuria
        </h2>
      )}
      <form
        onSubmit={(event) => {
          !hasOTPBeenSent ? handleSubmit(event) : handleOTPSubmit(event);
        }}
      >
        <div className={`mb-4 ${hasOTPBeenSent ? 'hidden' : ''}`}>
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Email
          </label>
          <div className="relative">
            <input
              autoComplete="email webauthn"
              value={email}
              onChange={(event) => setEmail(event.target.value.trim())}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />

            <span className="absolute right-4 top-4">
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
                    d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z"
                    fill=""
                  />
                </g>
              </svg>
            </span>
          </div>
          <a
            className="text-sm text-primary dark:text-secondary cursor-pointer"
            onClick={() => setIsPasswordless(false)}
          >
            I would like to use my password.
          </a>
        </div>
        <div className={`mb-4 ${hasOTPBeenSent ? '' : 'hidden'}`}>
          <label className="mb-2.5 font-medium text-black dark:text-white flex justify-between">
            <span>OTP</span>
            {timer > 0 ? (
              <span>{timer}s to resend</span>
            ) : (
              <a
                className="text-primary"
                onClick={handleResendOTP}
                role="button"
              >
                Resend
              </a>
            )}
          </label>

          <div className="relative">
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              type="text"
              placeholder="Please Check Your Email For The One Time Passcode"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />

            <span className="absolute right-4 top-4">
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
        </div>

        <div className="mb-5 mt-5">
          <input
            type="submit"
            value="Sign In"
            className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
          />
        </div>

        <div className="mt-6 text-center">
          <p>
            Don’t have an account?{' '}
            <a href="mailto:support@anthuria.ai" className="text-primary">
              Contact us.
            </a>
          </p>
        </div>
      </form>
    </Fragment>
  );
}

export default Passwordless;
