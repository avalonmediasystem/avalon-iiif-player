import React, { Component } from 'react';
import IIIFParser from '../services/iiif-parser';

class StructuredNavigation extends Component {
  constructor(props) {
    super(props);
    this.iiifParser = new IIIFParser();
    this.manifest = this.props.manifest;

    this.state = {
      html: ''
    };
  }

  componentDidMount() {
    //this.parseManifest(this.manifest);
  }

  parseManifest(manifest) {
    const html = this.iiifParser.createStructure(
      manifest.structures,
      undefined,
      true
    );
    this.setState({ html });
  }

  //////////////////////////////////////////////////////

  handleItemClick(id) {
    console.log('clicked id', id);
  }

  renderSubMenu(items) {
    const menuItems = items.map(item => {
      const display = item.label;

      let subMenu;
      if (item.items && item.items.length > 0) {
        subMenu = this.renderSubMenu(item.items);
      }

      return (
        <li key={item.id} onClick={() => this.handleItemClick(item.id)}>
          {display}
          {subMenu}
        </li>
      );
    });

    return <ul>{menuItems}</ul>;
  }

  render() {
    //return <section className="avln-structured-navigation" dangerouslySetInnerHTML={{__html: this.state.html}} />;

    const List = props => {
      return (
        <ul>
          {props.items.map(item => <ListItem key={item.id} item={item} />)}
        </ul>
      );
    };

    const ListItem = props => {
      const { item } = props;

      const subMenu =
        item.items && item.items.length > 0 ? (
          <List items={item.items} />
        ) : null;

      return (
        <li>
          {item.label}
          {subMenu}
        </li>
      );
    };

    //return <div>{this.renderSubMenu(this.manifest.structures)}</div>;
    return <List items={this.manifest.structures} />;
  }
}

export default StructuredNavigation;
