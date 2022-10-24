import styles from "./Cards.module.css";

const Cards = ( props ) => {
  return (<div className={styles.card}>
    {props.children}
  </div>)
}

export default Cards;