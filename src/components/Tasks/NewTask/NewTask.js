import { useState } from 'react';
import useTasksHttp from '../../../hooks/use-tasks-http';

import Section from '../UI/Section';
import TaskForm from './TaskForm';

const NewTask = (props) => {
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

  const {isLoading, error, sendRequest: sendTaskRequest } = useTasksHttp()

  const dataCallback = (taskText, data) =>{
    const generatedId = data.name;
    const createdTask = { id: generatedId, text: taskText };
    
    props.onAddTask(createdTask);
  }

  const enterTaskHandler = async (taskText) => {
    sendTaskRequest({
      url: "https://react-post-de8f7-default-rtdb.firebaseio.com/tasks.json",
      method: 'POST',
      body: {text: taskText},
      headers :{
        'Content-Type': 'application/json',
      }
    }, dataCallback.bind(null, taskText));
  };
    // setIsLoading(true);
    // setError(null);
    // try {
    //   const response = await fetch(
    //     'https://react-post-de8f7-default-rtdb.firebaseio.com/tasks.json',
    //     {
    //       method: 'POST',
    //       body: JSON.stringify({ text: taskText }),
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     }
    //   );

    //   if (!response.ok) {
    //     throw new Error('Request failed!');
    //   }

    //   const data = await response.json();

    //   const generatedId = data.name; // firebase-specific => "name" contains generated id
    //   const createdTask = { id: generatedId, text: taskText };

    //   props.onAddTask(createdTask);
    // } catch (err) {
    //   setError(err.message || 'Something went wrong!');
    // }
    // setIsLoading(false);
  // };

  return (
    <Section>
      <TaskForm onEnterTask={enterTaskHandler} loading={isLoading} />
      {error && <p>{error}</p>}
    </Section>
  );
};

export default NewTask;
