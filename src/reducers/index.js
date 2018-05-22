import * as types from '../actions/types';

export default function rootReducer(state = {}, action) {
  switch (action.type) {
    case types.MEJS_PLAYER_INITIALIZED:
      return Object.assign({}, state, {
        player: action.payload
      });
    case types.NAV_ITEM_CLICK:
      return Object.assign({}, state, {
        clickedUrl: action.payload
      });
    default:
      return state;
  }
}
