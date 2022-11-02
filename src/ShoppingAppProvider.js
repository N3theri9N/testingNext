import ShoppingApp from './ShoppingApp';
import { Provider } from 'react-redux';
import store from './store/ReduxShopping/index';

function App() {
  return (
    <Provider store={store}> 
      <ShoppingApp />
    </Provider>
  );
}

export default App;
