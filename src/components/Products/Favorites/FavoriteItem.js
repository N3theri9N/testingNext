import React from 'react';

import Card from '../UI/Card';
import classes from './FavoriteItem.module.css';

const FavoriteItem = props => {
  return (
    <Card style={{ marginBottom: '1rem' }}>
      <div className={classes["favorite-item"]}>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </div>
    </Card>
  );
};

export default FavoriteItem;
