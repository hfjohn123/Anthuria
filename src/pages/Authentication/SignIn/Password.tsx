import { useState } from 'react';
import {
  signIn,
  doesEmailExist,
} from 'supertokens-web-js/recipe/emailpassword';
import { createToast } from '../../../hooks/fireToast.tsx';
import Modal from '../../../components/Modal/Modal.tsx';
import sendEmailClicked from '../../../common/sendEmailClicked.ts';
import { Button, Field, Input, Label } from '@headlessui/react';
import { useNavigate } from '@tanstack/react-router';
import { Password as PrimePassword } from 'primereact/password';
import { InputText } from 'primereact/inputtext';

async function signInClicked(
  email: string | undefined,
  password: string | undefined,
  navigate: any,
) {
  if (
    email === undefined ||
    password === undefined ||
    email === '' ||
    password === ''
  ) {
    createToast('Login Failed', 'Missing Email or Password', 3, 'Login Failed');
    return;
  }
  try {
    const response = await signIn({
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
      response.formFields.forEach((formField) => {
        if (formField.id === 'email') {
          // Email validation failed (for example incorrect email syntax).
          createToast('Login Failed', formField.error, 3, 'Login Failed');
        }
      });
    } else if (response.status === 'WRONG_CREDENTIALS_ERROR') {
      const checkEmail = await doesEmailExist({ email });
      if (!checkEmail.doesExist) {
        createToast(
          'Login Failed',
          'Email does not match any user',
          3,
          'Login Failed',
        );
        return;
      }
      createToast('Login Failed', 'Wrong Email or Password', 3, 'Login Failed');
    } else if (response.status === 'SIGN_IN_NOT_ALLOWED') {
      // the reason string is a user friendly message
      // about what went wrong. It can also contain a support code which users
      // can tell you so you know why their sign in was not allowed.
      createToast('Login Failed', response.reason, 3, 'Login Failed');
    } else {
      // sign in successful. The session tokens are automatically handled by
      // the frontend SDK.
      navigate({ to: '/' });
    }
  } catch (err: any) {
    if (err.isSuperTokensGeneralError === true) {
      // this may be a custom error message sent from the API by you.
      createToast('Login Failed', err.message, 3, 'Login Failed');
    } else {
      createToast(
        'Login Failed',
        'Oops! Something went wrong.',
        3,
        'Login Failed',
      );
    }
  }
}

function Password({ setIsPasswordless }: any) {
  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return <h3>Loading...</h3>;
  }
  if (isSent) {
    return <h3>Please check your email for the password reset link!</h3>;
  }
  return (
    <>
      <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
        Welcome to Anthuria
      </h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          signInClicked(email, password, navigate);
        }}
      >
        <Field className={`mb-4 `}>
          <Label className="mb-2.5 block font-medium text-black dark:text-white">
            Email
          </Label>
          <div className="relative">
            <InputText
              autoComplete="email webauthn"
              value={email}
              onChange={(event) => setEmail(event.target.value.trim())}
              placeholder="Enter your email"
              className="w-full "
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
        </Field>
        <Field className={`mb-4 `}>
          <Label className="mb-2.5 font-medium text-black dark:text-white flex justify-between">
            Password
          </Label>
          <PrimePassword
            value={password}
            feedback={false}
            className="w-full"
            pt={{
              input: () => 'w-full',
              showIcon: () => 'size-5 -mt-2 mr-1',
              hideIcon: () => 'size-5  -mt-2 mr-1',
            }}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            toggleMask
          />
          <Modal
            button={<p>Forgot Password?</p>}
            classNameses={{
              button:
                'text-sm text-primary dark:text-secondary cursor-pointer block',
            }}
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            title="Forgot Password"
          >
            <form
              className="flex flex-col gap-4 px-4"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLoading(true);
                sendEmailClicked(email, setIsSent, setIsPasswordless).then(
                  () => {
                    setIsModalOpen(false);
                    setIsLoading(false);
                  },
                );
              }}
            >
              <Field>
                <Label>Email</Label>
                <div className="relative">
                  <Input
                    autoComplete="email webauthn"
                    value={email}
                    onChange={(event) => setEmail(event.target.value.trim())}
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none"
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
              </Field>
              <Button
                className="rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90 w-min self-end"
                type="submit"
              >
                Submit
              </Button>
            </form>
          </Modal>
          <a
            className="text-sm text-primary dark:text-secondary cursor-pointer block"
            onClick={() => setIsPasswordless(true)}
          >
            Use a one time passcode instead of password
          </a>
        </Field>

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
    </>
  );
}

export default Password;
