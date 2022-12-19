import React from "react";

import classes from "./Modal.module.css";
import Transition from "react-transition-group/Transition";
import CSSTransition from "react-transition-group/CSSTransition";

const animationTiming = {
  enter: 400,
  exit: 1000,
};

const modal = (props) => {
  return (
    <CSSTransition
      in={props.show}
      timeout={animationTiming}
      mountOnEnter
      unmountOnExit
      classNames={{
        enterActive: classes['ModalOpen'],
        // enterDone: classes[''],
        exitActive: classes['ModalClosed'],
        // exitDone: classes[''],
      }}
    >
      <div className={classes.Modal}>
        <h1>A Modal</h1>
        <button className="Button" onClick={props.closed}>
          Dismiss
        </button>
      </div>
    </CSSTransition>
  );
};

export default modal;
