import React, { useContext } from "react";
// import { useSelector } from "react-redux";

import ProductItem from "../../components/Products/Products/ProductItem";
import classes from "./Products.module.css";
import { useStore } from "../../store/Products/hooks/store";

// import { productsContext } from "../../store/Products/context/product-context";

const Products = (props) => {
  const state = useStore(true)[0];

  // const productCtx = useContext(productsContext);
  // const productList = useSelector((state) => state.shop.products);
  return (
    <ul className={classes["products-list"]}>
      {state.products.map((prod) => (
        <ProductItem
          key={prod.id}
          id={prod.id}
          title={prod.title}
          description={prod.description}
          isFav={prod.isFavorite}
        />
      ))}
    </ul>
  );
};

export default Products;
