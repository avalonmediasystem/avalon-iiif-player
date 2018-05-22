import * as types from './types';

export function playerInitialized(player) {
  return {
    type: types.MEJS_PLAYER_INITIALIZED,
    payload: player
  };
}

export function navItemClick(url) {
  return {
    type: types.NAV_ITEM_CLICK,
    payload: url
  };
}
