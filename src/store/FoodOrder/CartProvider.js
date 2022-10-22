import CartContext from './cart-context';

import { useReducer } from 'react';

const defaultCartState = {
  items: [],
  totalAmount: 0,
}

const cartReducer = (state, action) => {
  if(action.type === "ADD_CART_ITEM"){
    const newTotalAmount = state.totalAmount + (action.item.price * action.item.amount);
    
    const existingCartitemIndex = state.items.findIndex(
      item => item.id === action.item.id
    );
    const existingCartitem = state.items[existingCartitemIndex];
    // 이 메소드는 배열에서 항목의 목차를 찾아준다.
    
    let updatedItem;
    let updatedItems;
    if(existingCartitem){
      updatedItem = { ...existingCartitem, amount: existingCartitem.amount + action.item.amount }
      
      updatedItems = [...state.items];
      updatedItems[existingCartitemIndex] = updatedItem;
    } else {
      updatedItem = { ...action.item };
      updatedItems = state.items.concat(updatedItem);
    }
    
    return {
      items: updatedItems, 
      totalAmount: newTotalAmount,
    };
  } else if (action.type==="REMOVE_CART_ITEM"){
    
    const exsitingCartitemIndex = state.items.findIndex(
      item => item.id === action.id
    );
    const existingItem = state.items[exsitingCartitemIndex];
    const updatedTotalAmount = state.totalAmount - existingItem.price;

    let updatedItems;
    if( existingItem.amount === 1){
      updatedItems = state.items.filter(item => item.id !== action.id);
    } else {
      const updatedItem = { ...existingItem, amount: existingItem.amount - 1 };
      updatedItems = [...state.items];
      updatedItems[exsitingCartitemIndex] = updatedItem;
    }

    return {
      items: updatedItems,
      totalAmount: updatedTotalAmount
    }
  }
  return defaultCartState;
} 

const CartProvider = (props) => {
  const [cartState, dispatchCartAction] = useReducer(cartReducer, defaultCartState)

  const addItemToCartHandler = (item) => {
    dispatchCartAction({ type : "ADD_CART_ITEM", item});
  };

  const removeItemFromCartHandler = (id) => {
    dispatchCartAction({ type : "REMOVE_CART_ITEM", id});
  }

  const cartContext = {
    items: cartState.items,
    totalAmount: cartState.totalAmount,
    addItem: addItemToCartHandler,
    removeItem: removeItemFromCartHandler
  }

  return <CartContext.Provider value={cartContext}> 
    {props.children}
  </CartContext.Provider>
}

export default CartProvider;