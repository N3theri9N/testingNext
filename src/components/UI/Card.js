import style from './Card.module.css';

const Card = (props) => {
  const classes = props.className;

  return <div className={`${style.card} ${classes}`}>{props.children}</div>;
}

export default Card;