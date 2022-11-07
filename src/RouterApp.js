import { Route, Switch, Redirect } from 'react-router-dom';

import Welcome from './pages/Router/Welcome';
import Products from './pages/Router/Products';
import MainHeader from './components/Router/MainHeader';
import classes from './RouterApp.module.css'
import ProductDetail from './pages/Router/ProductDetail';

function App() {
  return (
    <div className={classes.main}>
      <MainHeader />
      <main>
        <Switch>
          <Route path='/' exact><Redirect to='/welcome' /></Route>
          <Route path="/welcome"><Welcome /></Route>
          <Route path="/products/:productId"><ProductDetail /></Route>
          <Route path="/products"><Products /></Route>
        </Switch>
      </main>
    </div>
  );
}

export default App;
