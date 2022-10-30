import { useReducer } from "react";

const initialInputState = {
  value: '',
  isTouched: false,
};

const inputStateReducer = (state, action) => {
  if(action.type === "INPUT"){
    return { value: action.value, isTouched: state.isTouched };
  } else if (action.type === "BLUR") {
    return { value: state.value, isTouched: true };
  } else if (action.type === "RESET") {
    return { value: "", isTouched: false };
  } 
  return inputStateReducer;
}

const useInput = ( validateValue ) => {
  const [ inputState, dispatch ] = useReducer(inputStateReducer, initialInputState);

  // const [enteredValue, setEnteredValue] = useState('');
  // const [isTouched, setIsTouched] = useState(false);

	const enteredValueIsValid = validateValue(inputState.value);
  const hasError = !enteredValueIsValid && inputState.isTouched;

  const valueChangeHandler = (e) => {
    dispatch({type: 'INPUT', value: e.target.value })
//    setEnteredValue(e.target.value);
  }

  const valueInputBlurHandler = (e) => {
    dispatch({type: 'BLUR'})
//    setIsTouched(true);
  }

  const reset = () => {
    dispatch({type: 'RESET'})
    // setEnteredValue('')
    // setIsTouched(false)
  }

  return {
    value: inputState.value,
    isValid: enteredValueIsValid,
    hasError,
    valueChangeHandler,
    valueInputBlurHandler,
    reset,
  }
};
  

export default useInput;