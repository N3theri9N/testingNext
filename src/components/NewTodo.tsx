import { useRef, useContext } from "react";
import style from "./NewTodo.module.css"

import { TodosContext } from "../store/todos-context";

const NewTodo: React.FC = () => {
  
  const todosCtx = useContext(TodosContext);  
  
  const todoTextInputRef = useRef<HTMLInputElement>(null);
  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();

    const enteredText = todoTextInputRef.current!.value;
    if(enteredText.trim().length === 0){
      // throw an error
      return;
    }

    todosCtx.addTodo(enteredText);
  } 

  return (
  <form onSubmit={submitHandler} className={style.form}>
    <label htmlFor="text">Todo text</label>
    <input type='text' id='text' ref={todoTextInputRef} />
    <button >Add Todo</button>
  </form>
  )
} 

export default NewTodo;