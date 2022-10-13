import style from './ExpenseItem.module.css';
import ExpenseDate from './ExpenseDate';
import Card from '../UI/Card'

const ExpenseItem = (props) => {
  const { 
    date:expenseDate, 
    title:expenseTitle, 
    amount:expenseAmount
  } = props;

  return (
  <Card className={style.expenseItem}>
    <ExpenseDate expenseDate={expenseDate}/>
    <div className={style.expenseItemDescription}>
      <h2>{expenseTitle}</h2>
      <div className={style.expenseItemPrice}>${expenseAmount}</div>
    </div>
  </Card>)
}

export default ExpenseItem;