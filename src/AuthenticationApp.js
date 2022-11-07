import { Switch, Route, Redirect } from 'react-router-dom';

import Layout from './components/Authentication/Layout/Layout';
import UserProfile from './components/Authentication/Profile/UserProfile';
import AuthPage from './pages/Authentication/AuthPage';
import HomePage from './pages/Authentication/HomePage';
import { useContext } from 'react';
import AuthContext from './store/Authentication/auth-context';

function App() {

  const authCtx = useContext(AuthContext);

  return (
      <Layout>
        <Switch>
          <Route path='/' exact>
            <HomePage />
          </Route>
            { !authCtx.isLoggedIn && (
              <Route path='/auth'>
                <AuthPage />
              </Route>
            )}     
            <Route path='/profile'>
              { authCtx.isLoggedIn && <UserProfile /> }
              { !authCtx.isLoggedIn && <Redirect to="/auth" /> }
            </Route>
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Layout>
  );
}

export default App;
