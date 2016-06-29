import Ember from 'ember';
import OfferActions from '../mixins/offer-actions';

export default Ember.Controller.extend(OfferActions, {

  activeUser: null,

  actions: {

    // USER
    saveUser(user) { user.save(); },
    deleteUser(user) { user.destroyRecord(); },
    rollbackUser(user) { user.rollbackAttributes(); },

    setActiveUser(user) {
      this.set("activeUser", user);
    },

    addUser(game, userType) {
      var isSeller = false;
      if (userType === 'seller') { isSeller = true; }
      var newUser = this.store.createRecord('user', { isSeller: isSeller });

      game.get('users').addObject(newUser);

      newUser.save().then(() => {
        return game.save();
      });

    },


    // GAME
    removeGame(item) {
      item.destroyRecord();
    },

    createNewGame() {
      var newComment = this.store.createRecord('game', { "history": "foo" });
      newComment.save();
    }
  }
});
