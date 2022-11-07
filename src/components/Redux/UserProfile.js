import classes from './UserProfile.module.css';
import { useSelector } from 'react-redux';

const UserProfile = () => {
  const isAuth = useSelector(state => state.auth.isAuthenticated);
  
  const userProfile = isAuth && 
  <main className={classes.profile}>
  <h2>My User Profile</h2>
  </main> 
  
  return (
    <>
    { userProfile }
    </>
  );
};

export default UserProfile;
