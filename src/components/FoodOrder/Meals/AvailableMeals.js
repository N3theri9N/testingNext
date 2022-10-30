import styles from "./AvailableMeals.module.css";
import Cards from "../UI/Cards";
import MealItem from "./MealItem/MealItem";

import { useEffect, useState } from "react";

// const DUMMY_MEALS = [
//   {
//     id: 'm1',
//     name: 'Sushi',
//     description: 'Finest fish and veggies',
//     price: 22.99,
//   },
//   {
//     id: 'm2',
//     name: 'Schnitzel',
//     description: 'A german specialty!',
//     price: 16.5,
//   },
//   {
//     id: 'm3',
//     name: 'Barbecue Burger',
//     description: 'American, raw, meaty',
//     price: 12.99,
//   },
//   {
//     id: 'm4',
//     name: 'Green Bowl',
//     description: 'Healthy...and green...',
//     price: 18.99,
//   },
// ];

const AvailableMeals = () => {

  const [ meals, setMeals ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState();

  useEffect(() => {
    setIsLoading(true);
    const fetchMeals = async () => { 
      const response = await fetch('https://react-post-de8f7-default-rtdb.firebaseio.com/meals.json');
      if(!response.ok){
        throw new Error('Something went wrong!');
      }
      
      const responseData = await response.json();
      
      const loadedMeals = [];

      for ( const key in responseData ){
        loadedMeals.push({
          id: key,
          ...responseData[key]
        });
      }
      setIsLoading(false);
      setMeals(loadedMeals);
    };

    fetchMeals().catch((e)=>{
      setIsLoading(false);
      setError(e.message);
    })

    return (() => {});
  }, []);


  if(error){
    return <section className={styles.MealsError}>
      <p>{error}</p>
    </section>
  }
  if(isLoading){
    return <p className={styles.MealsLoading}>Loading...</p>
  }

  const mealsList = meals.map((meal)=> {
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