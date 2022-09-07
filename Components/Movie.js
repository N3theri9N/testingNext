import React from "react";
import PropTypes from "prop-types";
import styles from './Movies.module.css';
import Link from "next/link";

const Movie = ({ id, year, title, summary, poster, genres }) => {
  return (
    <div className={styles.movie}>
      <Link href={{
        pathname : '/movie-detail',
        //query: { props : JSON.stringify({year, title, summary, poster, genres}) }
        query : { title }
      }}>
        <div>
          <img className={styles.movie__img} src={poster} alt={title} title={title} />
          <div className={styles.movie__data}>
            <h3 className={styles.movie__title}>{title}</h3>
            <h5 className={styles.movie__year}>{year}</h5>
            <p className={styles.movie__summary}>{summary.slice(0, 180)}...</p>
            <ul className={styles.movie__genres}>
              {genres.map((genre, i) => {
                return <li key={i} className={styles.movie__genre}>{genre}</li>;
              })}
            </ul>
          </div>
        </div>
      </Link>
    </div>
  );
}

Movie.propTypes = {
  id: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  poster: PropTypes.string.isRequired,
  genres: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Movie;