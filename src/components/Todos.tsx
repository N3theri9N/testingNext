import React, { useContext } from "react";

import TodoItem from './TodoItem';
import { TodosContext } from "../store/todos-context";
import style from './Todos.module.css'

const Todos: React.FC = () => {
  
  const todosCtx = useContext(TodosContext);
  
  return (
  <ul className={style.todos}>
    {todosCtx.items.map((item) => (
      <TodoItem 
      key={item.id} 
      text={item.text}
      onRemoveTodo={todosCtx.removeTodo.bind(null, item.id)} />
      // App.js 에서 선언한 함수는 여기서 실행. 
      // bind 는 알아볼 것!
    ))}
  </ul>
  );
}

export default Todos;