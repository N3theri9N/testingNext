import style from "./NewExpense.module.css";
import { useState } from 'react';
import ExpenseForm from "./ExpenseForm";

const NewExpense = (props) => {

  const [hidden, setHidden] = useState(true);

  const saveExpenseDatahandler = (enteredExpenseData) => {
    const expenseData = {
      ...enteredExpenseData,
      id: Math.random().toString()
    }
    props.onAddExpense(expenseData)
  }

  const hideHandler = () => {
    setHidden(true);
  }
  const showHandler = () => {
    setHidden(false);
  }

  return (
    <div className={style.newExpense}>
      { hidden && <button onClick={showHandler}>Add New Expense</button>} 
      { !hidden && <ExpenseForm onSaveExpenseData={saveExpenseDatahandler} hideHandler={hideHandler}/> }
    </div>
  )
}

export default NewExpense;