import QuoteList from "../../components/Quotes/quotes/QuoteList";
import LoadingSpinner from "../../components/Quotes/UI/LoadingSpinner";
import NoQuotesFound from '../../components/Quotes/quotes/NoQuotesFound';
import useHttp from "../../hooks/Quotes/use-http";
import { getAllQuotes } from '../../lib/Quotes/api'
import { useEffect } from "react";

const DUMMY_QUOTES = [
  { id: 'q1', author: 'Max', text: 'learning React is fun!'},
  { id: 'q2', author: 'Maximilian', text: 'learning React is Great!'}
]

const AllQuotes = () => {

  const { sendRequest, status, data: loadedQuotes, error } = useHttp(getAllQuotes, true);

  useEffect(()=>{
    sendRequest();
  }, [sendRequest]);

  if (status==='pending'){
    return <div>
      <LoadingSpinner />
    </div>
  }
  if ( error ){
    return <p>{error}</p>;
  }
  if(status === 'completed' && (!loadedQuotes || loadedQuotes.length === 0)){
    return <NoQuotesFound />
  }
  return (
    <QuoteList quotes={loadedQuotes} />
  )
}

export default AllQuotes;