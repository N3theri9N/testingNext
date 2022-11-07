import Counter from './components/Redux/Counter';
import Header from './components/Redux/Header';
import Auth from './components/Redux/Auth';
import UserProfile from './components/Redux/UserProfile';

import { Provider } from 'react-redux';


import store from './store/Redux/index';

function App() {

  return (
    <Provider store={store}>
      <Header />
      <UserProfile />
      <Auth />
      <Counter />
    </Provider>
  );
}

export default App;
