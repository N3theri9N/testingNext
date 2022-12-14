import QuoteForm from '../../components/Quotes/quotes/QuoteForm';
import useHttp from "../../hooks/Quotes/use-http";
import { useHistory } from 'react-router-dom';
import { addQuote } from "../../lib/Quotes/api";
import { useEffect } from 'react';

const NewQuote = () => {
  const { sendRequest, status } = useHttp(addQuote);
  const history = useHistory();

  useEffect(() => {
    if(status === 'completed'){
      history.push("/quotes");
    } 
  }, [status, history]);

  const addQuoteHandler = quoteData => {
    sendRequest(quoteData);
  }

  return <QuoteForm isLoading={status === 'pending'} onAddQuote={addQuoteHandler} />
}

export default NewQuote;