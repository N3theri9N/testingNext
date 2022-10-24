import styles from "./Header.module.css";
import HeaderCartButton from "../UI/HeaderCartButton";

const Header = ( props ) => {
  return (<>
    <header className={styles.header}>
      <h1>ReactMeals</h1>
      <HeaderCartButton showCartFn={props.showCartFn} />
    </header>
    <div className={styles['main-image']}>
      <img src={"/meals.jpg"} alt="A table full of delicious food!" />
    </div>
  </>)
}

export default Header;