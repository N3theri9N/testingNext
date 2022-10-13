import style from "./Expenses.module.css"
import ExpenseItem from "./ExpenseItem";
import ExpenseFilter from "./ExpenseFilter";
import Card from "../UI/Card";
import {useState} from 'react';

const Expenses = (props) => {
  
  const [ filterYear, setFilterYear ] = useState('2020');
  const { items:expenses } = props;

  const setFilterHandler = newYear => {
    setFilterYear(newYear);
  }

  return (
    <Card className={style.expenses}>
      <ExpenseFilter selected={filterYear} onChangeYear={setFilterHandler} />
       {expenses.filter((item)=> {return item.date.getFullYear() == filterYear }).map((item) => { return (
        <ExpenseItem 
          key={item.id}
          title={item.title} 
          amount={item.amount} 
          date={item.date} />)
      } )}
    </Card>
  )
}

export default Expenses;