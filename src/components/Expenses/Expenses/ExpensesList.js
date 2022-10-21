import style from "./ExpensesList.module.css";
import ExpenseItem from "./ExpenseItem";

const ExpensesList = (props) => {
  
  if ( props.items.length === 0 ){
    return (
      <h2 className={style.expensesListFallback}>No Expense Found</h2>
    )
  }

  return (<ul className={style.expensesList}>
     { props.items.map((item) => { return (
        <ExpenseItem 
          key={item.id}
          title={item.title} 
          amount={item.amount} 
          date={item.date} />)
      })}
    </ul>);
}

export default ExpensesList;