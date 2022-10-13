import style from "./Expenses.module.css"
import ExpenseItem from "./ExpenseItem";
import Card from "../UI/Card";

const Expenses = (props) => {
  
  const { items:expenses } = props;

  return (
    <Card className={style.expenses}>
       {expenses.map((item) => { return (
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