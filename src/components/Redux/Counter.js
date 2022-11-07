import classes from './Counter.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { counterActions } from '../../store/Redux/counter';

const Counter = () => {
  const dispatch = useDispatch();

  const counter = useSelector(state => state.counter.counter);
  const show = useSelector(state => state.counter.showCounter);

  const toggleCounterHandler = () => {
    // dispatch({ type: 'toggle' })
    dispatch(counterActions.toggleCounter());
  };

  const incrementHandler = () => {
    // dispatch({ type: 'increment'})
    dispatch(counterActions.increment());
  };

  const decrementHandler = () => {
    // dispatch({ type: 'decrement'})
    dispatch(counterActions.decrement());
  };

  const increaseHandler = () => {
    // dispatch({
    //   type:'increase',
    //   amount: 5,
    // })
    dispatch(counterActions.increse(5))
  }

  return (
    <main className={classes.counter}>
      <h1>Redux Counter</h1>
      { show && <div className={classes.value}>{ counter }</div> }
      <div>
        <button className={classes.btn} onClick={incrementHandler}>Increment</button>
        <button className={classes.btn} onClick={increaseHandler}>Increse by 5</button>
        <button className={classes.btn} onClick={decrementHandler}>Decrement</button>
      </div>
      <button className={classes.btn} onClick={toggleCounterHandler}>Toggle Counter</button>
    </main>
  );
};

// import { connect } from 'react-redux';
// import { Component } from 'react';

// class Counter extends Component {

//   incrementHandler = () => {
//     this.props.increment()
//   };

//   decrementHandler = () => {
//     this.props.decrement()
//   };

//   render () {
//     return (
//       <main className={classes.counter}>
//         <h1>Redux Counter</h1>
//         <div className={classes.value}>{ this.props.counter }</div>
//         <div>
//           <button className={classes.btn} onClick={this.incrementHandler}>Increment</button>
//           <button className={classes.btn} onClick={this.decrementHandler}>Decrement</button>
//         </div>
//         <button className={classes.btn} >Toggle Counter</button>
//       </main>
//     );
//   };

// }

//   const mapStateToProps = state => {
//     return {
//       counter: state.counter
//     };
//   }

//   const mapDispatchToProps = dispatch => {
//     return {
//       increment: () => dispatch({type: 'increment'}),
//       decrement: () => dispatch({type: 'decrement'})
//     }
//   }

//   export default connect(mapStateToProps, mapDispatchToProps )(Counter);
export default Counter;