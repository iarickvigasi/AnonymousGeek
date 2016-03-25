import _ from 'lodash';

export default class UserStore {
  constructor() {
    console.log('Initing UserStore...');

    this.game = {
      progress: 0
    }

    console.log('User Store inited');
  }

  getGameData() {
    return this.game;
  }

  setGameData(data = {}) {
    this.game = _.assign({}, this.game, data);
    console.log("New game data:", this.game);
  }
}
