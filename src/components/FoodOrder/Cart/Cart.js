import { useContext } from 'react';
import CartContext from '../../../store/FoodOrder/cart-context';

import Modal from "../UI/Modal";
import styles from "./Cart.module.css"
import CartItem from "./CartItem";

const Cart = ( props ) => {
  const cartCtx = useContext(CartContext);

  const totalAmount = `$${cartCtx.totalAmount.toFixed(2)}`;
  const hasItems = cartCtx.items.length > 0;

  const cartItemRemoveHandler = (id) => {
    cartCtx.removeItem(id);
  }

  const cartItemAddHandler = (item) => {
    cartCtx.addItem({...item, amount:1});
  }

  return (
    <Modal hideCartFn={props.hideCartFn}>
      <ul className={styles['cart-items']}>
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
      <div className={styles.total}>
        <span>Total Amount</span>
        <span>{totalAmount}</span>
      </div>
      <div className={styles.actions}>
        <button className={styles['button--alt']} onClick={props.hideCartFn}>Close</button> 
        { hasItems && <button className={styles.order}>Order</button>}
      </div>
    </Modal>
  )
}

export default Cart;