import React from 'react';

class State extends React.Component {
  state = {
    totalClick : 0,
    count : 0,
  }

  addTotal = () => {
    this.setState(current => ({ 
      totalClick : current.totalClick + 1
    }))
  }

  add = () => {
    this.addTotal();
    this.setState(current => ({
      ...current,
      count : current.count+1
    }))
  }

  minus = () => {
    this.addTotal();
    this.setState(current => ({
      ...current,
      count : current.count-1
    }))
  }

  render(){ 
    return ( 
    <div>
      <h1>The number is : {this.state.count}</h1>
      <h1>You have clicked : {this.state.totalClick}</h1>
      <button onClick={this.add}>Add</button>
      <button onClick={this.minus}>Minus</button>
    </div>
    );
  }
}

export default State;