import { useContext, useEffect, useState } from 'react';
import CartContext from '../../../store/FoodOrder/cart-context';

import styles from "./HeaderCartButton.module.css"
import CartIcon from "../Cart/CartIcon";

const HeaderCartButton = (props) => {
  const cartCtx = useContext(CartContext);
  const [btnIsHighlighted, setBtnIsHighlighted ] = useState(false)

  const numberOfCartItems = cartCtx.items.reduce((curNumber, item)=>{
    return curNumber + item.amount}, 0)

  const btnClasses = `${styles.button} ${btnIsHighlighted ? styles.bump : ''}`;

  useEffect(()=> {
    if(numberOfCartItems === 0 ){
      return;
    } 
    setBtnIsHighlighted(true);
    const timer = setTimeout(() => {
      setBtnIsHighlighted(false);
    }, 300)

    return () => {
      clearTimeout(timer);
    }
  }, [numberOfCartItems])

  return <button className={btnClasses} onClick={props.showCartFn}>
    {/* 아이콘, 텍스트, 현재 항목 수를 보여줄거다. */}
    <span className={styles.icon}>
      <CartIcon />
    </span>
    <span>Your Cart</span>
    <span className={styles.badge}>{numberOfCartItems}</span>
  </button>
}

export default HeaderCartButton;