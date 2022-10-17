import Card from "../UI/Card";
import styles from "./UsersList.module.css"

const UsersList = (props) => {  
  return (
  <Card className={styles.users}>
    <ul>
      {props.users.map(user => {return (
        <li key={Math.random()*1000000000}>
          {`${user.name} (${user.age} years old)`}
        </li>
      )
      })}
    </ul> 
  </Card>)
}

export default UsersList;