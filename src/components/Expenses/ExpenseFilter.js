import style from './ExpenseFilter.module.css';

const ExpensesFilter = (props) => {

  const selectHandler = (event) => {
    props.onChangeYear(event.target.value);
  }

  return (
    <div className={style.expensesFilter}>
      <div className={style.expensesFilterControl}>
        <label>Filter by year</label>
        <select value={props.selected} onChange={selectHandler}>
          <option value='2022'>2022</option>
          <option value='2021'>2021</option>
          <option value='2020'>2020</option>
          <option value='2019'>2019</option>
        </select>
      </div>
    </div>
  );
};

export default ExpensesFilter;