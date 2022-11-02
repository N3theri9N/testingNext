import Cart from './components/ReduxShopping/Cart/Cart';
import Layout from './components/ReduxShopping/Layout/Layout';
import Products from './components/ReduxShopping/Shop/Products';
import Notification from './components/ReduxShopping/UI/Notification';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendCartData, fetchCartData } from './store/ReduxShopping/cart-actions';
// import { uiActions } from './store/ReduxShopping/ui-slice';

let isInitial = true;

function App() {
  const showCart = useSelector(state => state.ui.cartIsVisible );
  const notification = useSelector(state => state.ui.notification );
  const cart = useSelector(state => state.cart);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCartData());
  }, [dispatch]);


  useEffect(()=> {
    // const sendCartData = async () => {
      // dispatch(uiActions.showNotification({
      //   status: 'pending',
      //   title: 'Sending...',
      //   message: 'Sending cart data!',
      // }))
      // const response = await fetch('https://react-post-de8f7-default-rtdb.firebaseio.com/cart.json', 
      // {method: "PUT", body: JSON.stringify(cart) }); 
      
      // if(!response.ok){
      //   throw new Error('Sending cart data failed.')
      // }

      // dispatch(uiActions.showNotification({
      //   status: 'success',
      //   title: 'Success!',
      //   message: 'Sent cart data successfully!',
      // }));
    // }
    
    if(isInitial){
      isInitial = false;
      return;
    }
    if(cart.changed) {
      dispatch(sendCartData(cart));
    }
    // sendCartData().catch(err => {
      // dispatch(uiActions.showNotification({
      //   status: 'error',
      //   title: 'Error!',
      //   message: 'Sending cart data failed!',
      // }))
    // });
  }, [cart, dispatch]);

  return (
    <>
      {notification && <Notification 
        status={notification.status} 
        title={notification.title}
        message={notification.message}
      />}
      <Layout>
        { showCart && <Cart />}
        <Products />
      </Layout>
    </>
  );
}

export default App;
