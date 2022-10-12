import style from './ExpenseDate.module.css'

function ExpenseDate(props){

  const { expenseDate } = props;
  const month = expenseDate.toLocaleString("en-US", {month: 'long'});
  const day = expenseDate.toLocaleString("en-US", {day : '2-digit'});
  const year = expenseDate.getFullYear();

  return (
    <div className={style.expenseDate}>
      <div className={style.expenseDateMonth}>{month}</div>
      <div className={style.expenseDateYear}>{year}</div>
      <div className={style.expenseDateDay}>{day}</div>
    </div>
  )
}

export default ExpenseDate;