import { useContext } from "react";

import MealItemForm from "./MealItemForm";
import styles from "./MealItem.module.css";
import CartContext from "../../../../store/FoodOrder/cart-context";

const MealItem = ( props ) => {
  const price = `$${props.mealPrice}`; 
  const cartCtx = useContext(CartContext);

  const addToCarthandler = (amount) => {
    //console.log(amount);
    cartCtx.addItem({
      id: props.id,
      name: props.mealName,
      amount: amount,
      price: props.mealPrice
    })
  }

  return (
    <li className={styles.meal}>
      <div>
        <h3>{props.mealName}</h3>
        <div className={styles.description}>{props.mealDescription}</div>
        <div className={styles.price}>{price}</div>
      </div>
      <div>
        <MealItemForm addToCart={addToCarthandler} />
      </div>
    </li>
  )
}

export default MealItem;