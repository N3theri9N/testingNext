import React from "react";
import { Route } from "react-router-dom";

// import { Provider } from 'react-redux';
// import { combineReducers, createStore } from 'redux';
// import productReducer from "./store/Products/reducers/products";
// import ProductsProvider from "./store/Products/context/product-context";

import configureProductsStore from "./store/Products/hooks/products-store";

import classes from "./ProductsApp.module.css";

// const rootReducer = combineReducers({
//   shop: productReducer,
// });

// const store = createStore(rootReducer);

import Navigation from "./components/Products/Nav/Navigation";
import ProductsPage from "./containers/Products/Products";
import FavoritesPage from "./containers/Products/Favorites";

configureProductsStore();
const App = (props) => {

  return (
    <div className={classes.app}>
      <Navigation />
      <main>
        <Route path="/" component={ProductsPage} exact />
        <Route path="/favorites" component={FavoritesPage} />
      </main>
    </div>
  );
};

export default App;
