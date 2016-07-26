import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    createNewGame() {
      var gameName;
      do {
        gameName = prompt("How do you want to call the new game?");

        if (gameName === null) { return; }
      }
      while (! gameName);

      var newGame = this.store.createRecord('game', { gameName });
      newGame.save();
    },

    removeGame(game) {
      game.destroyRecord();
    },
  }

});
