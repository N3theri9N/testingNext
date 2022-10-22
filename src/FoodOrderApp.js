import { useState } from 'react';
import CartProvider from './store/FoodOrder/CartProvider';

import Header from './components/FoodOrder/Layout/Header'
import Meals from './components/FoodOrder/Meals/Meals';
import Cart from './components/FoodOrder/Cart/Cart'


const FoodOrderApp = () => {
  const [cartIsShown, setCartIsShown] = useState(false);

  const showCartHandler = () => {
    setCartIsShown(true)
  }

  const hideCartHandler = () => {
    setCartIsShown(false)
  }

  return (
    <CartProvider>
      <Header showCartFn={showCartHandler} />
      { cartIsShown && <Cart hideCartFn={hideCartHandler} /> }
      <main>
        <Meals />
      </main>
    </CartProvider>
  )

}

export default FoodOrderApp;