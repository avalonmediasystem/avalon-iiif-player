import React from 'react';
import ListItem from './ListItem';
import PropTypes from 'prop-types';

const List = props => {
  return (
    <ul>
      {props.items.map(item => (
        <ListItem
          key={item.id}
          item={item}
        />
      ))}
    </ul>
  );
};

List.propTypes = {
  items: PropTypes.array.isRequired
}

export default List;
