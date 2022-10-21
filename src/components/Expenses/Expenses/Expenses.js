import style from "./Expenses.module.css"
import ExpenseFilter from "./ExpenseFilter";
import ExpensesList from "./ExpensesList";
import ExpensesChart from "./ExpenseChart";
import Card from "../UI/Card";
import {useState} from 'react';

const Expenses = (props) => {
  
  const [ filterYear, setFilterYear ] = useState('2020');
  const { items:expenses } = props;

  const setFilterHandler = newYear => {
    setFilterYear(newYear);
  }

  const filteredExpenses = expenses.filter((item)=> {return item.date.getFullYear().toString() === filterYear })
  
  return (
    <Card className={style.expenses}>
      <ExpenseFilter selected={filterYear} onChangeYear={setFilterHandler} />
      <ExpensesChart expenses={filteredExpenses} />
      <ExpensesList items={filteredExpenses} />
    </Card>
  )
}

export default Expenses;