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
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Navigate,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SuperTokens, { SuperTokensWrapper } from 'supertokens-auth-react';
import AuthWrapper, { getRoute } from './components/AuthWrapper.tsx';
import Passwordless from 'supertokens-auth-react/recipe/passwordless';
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword';
import Session, { SessionAuth } from 'supertokens-auth-react/recipe/session';
import PageTitle from './components/PageTitle.tsx';
import EventTracker from './pages/TriggerWords/EventTracker/EventTracker.tsx';
import IncidentTracker from './pages/TriggerWords/IncidentTracker/IncidentTracker.tsx';
import AccountSetting from './pages/AccountSetting/AccountSetting.tsx';
import ResetPassword from './pages/Authentication/SignIn/ResetPassword.tsx';
import PrimaryButton from './components/Basic/PrimaryButton.tsx';
import MDS from './pages/MDS/Suggestion/MDS.tsx';
import MDSChatBot from './pages/MDS/ChatBot/ChatBot.tsx';
import { datadogRum } from '@datadog/browser-rum';
import { PrimeReactProvider } from 'primereact/api';
import FileReader from './pages/MDS/FileReder/FileReader.tsx';
import PasswordSetUp from './pages/Authentication/PasswordSetUp.tsx';

const queryClient = new QueryClient();
datadogRum.init({
  applicationId: '74ef0146-2176-4b8d-b608-56d9da4595fb',
  clientToken: 'pubaac1044fefb79fcbe8b8c03513e1c3ce',
  // `site` refers to the Datadog site parameter of your organization
  // see https://docs.datadoghq.com/getting_started/site/
  site: 'datadoghq.com',
  service:
    window.location.origin === 'http://localhost' ||
    window.location.origin === 'brea-dev.triedgesandbox.com'
      ? 'noah-dev'
      : window.location.origin === 'https://noah.triedgesandbox.com'
        ? 'noah-stg'
        : 'anthuria-prod',
  env:
    window.location.origin === 'http://localhost' ||
    window.location.origin === 'brea-dev.triedgesandbox.com'
      ? 'dev'
      : window.location.origin === 'https://noah.triedgesandbox.com'
        ? 'stg'
        : 'prod',
  // Specify a version number to identify the deployed version of your application in Datadog
  version: '0.0.1',
  allowedTracingUrls: [(url) => url.startsWith(getRoute())],
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'allow',
});
SuperTokens.init({
  appInfo: {
    appName: 'Anthuria',
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

const IncidentTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trigger-words/incident-tracker',
  component: () => {
    return (
      <SessionAuth>
        <PageTitle id="trigger_words" />
        <IncidentTracker />
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
  path: '/mds/suggestion',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      facility_name: search.facility_name as string | undefined,
      update_time: search.update_time as string | undefined,
    };
  },
  component: () => {
    return (
      <SessionAuth>
        <PageTitle id="mds" />
        <MDS />
      </SessionAuth>
    );
  },
});

const MDSChatBotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mds/chatbot',
  component: () => {
    return (
      <SessionAuth>
        <PageTitle id="mds" />
        <MDSChatBot />
      </SessionAuth>
    );
  },
});
const MDSFileReaderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mds/file-reader',
  component: () => {
    return (
      <SessionAuth>
        <PageTitle id="mds" />
        <FileReader />
      </SessionAuth>
    );
  },
});
const SetupPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup-password',
  component: () => {
    return (
      <SessionAuth>
        <PageTitle id="Please setup your password" />
        <PasswordSetUp />
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
  IncidentTrackerRoute,
  CashflowForecastRoute,
  AccountSettingRoute,
  ClinicalPulseRoute,
  MDSRoute,
  SignInRoute,
  SignUpRoute,
  ResetPasswordRoute,
  MDSChatBotRoute,
  MDSFileReaderRoute,
  SetupPasswordRoute,
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
    <link
      id="theme-link"
      rel="stylesheet"
      href="/themes/lara-light-blue/theme.css"
    />
    <SuperTokensWrapper>
      <PrimeReactProvider>
        <RouterProvider router={router} />
      </PrimeReactProvider>
    </SuperTokensWrapper>
  </QueryClientProvider>,
);
