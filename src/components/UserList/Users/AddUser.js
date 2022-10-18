import { useState, useRef } from 'react';

import Button from "../UI/Button";
import Card from "../UI/Card";
import ErrorModal from "../UI/ErrorModal";

import styles from "./AddUser.module.css";

const AddUser = (props) => {
  const nameInputRef = useRef();
  const ageInputRef = useRef();

  // const [ enteredUserName, setEnteredUserName ] = useState("");
  // const [ enteredUserAge, setEnteredUserAge ] = useState("");
  const [ error, setError ] = useState();

  const onSubmitHandler = (e) => {
    e.preventDefault();

    const enteredName = nameInputRef.current.value;
    const enteredAge = ageInputRef.current.value;

    if( enteredName.trim().length === 0 || enteredAge.trim().length === 0){
      setError({
        title: 'Invalid input',
        message: 'Please enter a valid name and age (non-empty values).'
      });
      return;
    }
    if(parseInt(enteredAge) < 1){
      setError({
        title: 'Invalid input',
        message: 'Please enter a valid age (over than 0).'
      });
      return;
    }

    props.onAddUser(enteredName, enteredAge);

    // setEnteredUserName('');
    // setEnteredUserAge('');
    nameInputRef.current.value = "";
    ageInputRef.current.value = "";
  }
  
  // const userNameChangedHandler = (e) => {
  //    setEnteredUserName(e.target.value);
  // }

  // const userAgeChangedHandler = (e) => {
  //   setEnteredUserAge(e.target.value)
  // }

  const errorHandler = () => {
    setError(null);
  }

  return (
    <>
      {error && <ErrorModal title={error.title} message={error.message} onConfirm={errorHandler} />}
      <Card className={styles.input}>
        <form onSubmit={onSubmitHandler}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            // value={enteredUserName}
            // onChange={userNameChangedHandler} 
            ref={nameInputRef} />
          <label htmlFor="age">Age (Years)</label>
          <input
            id="age"
            type="number"
            min = {1}
            // value={enteredUserAge}
            // onChange={userAgeChangedHandler} 
            ref={ageInputRef} />
          <Button type="submit">Add User</Button>
        </form>
      </Card>
    </>
  )
};

export default AddUser;