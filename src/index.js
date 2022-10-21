import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthContextProvider } from './store/Login/auth-context';

//import './index.css';
//import App from './GoalApp';
// import './UserApp.css';
// import App from './UserApp';
// import './LoginApp.css';
// import App from './LoginApp';
import App from './BackgroundApp';

const root = ReactDOM.createRoot(document.getElementById('root'));


// root.render(
// <AuthContextProvider>
// <App />
// </AuthContextProvider>
// );
root.render(
  <App />
)