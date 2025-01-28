import Loader from '../common/Loader';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useEffect } from 'react';
import ErrorPage from '../common/ErrorPage.tsx';
import axios from 'axios';
import Session from 'supertokens-auth-react/recipe/session';
import { signOut } from 'supertokens-auth-react/recipe/passwordless';
import { datadogRum } from '@datadog/browser-rum';
import { Navigate, useLocation } from '@tanstack/react-router';

export const AuthContext = createContext({
  user_data: {
    name: '',
    email: '',
    picture: '',
    phone: '',
    hasPassword: false,
    organization_id: '',
    organization_name: '',
  },
  user_applications_locations: [
    {
      id: '',
      display_name: '',
      icon: '',
      default_order: 0,
      uri: '',
      locations: [{ internal_facility_id: '', facility_name: '' }],
    },
  ],
  route: '',
});

export function getRoute() {
  if (window.location.origin === 'http://localhost') {
    return 'http://localhost:3009';
  }
  if (window.location.origin === 'https://brea-dev.triedgesandbox.com')
    return 'https://brea-dataservice-dev.triedgesandbox.com';
  if (window.location.origin === 'https://noah.triedgesandbox.com')
    return 'https://dataservice.triedgesandbox.com';
  return 'https://dataservice.anthuria.ai';
}

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const sessionContext = Session.useSessionContext();

  const route = getRoute();

  // If you only need the pathname
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

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
    retryDelay: 3000,
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
    retryDelay: 3000,
  });

  useEffect(() => {
    if (user_data) {
      // @ts-expect-error Pendo Integration
      pendo.initialize({
        visitor: {
          id: user_data.email,
          email: user_data.email,
          full_name: user_data.name,
        },
        account: {
          id: user_data.organization_id,
          name: user_data.organization_name,
        },
      });
    }
    datadogRum.setUser({
      id: user_data?.email,
      name: user_data?.name,
      email: user_data?.email,
    });
  }, [user_data]);

  // useEffect(() => {
  //   user_data && shutdown();
  //   user_data &&
  //     Intercom({
  //       app_id: 'x02d82le',
  //       user_id: user_data.email, // IMPORTANT: Replace "user.id" with the variable you use to capture the user's ID
  //       name: user_data.name, // IMPORTANT: Replace "user.name" with the variable you use to capture the user's name
  //       email: user_data.email, // IMPORTANT: Replace "user.email" with the variable you use to capture the user's email
  //     });
  // }, [pathname, user_data]);

  useEffect(() => {
    if (queryClient && user_applications_locations && user_data) {
      // setFrontendCookie('email', user_data?.email || '', '\\');
      const ws_route = route.replace('https', 'wss').replace('http', 'ws');
      const websocket = new WebSocket(`${ws_route}/ws/${user_data?.email}`);
      websocket.onopen = () => {
        console.log('connected');
      };
      websocket.onmessage = (event) => {
        console.log(event.data);
        queryClient.invalidateQueries({ queryKey: [event.data, route] });
      };
      return () => {
        websocket.close();
      };
    }
  }, [queryClient, user_applications_locations, user_data]);

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
        {user_data.hasPassword || pathname === '/setup-password' ? (
          <>{children}</>
        ) : (
          <Navigate to="/setup-password" />
        )}
      </AuthContext.Provider>
    );
  } else {
    return children;
  }
}
