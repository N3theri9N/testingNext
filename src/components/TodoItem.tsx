import style from './TodoItem.module.css';

const TodoItem: React.FC<{ text:string }> = (props) => {
  return <li className={style.item}>{props.text}</li>
};

export default TodoItem;