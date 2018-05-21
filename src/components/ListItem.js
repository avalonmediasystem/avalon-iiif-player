import React from 'react';
import List from './List';
import IIIFParser from '../services/iiif-parser';

const iiifParser = new IIIFParser();

const ListItem = props => {
  const { item, handleItemClick } = props;
  const childCanvases = iiifParser.getChildCanvases(item);
  const subMenu =
    item.items && item.items.length > 0 && childCanvases.length === 0 ? (
      <List items={item.items} handleItemClick={handleItemClick} />
    ) : null;

  const handleClick = e => {
    e.stopPropagation();
    e.preventDefault();
    handleItemClick(e.target.href);
  };

  const renderListItem = () => {
    const label = item.label || 'Canvas item with no label';

    if (childCanvases.length > 0) {
      return childCanvases.map(canvasItem => <a key={canvasItem.id} href={canvasItem.id}>{label}</a>);
    } else {
      return label;
    }
  }

  return (
    <li onClick={handleClick}>
      {renderListItem()}
      {subMenu}
    </li>
  );
};

export default ListItem;
