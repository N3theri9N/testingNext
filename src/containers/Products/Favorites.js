import React, { useContext } from "react";
// import { useSelector } from 'react-redux';

import FavoriteItem from "../../components/Products/Favorites/FavoriteItem";
import classes from "./Products.module.css";

// import { productsContext } from "../../store/Products/context/product-context";
import { useStore } from "../../store/Products/hooks/store";

const Favorites = (props) => {
  // const productsCtx = useContext(productsContext);
  
  const state = useStore()[0];
  const favoriteProducts = state.products.filter((p) => p.isFavorite);

  let content = <p className="placeholder">Got no favorites yet!</p>;
  if (favoriteProducts.length > 0) {
    content = (
      <ul className={classes["products-list"]}>
        {favoriteProducts.map((prod) => (
          <FavoriteItem
            key={prod.id}
            id={prod.id}
            title={prod.title}
            description={prod.description}
          />
        ))}
      </ul>
    );
  }
  return content;
};

export default Favorites;
