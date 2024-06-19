import {useEffect} from 'react';
import {Route, Routes, useLocation, useNavigate} from 'react-router-dom';

import {Toaster} from 'react-hot-toast';
import PageTitle from './components/PageTitle';
import NHQI from './pages/Dashboard/NHQI';
import Home from './pages/Home';
import ErrorPage from './common/ErrorPage.tsx';
import CashflowForecast from './pages/Dashboard/CashflowForecast.tsx';
import TriggerWords from './pages/Dashboard/TriggerWords.tsx';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import SuperTokens, {SuperTokensWrapper} from 'supertokens-auth-react';
import Passwordless from 'supertokens-auth-react/recipe/passwordless';
import Session, {SessionAuth} from 'supertokens-auth-react/recipe/session';
import AuthWrapper, {getRoute} from './components/AuthWrapper.tsx';
import SignIn from './pages/Authentication/SignIn.tsx';
import SignUp from './pages/Authentication/SignUp.tsx';
import Settings from './pages/Settings.tsx';

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
    Session.init()
  ],
});
const queryClient = new QueryClient();

function App() {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    window && window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <SuperTokensWrapper>
      <QueryClientProvider client = {queryClient}>
        <Toaster position = "bottom-center"/>
        <AuthWrapper>
          <Routes>
            <Route
              index
              element = {
                <SessionAuth>
                  <PageTitle title = "Home"/>
                  <Home/>
                </SessionAuth>
              }
            />
            <Route
              path = "/dashboard"
              element = {
                <SessionAuth>
                  <PageTitle title = "Dashboard" recenctable/>
                  <NHQI/>
                </SessionAuth>
              }
            />
            <Route
              path = "/trigger-words"
              element = {
                <SessionAuth>
                  <PageTitle title = "Clinical Pulse" recenctable/>
                  <TriggerWords/>
                </SessionAuth>
              }
            />
            <Route
              path = "/cashflow-forecast"
              element = {
                <SessionAuth>
                  <PageTitle title = "Cashflow Forecast" recenctable/>
                  <CashflowForecast/>
                </SessionAuth>
              }
            />
            <Route
              path = "/settings"
              element = {
                <SessionAuth>
                  <PageTitle title = "Settings" recenctable/>
                  <Settings/>
                </SessionAuth>
              }
            />
            <Route path = "/auth" element = {<SignIn/>}/>
            <Route path = "/signup" element = {<SignUp/>}/>

            <Route
              path = "*"
              element = {
                <>
                  <PageTitle title = "404"/>
                  <ErrorPage error = "Page Not Found">
                    <button
                      className = {
                        'cursor-pointer rounded-lg border border-primary bg-primary p-2 text-white transition hover:bg-opacity-90'
                      }
                      onClick = {() => {
                        navigate('/');
                      }}
                    >
                      Back to Home
                    </button>
                  </ErrorPage>
                </>
              }
            />
          </Routes>
        </AuthWrapper>
      </QueryClientProvider>
    </SuperTokensWrapper>
  );
}

export default App;
