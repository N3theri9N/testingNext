import ReactDom from 'react-dom';

import styles from './ErrorModal.module.css';

import Card from './Card';
import Button from './Button';

const Backdrop = (props) => {
  return <div className={styles.backdrop} onClick={props.onConfirm} />;
};

const ModalOverlay = (props) => {
  return (
  <Card className={styles.modal}>
    <header className={styles.header}>
      <h2>{props.title}</h2>
    </header>
    <div className={styles.content}>
      <p>{props.message}</p>
    </div>
    <footer className={styles.actions}>
      <Button onClick={props.onConfirm}>Close</Button>
    </footer>
  </Card>);
}

const ErrorModal = (props) => {
  return (
  <>
    {ReactDom.createPortal(
      <Backdrop onConfirm={props.onConfirm} />, 
      document.getElementById("backdrop-root")
    )}
    {ReactDom.createPortal(
      <ModalOverlay 
        onConfirm={props.onConfirm} 
        title={props.title}
        message={props.message}
        />, 
      document.getElementById("overlay-root")
    )}
  </>)
};
export default ErrorModal;