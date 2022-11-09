import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
//import { AuthContextProvider } from './store/Login/auth-context';

//import './index.css';

// # section 6
//import App from './GoalApp';
// import './UserApp.css';

// # section 8~9
// import App from './UserApp';
// import './LoginApp.css';

// # section 10
// import App from './LoginApp';

// # section ??
// import App from './BackgroundApp';

// # section 11, 17
// import App from './FoodOrderApp';
// import './FoodOrderApp.css';

// # section 14
// import App from './MovieApp';
// import './MovieApp.css';

// # section 15
// import App from "./CounterApp";
// import App from "./TasksApp";

// # section 16
// import App from "./BasicFormApp";

// # section 18
//import App from "./ReduxApp";

// # section 19
//import App from "./ShoppingAppProvider"

// # section 22
// import App from "./AuthenticationAppProvider";

// #section 20
// import App from './RouterApp';
// import App from './QuotesApp';

// #section 24
import App from './RAnimationApp';

const root = ReactDOM.createRoot(document.getElementById('root'));

// root.render(
// <AuthContextProvider>
// <App />
// </AuthContextProvider>
// );
root.render(
  <BrowserRouter>
    <App /> 
  </BrowserRouter>
)