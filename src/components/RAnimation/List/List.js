import React, { Component } from "react";
import TransitionGroup from "react-transition-group/TransitionGroup";
import CSSTransition from "react-transition-group/CSSTransition";

import classes from "./List.module.css";

class List extends Component {
  state = {
    items: [1, 2, 3],
  };

  addItemHandler = () => {
    this.setState((prevState) => {
      return {
        items: prevState.items.concat(prevState.items.length + 1),
      };
    });
  };

  removeItemHandler = (selIndex) => {
    this.setState((prevState) => {
      return {
        items: prevState.items.filter((item, index) => index !== selIndex),
      };
    });
  };

  render() {
    const listItems = this.state.items.map((item, index) => (
      <CSSTransition
        key={index}
        classNames={{
          enter: classes["FadeEnter"],
          enterActive: classes["FadeEnterActive"],
          exit: classes["FadeExit"],
          exitActive: classes["FadeExitActive"],
        }}
        timeout={300}
      >
        <li
          className={classes.ListItem}
          onClick={() => this.removeItemHandler(index)}
        >
          {item}
        </li>
      </CSSTransition>
    ));

    return (
      <div>
        <button className={classes.Button} onClick={this.addItemHandler}>
          Add Item
        </button>
        <p>Click Item to Remove.</p>
        <TransitionGroup component="ul" className={classes.List}>
          {listItems}
        </TransitionGroup>
      </div>
    );
  }
}

export default List;
