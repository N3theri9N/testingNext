import style from './TodoItem.module.css';

const TodoItem: React.FC<{ text:string, onRemoveTodo: () => void }> = (props) => {
  //onRemoveTodo: ( React.MouseEvent) => void 도 가능
  return <li className={style.item} onClick={props.onRemoveTodo}>{props.text}</li>
};

export default TodoItem;