import classes from './ProfileForm.module.css';
import { useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../../../store/Authentication/auth-context';

const ProfileForm = () => {
  const newPasswordInputRef = useRef();
  const history = useHistory();
  const authCtx = useContext(AuthContext);

  const submitHandler = event => {
    event.preventDefault();

    const enteredNewPassword = newPasswordInputRef.current.value;
    
    // addValidation
    const idToken = authCtx.token;

     fetch('https://identitytoolkit.googleapis.com/v1/accounts:update?key=AIzaSyCvg2hs_OBGALO3daVcKdVbJJYnbqm_5XU',{
      method: 'POST',
      body: JSON.stringify({
        idToken: idToken,
        password: enteredNewPassword, 
        returnSecureToken: false,
      }),
      headers :{
        'Content-Type': 'application/json',
      }
     }).then(res=>{
        history.replace('../')
     }).then(data => {

     }).catch(err => {
      alert(err.message)
     })

  }

  return (
    <form className={classes.form} onSubmit={submitHandler}>
      <div className={classes.control}>
        <label htmlFor='new-password'>New Password</label>
        <input type='password' id='new-password' ref={newPasswordInputRef} />
      </div>
      <div className={classes.action}>
        <button>Change Password</button>
      </div>
    </form>
  );
}

export default ProfileForm;
