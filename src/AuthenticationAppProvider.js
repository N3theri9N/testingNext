import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from './store/Authentication/auth-context';

import App from "./AuthenticationApp";

const AuthenticationAppProvider = () => {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <App /> 
      </AuthContextProvider>
    </BrowserRouter>
  )
}

export default AuthenticationAppProvider;