import styles from "./AvailableMeals.module.css";
import Cards from "../UI/Cards";
import MealItem from "./MealItem/MealItem";

const DUMMY_MEALS = [
  {
    id: 'm1',
    name: 'Sushi',
    description: 'Finest fish and veggies',
    price: 22.99,
  },
  {
    id: 'm2',
    name: 'Schnitzel',
    description: 'A german specialty!',
    price: 16.5,
  },
  {
    id: 'm3',
    name: 'Barbecue Burger',
    description: 'American, raw, meaty',
    price: 12.99,
  },
  {
    id: 'm4',
    name: 'Green Bowl',
    description: 'Healthy...and green...',
    price: 18.99,
  },
];

const AvailableMeals = () => {
  const mealsList = DUMMY_MEALS.map((meal)=> {
    return (
        <MealItem 
          key={meal.id}
          id={meal.id}
          mealName={meal.name}
          mealPrice={meal.price}
          mealDescription={meal.description}
        />
      )
  });

  return (
    <section className={styles.meals}>
      <Cards>
        <ul>
          {mealsList}
        </ul>
      </Cards>
    </section>
  );
}

export default AvailableMeals;