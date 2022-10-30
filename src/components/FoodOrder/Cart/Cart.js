import { useContext, useState } from 'react';
import CartContext from '../../../store/FoodOrder/cart-context';

import Modal from "../UI/Modal";
import styles from "./Cart.module.css"
import CartItem from "./CartItem";
import Checkout from './Checkout';

const Cart = ( props ) => {
  const [ isCheckOut, setIsCheckOut ] = useState(false);
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [ didSubmit, setDidSubmit ] = useState(false);
  const cartCtx = useContext(CartContext);

  const totalAmount = `$${cartCtx.totalAmount.toFixed(2)}`;
  const hasItems = cartCtx.items.length > 0;

  const cartItemRemoveHandler = (id) => {
    cartCtx.removeItem(id);
  }

  const cartItemAddHandler = (item) => {
    cartCtx.addItem({...item, amount:1});
  }

  const orderHandler = () => {
    setIsCheckOut(true);
  }

  const submitOrderHandler = async (userData) => {
    setIsSubmitting(true);
    const response = await fetch('https://react-post-de8f7-default-rtdb.firebaseio.com/orders.json',{
      method: 'POST',
      body: JSON.stringify({
        user: userData,
        orderedItems: cartCtx.items,
      })
    });

    setIsSubmitting(false);
    setDidSubmit(true);
    cartCtx.clearCart();
  }

  const cartItems = <ul className={styles['cart-items']}>
  { cartCtx.items.map((item) => {return (
    <CartItem 
      key={item.id} 
      name={item.name} 
      amount={item.amount} 
      price={item.price} 
      onAdd={cartItemAddHandler.bind(null, item)}
      onRemove={cartItemRemoveHandler.bind(null, item.id)}
      />
    )}
  )}
</ul>

  const moadlActions = 
  <div className={styles.actions}><button className={styles['button--alt']} onClick={props.hideCartFn}>Close</button> 
  { hasItems && <button className={styles.order} onClick={orderHandler}>Order</button>}</div>

  const cartModalContent = <> 
  { cartItems }
  <div className={styles.total}>
    <span>Total Amount</span>
    <span>{totalAmount}</span>
  </div>
  { isCheckOut && <Checkout onConfirm={submitOrderHandler} onCancel={props.hideCartFn} /> }
  { !isCheckOut && moadlActions }
  </>

  const isSubmittingModalContent = <p>Sending order data...</p>
  const didSubmitModalContent = 
  <>
    <p>Sucessfully sent the order!</p>
    <div className={styles.actions}>
      <button className={styles['button--alt']} onClick={props.hideCartFn}>
        Close
      </button> 
    </div>
  </>

  return (
    <Modal hideCartFn={props.hideCartFn}>
      {!isSubmitting && !didSubmit && cartModalContent}
      {isSubmitting && isSubmittingModalContent}
      {!isSubmitting && didSubmit && didSubmitModalContent}
    </Modal>
  )
}

export default Cart;