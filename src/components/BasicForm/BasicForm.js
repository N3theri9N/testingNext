// import useInput from "../../hooks/use-input";
import useInput from "../../hooks/use-input-reducer";
import styles from "./BasicForm.module.css";

const isNotEmpty = value => value.trim() !== '';
const isEmailFormat = value => value.includes('@');

const BasicForm = () => {
  const {
    value : firstName,
    isValid : firstnameIsValid,
    hasError : firstNameHasError,
    valueChangeHandler: firstNameChangeHandler,
    valueInputBlurHandler: firstNameBlurHandler,
    reset: resetFirstName,
  } = useInput(isNotEmpty);

  const {
    value : lastName,
    isValid : lastnameIsValid,
    hasError : lastNameHasError,
    valueChangeHandler: lastNameChangeHandler,
    valueInputBlurHandler: lastNameBlurHandler,
    reset: resetLastName,
  } = useInput(isNotEmpty);

  const {
    value : email,
    isValid : emailIsValid,
    hasError : emailHasError,
    valueChangeHandler: emailChangeHandler,
    valueInputBlurHandler: emailBlurHandler,
    reset: resetEmail,
  } = useInput(isEmailFormat);

  let formIsValid = false;

  if( firstnameIsValid && lastnameIsValid && emailIsValid ){
    formIsValid = true;
  }   

  const firstNameInputClasses = firstNameHasError ? `${styles['form-control']} ${styles['invalid']}` : styles['form-control'];
  const lastNameInputClasses = lastNameHasError ? `${styles['form-control']} ${styles['invalid']}` : styles['form-control'];
  const emailInputClasses = emailHasError ? `${styles['form-control']} ${styles['invalid']}` : styles['form-control'];

  const submitHandler = (e) => {
    e.preventDefault();

    if( !firstnameIsValid || !lastnameIsValid || !emailIsValid ){
      return;
    }
    console.log(firstName, lastName, email);

    resetFirstName();
    resetLastName();
    resetEmail();
  }

  return (
    <div className={styles.background}>
      <div className={styles.app}>
        <form onSubmit={submitHandler}>
          <div className={styles["control-group"]}>
            <div className={firstNameInputClasses}>
              <label htmlFor='name'>First Name</label>
              <input 
                type='text' 
                id='name' 
                onChange={firstNameChangeHandler} 
                onBlur={firstNameBlurHandler}
                value={firstName}
              />
              { firstNameHasError && <p>Please enter a first name.</p> }
            </div>
            <div className={lastNameInputClasses}>
              <label htmlFor='name'>Last Name</label>
              <input 
                type='text' 
                id='name' 
                onChange={lastNameChangeHandler} 
                onBlur={lastNameBlurHandler}
                value={lastName}
              />
              { lastNameHasError && <p>Please enter a last name.</p> }
            </div>
          </div>
          <div className={emailInputClasses}>
            <label htmlFor='name'>E-Mail Address</label>
            <input 
              type='text' 
              id='name'
              onChange={emailChangeHandler}
              onBlur={emailBlurHandler}
              value={email} 
            />
            { emailHasError && <p>Please enter a email.</p> }
          </div>
          <div className={styles['form-actions']}>
            <button disabled={!formIsValid}>Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicForm;
