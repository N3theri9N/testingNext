import { configureStore } from '@reduxjs/toolkit';

import counterReducer from './counter';
import authReducer from './auth';

const store = configureStore({
  reducer : { 
    counter: counterReducer, 
    auth: authReducer
  },
});

export default store;


// import { createStore } from 'redux';

// const counterReducer = ( state = initialState , action ) => {

//   if(action.type === 'increment'){
//     return {
//       counter : state.counter + 1,
//       showCounter : state.showCounter
//     }
//   } else if(action.type === 'decrement') {
//     return {
//       counter : state.counter - 1,
//       showCounter : state.showCounter
//     }
//   } else if(action.type === 'increase') {
//     return {
//       counter : state.counter + action.amount,
//       showCounter : state.showCounter
//     }
//   } else if(action.type === 'toggle'){
//     return {
//       counter: state.counter,
//       showCounter : !state.showCounter
//     }
//   }
//   return state;
// }
