import styles from "./Modal.module.css";
import ReactDOM from "react-dom";

const Backdrop = props => {
  return <div className={styles.backdrop} onClick={props.hideCartFn}/>
};

const ModalOverlay = props => {
  return <div className={styles.modal}>
    <div className={styles.content}>{props.children}</div>
  </div>
};

//const portalElement = document.getElementById("overlays");

const Modal = (props) => {
  return <>
    {ReactDOM.createPortal(<Backdrop hideCartFn={props.hideCartFn} />, document.getElementById("overlays"))}
    {ReactDOM.createPortal(<ModalOverlay>{props.children}</ModalOverlay>,  document.getElementById("overlays"))}
  </>
}

export default Modal;