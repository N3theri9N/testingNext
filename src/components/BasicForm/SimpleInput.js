import { useRef, useState, useEffect } from 'react';

const SimpleInput = (props) => {
  const [enterName, setEnterName] = useState('');
  const [enterEmail, setEnterEmail] = useState('');
  // const [enteredNameIsValid, setEnteredNameIsValid] = useState(false);
  const [enteredNameTouched, setEnteredNameTouched] = useState(false);
  const [enteredEmailTouched, setEnteredEmailTouched] = useState(false);
  // const [formIsValid, setFormIsValid] = useState(false);
  // const nameInputRef = useRef();

  const enteredNameIsValid = enterName.trim() !== '';
  const nameInputIsInValid = !enteredNameIsValid && enteredNameTouched; 
//  const enteredEmailIsValid = enterEmail.trim() !== '' && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(enterEmail);
  const enteredEmailIsValid = enterEmail.includes('@');  
  const emailInputIsInValid = !enteredEmailIsValid && enteredEmailTouched; 
 
  // useEffect(() => {
  //   if(enteredNameIsValid){
  //     console.log('Name Input is valid!')
  //   }
  // }, [enteredNameIsValid]);
  
  let formIsValid = false;

  if( enteredNameIsValid && enteredEmailIsValid ){
    formIsValid = true;
  }   

  const nameInputChangeHandler = (e) => {
    setEnterName(e.target.value);

    // if(e.target.value.trim() !== '' ){     
    //   setEnteredNameIsValid(true);
    // }
  }
  const emailInputChangeHandler = (e) => {
    setEnterEmail(e.target.value);
  }

  const nameInputBlurHandler = (e) => {
    setEnteredNameTouched(true);
    // if(enterName.trim() == '' ){
    //   setEnteredNameIsValid(false);
    // }
  }
  const emailInputBlurHandler = (e) => {
    setEnteredEmailTouched(true);
  }

  const formSubmissionHandler = (e) => {
    e.preventDefault(); 
    setEnteredNameTouched(true);
    setEnteredEmailTouched(true);
   
    if(!enteredNameIsValid || !enteredEmailIsValid){
      return;
    }
    console.log(enterName, enterEmail);

    setEnterName('');
    setEnterEmail('');
    setEnteredNameTouched(false);
    setEnteredEmailTouched(false);

    // const enteredValue = nameInputRef.current.value;
    // console.log(enteredValue);
    // setEnteredNameIsValid(true);
  };
 const nameInputClasses = nameInputIsInValid ? 'form-control invalid' : 'form-control';
 const emailInputClasses = emailInputIsInValid ? 'form-control invalid' : 'form-control';

  return (
    <form onSubmit={formSubmissionHandler}>
      <div className={nameInputClasses}>
        <label htmlFor='name'>Your Name</label>
        <input 
          // ref={nameInputRef} 
          type='text' 
          id='name' 
          onChange={nameInputChangeHandler} 
          onBlur={nameInputBlurHandler}
          value={enterName}
        />
      </div>
      { nameInputIsInValid && <p className='error-text'>Name must not be empty.</p> }
      <div className={emailInputClasses}>
        <label htmlFor='email'>Email</label>
        <input 
          // ref={nameInputRef} 
          type='text' 
          id='email' 
          onChange={emailInputChangeHandler} 
          onBlur={emailInputBlurHandler}
          value={enterEmail}
        />
      </div>
      { emailInputIsInValid && <p className='error-text'>Please enter a valid email.</p> }
      <div className="form-actions">
        <button disabled={!formIsValid}>Submit</button>
      </div>
    </form>
  );
};

export default SimpleInput;
