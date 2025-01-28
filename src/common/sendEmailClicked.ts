import { createToast } from '../hooks/fireToast.tsx';
import {
  sendPasswordResetEmail,
  doesEmailExist as PasswordDoesEmailExist,
} from 'supertokens-web-js/recipe/emailpassword';
import { doesEmailExist as PasswordlessDoesEmailExist } from 'supertokens-web-js/recipe/passwordless';
import { Dispatch, SetStateAction } from 'react';
import { sendOTP } from '../pages/Authentication/SignIn/Passwordless.tsx';

export default async function sendEmailClicked(
  email: string | undefined,
  setIsSent: any,
  setIsPasswordless: Dispatch<SetStateAction<boolean>>,
) {
  if (email === undefined || email === '') {
    createToast('Login Failed', 'Missing Email', 3, 'Login Failed');
    return;
  }
  try {
    const passwordlessDoesEmailExist = await PasswordlessDoesEmailExist({
      email,
    });
    if (!passwordlessDoesEmailExist.doesExist) {
      createToast('Login Failed', 'Email does not exist', 3, 'Login Failed');
      return;
    }
    const passwordDoesEmailExist = await PasswordDoesEmailExist({
      email,
    });
    if (!passwordDoesEmailExist.doesExist) {
      await sendOTP(email);
      setIsPasswordless(true);
      return;
    }
    const response = await sendPasswordResetEmail({
      formFields: [
        {
          id: 'email',
          value: email,
        },
      ],
    });

    if (response.status === 'FIELD_ERROR') {
      // one of the input formFields failed validaiton
      response.formFields.forEach((formField) => {
        if (formField.id === 'email') {
          // Email validation failed (for example incorrect email syntax).
          createToast('Login Failed', formField.error, 3, 'Login Failed');
        }
      });
    } else if (response.status === 'PASSWORD_RESET_NOT_ALLOWED') {
      // this can happen due to automatic account linking. Please read our account linking docs
    } else {
      // reset password email sent.
      setIsSent(true);
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
