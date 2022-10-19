import React, { useState, useEffect } from 'react';

const AuthContext = React.createContext({
	isLoggedIn: false,
  onLogout: () => {},
  onLogin: (email, password) => {},
});

export const AuthContextProvider = (props) => {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedInformation = localStorage.getItem('isLoggedIn');
    if(storedInformation === '1'){
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [])

  const logoutHandler = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  const loginHandler = (email, password) => {
    localStorage.setItem('isLoggedIn', '1');
    setIsLoggedIn(true);
  }

  return <AuthContext.Provider value={{
    isLoggedIn : isLoggedIn,
    onLogout: logoutHandler,
    onLogin: loginHandler,
  }}>
    {props.children}
  </AuthContext.Provider>
};

export default AuthContext;