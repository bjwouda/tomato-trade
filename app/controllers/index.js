import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    createNewGame() {
      var newGame = this.store.createRecord('game');
      newGame.save();
    },

    removeGame(game) {
      game.destroyRecord();
    },
  }

});
