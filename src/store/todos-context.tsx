import React, { useState } from 'react';
import Todo from '../models/todo';

type TodosContextObj = { 
  items: Todo[];
  addTodo: (text: string) => void;
  removeTodo: (id: string) => void;
}

export const TodosContext = React.createContext<TodosContextObj>({
  items: [],
  addTodo: () => {},
  removeTodo: (id: string) => {}
});

//컨텍스트를 제공하는 컴포넌트 여기서 stats 를 관리
const TodosContextProvider: React.FC<{ children: any }> = (props) => {

  const [todos, setTodos] = useState<Todo[]>([])
  
  const onAddTodo = (text: string) =>{
    const newTodo = new Todo(text);

    setTodos((prevTodos) => {
      return prevTodos.concat(newTodo);
    })
  }

  // 여기에 state 가 관리되고 있으므로 함수는 여기서 정의한다.
  // 어느것을 삭제할지 식별할 방법도 정의한다.
  const removeTodoHandler = (todoId: String) => {
    //id 로 식별한다.
    setTodos((prevTodos)=>{
      return prevTodos.filter(todo => todo.id !== todoId);
    })
  }
  
  const contextValue: TodosContextObj = {
    items: todos,
    addTodo: onAddTodo,
    removeTodo: removeTodoHandler,
  }

  return <TodosContext.Provider value={contextValue}>{props.children}</TodosContext.Provider>
}

export default TodosContextProvider;
/* 
타입스크립트와 컨텍스트 API

*/