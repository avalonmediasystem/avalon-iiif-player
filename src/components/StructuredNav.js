import React, { Component } from 'react';
import IIIFParser from '../services/iiif-parser';

const List = props => {
  return (
    <ul>
      {props.items.map(item => (
        <ListItem
          key={item.id}
          item={item}
          handleItemClick={props.handleItemClick}
        />
      ))}
    </ul>
  );
};

const ListItem = props => {
  const { item, handleItemClick } = props;
  const subMenu =
    item.items && item.items.length > 0 ? (
      <List items={item.items} handleItemClick={handleItemClick} />
    ) : null;

  const handleClick = e => {
    e.stopPropagation();
    handleItemClick(item.id);
  };

  return (
    <li onClick={handleClick}>
      {item.label || 'Canvas item'}
      {subMenu}
    </li>
  );
};

class StructuredNav extends Component {
  constructor(props) {
    super(props);
    this.iiifParser = new IIIFParser();
    this.manifest = this.props.manifest;

    this.state = {
      html: ''
    };
  }

  handleItemClick(id) {
    console.log('clicked id', id);
  }

  render() {
    return (
      <List
        items={this.manifest.structures}
        handleItemClick={this.handleItemClick}
      />
    );
  }
}

export default StructuredNav;
