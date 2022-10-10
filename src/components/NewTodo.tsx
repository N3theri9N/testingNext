import { useRef } from "react";
import style from "./NewTodo.module.css"

const NewTodo: React.FC<{onAddTodo: (text: string) => void }> = (props) => {
  const todoTextInputRef = useRef<HTMLInputElement>(null);
  
  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();

    const enteredText = todoTextInputRef.current!.value;
    if(enteredText.trim().length === 0){
      // throw an error
      return;
    }

    props.onAddTodo(enteredText);
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