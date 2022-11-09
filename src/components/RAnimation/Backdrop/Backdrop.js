import React from "react";

import classes from "./Backdrop.module.css";

const backdrop = (props) => {
  return (
    <div
      className={`${classes.Backdrop} ${
        props.show ? classes.BackdropOpen : classes.BackdropClosed
      }`}
    ></div>
  );
};

export default backdrop;
