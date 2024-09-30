import ReactDOM from 'react-dom/client';
import './css/style.css';
import 'flatpickr/dist/flatpickr.min.css';
import Home from './pages/Home';
import NHQI from './pages/Dashboard/NHQI';
import ErrorPage from './common/ErrorPage.tsx';
import { Toaster } from 'react-hot-toast';
import CashflowForecast from './pages/Dashboard/CashflowForecast.tsx';
import ReviewTriggers from './pages/TriggerWords/ReviewTriggers/ReviewTriggers.tsx';
import SignIn from './pages/Authentication/SignIn/index.tsx';
import SignUp from './pages/Authentication/SignUp.tsx';
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  Outlet,
  createRoute,
  Navigate,
  Link,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SuperTokens, { SuperTokensWrapper } from 'supertokens-auth-react';
import AuthWrapper, { getRoute } from './components/AuthWrapper.tsx';
import Passwordless from 'supertokens-auth-react/recipe/passwordless';
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword';
import Session, { SessionAuth } from 'supertokens-auth-react/recipe/session';
import PageTitle from './components/PageTitle.tsx';
import EventTracker from './pages/TriggerWords/EventTracker/EventTracker.tsx';
import AccountSetting from './pages/AccountSetting/AccountSetting.tsx';
import ResetPassword from './pages/Authentication/SignIn/ResetPassword.tsx';
import PrimaryButton from './components/Basic/PrimaryButton.tsx';
import MDS from './pages/MDS/MDS.tsx';

const queryClient = new QueryClient();

SuperTokens.init({
  appInfo: {
    appName: 'NOAH',
    apiDomain: getRoute(),
    websiteDomain: window.location.origin,
    apiBasePath: '/auth',
    websiteBasePath: '/auth',
  },
  recipeList: [
    Passwordless.init({
      contactMethod: 'EMAIL',
    }),
    EmailPassword.init(),
    Session.init(),
  ],
});
const rootRoute = createRootRoute({
  component: () => (
    <>
      <AuthWrapper>
        <>
          <Toaster position="bottom-center" />
          <Outlet />
        </>
      </AuthWrapper>
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    return (
      <SessionAuth>
        <PageTitle title="Home" />
        <Home />
      </SessionAuth>
    );
  },
});

const NHQIRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => {
    return (
      <SessionAuth>
        <PageTitle id="nhqi" />
        <NHQI />
      </SessionAuth>
    );
  },
});

const ReviewTriggersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trigger-words/review-triggers',
  component: () => {
    return (
      <SessionAuth>
        <PageTitle id="trigger_words" />
        <ReviewTriggers />
      </SessionAuth>
    );
  },
});

const EventTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trigger-words/event-tracker',
  component: () => {
    return (
      <SessionAuth>
        <PageTitle id="trigger_words" />
        <EventTracker />
      </SessionAuth>
    );
  },
});

const CashflowForecastRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cashflow-forecast',
  component: () => {
    return (
      <SessionAuth>
        <PageTitle id="cashflow_forecast" />
        <CashflowForecast />
      </SessionAuth>
    );
  },
});

const AccountSettingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => {
    return (
      <SessionAuth>
        <PageTitle title="Settings" />
        <AccountSetting />
      </SessionAuth>
    );
  },
});

const MDSRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mds',
  component: () => {
    return (
      <SessionAuth>
        <PageTitle id="mds" />
        <MDS />
      </SessionAuth>
    );
  },
});

const ClinicalPulseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trigger-words',
  component: () => {
    return <Navigate to={'/trigger-words/review-triggers'} />;
  },
});

const SignInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: () => {
    return <SignIn />;
  },
});
const SignUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: () => {
    return <SignUp />;
  },
});

const ResetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/reset-password',
  component: () => {
    return <ResetPassword />;
  },
});
const routeTree = rootRoute.addChildren([
  indexRoute,
  NHQIRoute,
  ReviewTriggersRoute,
  EventTrackerRoute,
  CashflowForecastRoute,
  AccountSettingRoute,
  ClinicalPulseRoute,
  MDSRoute,
  SignInRoute,
  SignUpRoute,
  ResetPasswordRoute,
]);
const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => (
    <ErrorPage error={'404 Page Not Found'}>
      <PrimaryButton>
        <Link to={'/'}>Back to Home</Link>
      </PrimaryButton>
    </ErrorPage>
  ),
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <SuperTokensWrapper>
      <RouterProvider router={router} />
    </SuperTokensWrapper>
  </QueryClientProvider>,
);
