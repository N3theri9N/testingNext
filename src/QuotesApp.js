import { Route, Switch, Redirect } from "react-router-dom";

import AllQuotes from "./pages/Quotes/AllQuotes";
import QuoteDetail from "./pages/Quotes/QuoteDetail";
import NewQuote from "./pages/Quotes/NewQuote";
import classes from "./QuotesApp.module.css";
import Layout from "./components/Quotes/layout/Layout";
import NotFound from "./pages/Quotes/NotFound";

function App() {
  return (
    <Layout>
      <Switch>
        <Route path='/' exact>
          <Redirect to='/quotes' />
        </Route>    
        <Route path="/quotes" exact>
          <AllQuotes />
        </Route>
        <Route path="/quotes/:quoteId">
          <QuoteDetail />
        </Route>
        <Route path="/new-quote">
          <NewQuote />
        </Route>
        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </Layout>
  );
}

export default App;
