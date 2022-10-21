import { useState } from 'react';

import AddUser from './components/UserList/Users/AddUser';
import UsersList from './components/UserList/Users/UsersList';

function UserApp() {
  const [ usersList, setUsersList ] = useState([]);

  const addUserHandler = (userName, userAge) => {
    setUsersList(prevState => [{name: userName, age: userAge} ,...prevState])
  }

  return (
    <div>
      <AddUser onAddUser={addUserHandler} />
      <UsersList users={usersList} />
    </div>
  );
}

export default UserApp;