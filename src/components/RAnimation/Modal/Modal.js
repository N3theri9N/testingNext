import React from "react";

import classes from "./Modal.module.css";

const modal = (props) => {
  return (
    <div
      className={`${classes.Modal} ${
        props.show === "entering"
          ? classes.ModalOpen
          : props.show === "exiting" && classes.ModalClosed 
      }`}
    >
      <h1>A Modal</h1>
      <button className="Button" onClick={props.closed}>
        Dismiss
      </button>
    </div>
  );
};

export default modal;
