import style from './ExpenseItem.module.css';
import ExpenseDate from './ExpenseDate';

function ExpenseItem (props){
  const { 
    date:expenseDate, 
    title:expenseTitle, 
    amount:expenseAmount
  } = props;

  return (<div className={style.expenseItem}>
    <ExpenseDate expenseDate={expenseDate}/>
    <div className={style.expenseItemDescription}>
      <h2>{expenseTitle}</h2>
      <div className={style.expenseItemPrice}>${expenseAmount}</div>
    </div>
  </div>)
}

export default ExpenseItem;