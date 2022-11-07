import { Link, Route, useParams, useRouteMatch } from "react-router-dom";
import Comments from "../../components/Quotes/comments/Comments";
import HighlightedQuote from "../../components/Quotes/quotes/HighlightedQuote";
import useHttp from "../../hooks/Quotes/use-http";
import { getSingleQuote } from "../../lib/Quotes/api";
import { useEffect } from "react";
import LoadingSpinner from "../../components/Quotes/UI/LoadingSpinner";

const QuoteDetail = () => {

  const params = useParams();
  const match = useRouteMatch();

  const { quoteId } = params;

  const { sendRequest, status, data: loadedQuote, error } = useHttp(getSingleQuote, true);
  
  useEffect(() => {
    sendRequest(quoteId);
  }, [sendRequest, quoteId])

  if( status === 'pending'){
    return <LoadingSpinner />
  }

  if( error ){
    return <p>{error}</p>
  }

  if( !loadedQuote.text ){
    return <p>No Quote Found!</p>;
  }

  return (<>
    <HighlightedQuote text={loadedQuote.text} author={loadedQuote.author}/>
    <Route path={`${match.path}`} exact>
      <Link to={`${match.url}/comments`}>Load Comments</Link>
    </Route>
    <Route path={`${match.path}/comments`}>
      <Comments />
    </Route>
  </>)
}

export default QuoteDetail