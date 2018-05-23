import { combineReducers } from 'redux';
import nav from './nav';
import player from './player';

export default combineReducers({
  nav,
  player
});
