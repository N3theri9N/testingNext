import style from './ExpenseItem.module.css';
import ExpenseDate from './ExpenseDate';
import Card from '../UI/Card'
import { useState } from 'react';

const ExpenseItem = (props) => {  
  const [ expenseTitle, setExpenseTitle ] = useState(props.title);

  const { 
    date:expenseDate, 
    amount:expenseAmount
  } = props;

  const clickHandler = () => {
    setExpenseTitle("updated!");
  }

  return (
  <Card className={style.expenseItem}>
    <ExpenseDate expenseDate={expenseDate}/>
    <div className={style.expenseItemDescription}>
      <h2>{expenseTitle}</h2>
      <div className={style.expenseItemPrice}>${expenseAmount}</div>
    </div>
    {/* <button onClick={clickHandler}>ChangeTitle</button> */}
  </Card>)
}

export default ExpenseItem;