import style from "./NewExpense.module.css";
import ExpenseForm from "./ExpenseForm";

const NewExpense = (props) => {
  const saveExpenseDatahandler = (enteredExpenseData) => {
    const expenseData = {
      ...enteredExpenseData,
      id: Math.random().toString()
    }
    props.onAddExpense(expenseData)
  }

  return (
    <div className={style.newExpense}>
      <ExpenseForm onSaveExpenseData={saveExpenseDatahandler} />
    </div>
  )
}

export default NewExpense;