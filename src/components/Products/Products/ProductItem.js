import React, { useContext } from 'react';
// import { useDispatch } from 'react-redux';

import Card from '../UI/Card';
import classes from './ProductItem.module.css';
// import { productsContext } from '../../../store/Products/context/product-context';
import { useStore } from '../../../store/Products/hooks/store';

const ProductItem = React.memo( props => {
  console.log("RERENDER")
  // const dispatch = useDispatch();
  // const productCtx = useContext(productsContext);
  const dispatch = useStore(false)[1];
  const toggleFavHandler = () => {
    // productCtx.toggleFav(props.id);
    dispatch('TOGGLE_FAV', props.id);
  };

  return (
    <Card style={{ marginBottom: '1rem' }}>
      <div className={classes['product-item']}>
        <h2 className={props.isFav ? 'is-fav' : ''}>{props.title}</h2>
        <p>{props.description}</p>
        <button
          className={!props.isFav ? 'button-outline' : ''}
          onClick={toggleFavHandler}
        >
          {props.isFav ? 'Un-Favorite' : 'Favorite'}
        </button>
      </div>
    </Card>
  );
});

export default ProductItem;
