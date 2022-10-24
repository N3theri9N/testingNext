import React, { useState, useEffect , useCallback } from 'react';

import MoviesList from './components/Movie/MoviesList';
import AddMovie from './components/Movie/AddMovie';

//import './MovieApp.css';

function App() {
  const [ movies, setMovies] = useState([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState(null);

  const fecthMovies = useCallback ( async () => {
    setIsLoading(true);
    setError(null);
    try {
      //const response = await fetch('https://swapi.dev/api/films'); 
  
      const response = await fetch('https://react-post-de8f7-default-rtdb.firebaseio.com/movies.json'); 
      
      if(!response.ok){
        throw new Error('Something went wrong!');
      }
      const data = await response.json();
      
      // const transformedMovies = data.results.map(movieData => {
      //   return { 
      //     id: movieData.episode_id,
      //     title: movieData.title,
      //     openingText: movieData.opening_crawl,
      //     releaseDate: movieData.release_date
      //   }
      // });
      // setMovies(transformedMovies);

      const loadedMovies = [];

      for( const key in data){
        loadedMovies.push({
          id: key,
          title: data[key].title,
          openingText: data[key].openingText,
          releaseDate: data[key].releaseDate,
        })
      }
      setMovies(loadedMovies);
    } catch(error) {
      setError(error.message); // error.message 는 위의 Error 객체의 텍스트이다.
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fecthMovies();
  }, [fecthMovies]);
  
  const addMovieHandler = async (movie) => {
    try{ 
      const response = await fetch('https://react-post-de8f7-default-rtdb.firebaseio.com/movies.json', {
        method: 'POST',
        body: JSON.stringify(movie),
        headers: {
          'Content-Type' : 'application/json'
        }
      }); 
      
      if(!response.ok){
        throw new Error('Something went wrong!');
      }
      const data = await response.json();
      setMovies([...movies, {...movie, id : data.name}]);
      console.log(data);
    } catch (error) {
      setError(error.message);
    }
  }

  let content = <p>Found no movies.</p>;

  if( movies.length > 0 ){
    content = <MoviesList movies={movies} /> 
  }

  if(error){
    content = <p>{error}</p>;
  }

  if(isLoading){
    content = <p>Loading...</p>;
  }

  return (
    <React.Fragment>
      <section>
        <AddMovie onAddMovie={addMovieHandler} />
      </section>
      <section>
        <button onClick={fecthMovies}>Fetch Movies</button>
      </section>
      <section>
        {content}
      </section>
    </React.Fragment>
  );
}

export default App;
