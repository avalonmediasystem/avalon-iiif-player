import React, { Component } from 'react';
import List from './List';

class StructuredNav extends Component {
  constructor(props) {
    super(props);
    this.manifest = this.props.manifest;
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
