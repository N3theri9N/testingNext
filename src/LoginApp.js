import React, { useContext } from 'react';

import Login from './components/LoginPage/Login/Login';
import Home from './components/LoginPage/Home/Home';
import MainHeader from './components/LoginPage/MainHeader/MainHeader';
import AuthContext from './store/Login/auth-context';

function LoginApp() {

  const authCtx = useContext(AuthContext);
  
  return (
    <>
      <MainHeader />
      <main>
        {authCtx.isLoggedIn ? <Home /> : <Login />}
      </main>
    </>
  );
}

export default LoginApp;
