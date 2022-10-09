import { useState } from 'react';

import Todos from './components/Todos';
import NewTodo from './components/NewTodo';
import Todo from './models/todo';

function App() {

  const [todos, setTodos] = useState<Todo[]>([])
  
  const onAddTodo = (text: string) =>{
    const newTodo = new Todo(text);

    setTodos((prevTodos) => {
      return prevTodos.concat(newTodo);
    })
  }

  return (
    <div>
      <NewTodo onAddTodo={onAddTodo} />
      <Todos items={todos} />
    </div>
  );
}

export default App;
