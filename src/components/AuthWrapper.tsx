import Loader from '../common/Loader';
import { useQuery } from '@tanstack/react-query';
import { createContext } from 'react';
import ErrorPage from '../common/ErrorPage.tsx';
import axios from 'axios';
import Session from 'supertokens-auth-react/recipe/session';
import { signOut } from 'supertokens-auth-react/recipe/passwordless';
import Intercom from '@intercom/messenger-js-sdk';

export const AuthContext = createContext({
  user_data: { name: '', email: '', picture: '' },
  user_applications_locations: [],
  route: '',
});

export function getRoute() {
  if (window.location.origin === 'http://localhost') {
    return 'http://localhost:3009';
    // return 'https://dataservice.noahexample.com';
  } else {
    return 'https://dataservice.noahexample.com';
  }
}

export default function AuthWrapper({ children }: { children: JSX.Element }) {
  const sessionContext = Session.useSessionContext();
  const route = getRoute();

  async function onLogout() {
    await signOut();
  }

  const {
    isPending,
    isError,
    data: user_data,
    error,
  } = useQuery({
    queryKey: ['user', route],
    queryFn: () => axios.get(`${route}/user`).then((res) => res.data),
    enabled: !sessionContext.loading && sessionContext.doesSessionExist,
  });

  const {
    isPending: is_appliccation_pending,
    isError: is_appliccation_error,
    data: user_applications_locations,
    error: appliccation_error,
  } = useQuery({
    queryKey: ['user_applications_locations', route],
    queryFn: () =>
      axios.get(`${route}/user_applications_locations`).then((res) => res.data),
    enabled: !sessionContext.loading && sessionContext.doesSessionExist,
  });

  // user_data &&
  //   pendo.initialize({
  //     visitor: {
  //       id: user_data.email,
  //       email: user_data.email,
  //     },
  //
  //     account: {
  //       id: user_data.email,
  //     },
  //   });
  user_data &&
    Intercom({
      app_id: 'x02d82le',
      user_id: user_data.email, // IMPORTANT: Replace "user.id" with the variable you use to capture the user's ID
      name: user_data.name, // IMPORTANT: Replace "user.name" with the variable you use to capture the user's name
      email: user_data.email, // IMPORTANT: Replace "user.email" with the variable you use to capture the user's email
    });
  if (sessionContext.loading) {
    return <Loader />;
  }
  if (
    !sessionContext.loading &&
    sessionContext.doesSessionExist &&
    (isPending || is_appliccation_pending)
  )
    return <Loader />;
  if (
    !sessionContext.loading &&
    sessionContext.doesSessionExist &&
    (isError || is_appliccation_error)
  )
    return (
      <ErrorPage
        error={
          error
            ? error.message
            : appliccation_error?.message || 'Something went wrong!'
        }
      >
        <button
          className={
            'cursor-pointer rounded-lg border border-primary bg-primary p-2 text-white transition hover:bg-opacity-90'
          }
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </ErrorPage>
    );
  if (
    !sessionContext.loading &&
    sessionContext.doesSessionExist &&
    user_applications_locations.length === 0
  )
    return (
      <ErrorPage error={'Not Authorized!'}>
        <button
          className={
            'cursor-pointer rounded-lg border border-primary bg-primary p-2 text-white transition hover:bg-opacity-90'
          }
          onClick={onLogout}
        >
          Back to Login
        </button>
      </ErrorPage>
    );

  if (sessionContext.doesSessionExist) {
    return (
      <AuthContext.Provider
        value={{ user_data, user_applications_locations, route }}
      >
        {children}
      </AuthContext.Provider>
    );
  } else {
    return children;
  }
}
