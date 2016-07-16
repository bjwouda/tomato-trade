import Ember from 'ember';
import OfferActions from '../mixins/offer-actions';
import LangActions from '../mixins/lang-actions';

import _ from 'lodash/lodash';

export default Ember.Controller.extend(OfferActions, LangActions, {

  activeUser        : null,
  gameConfiguration : null,
  game: Ember.computed.alias("model"),

  // isConfiguration   : Ember.computed("model.[]", function() {
  //   return this.get("model.length") !== 0;
  // }),

  actions: {

    // USER
    saveUser(user) { user.save(); },
    deleteUser(user) { 
      user.destroyRecord(); 
    },
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

    pauseGame(game){
      game.set("timePausedTs", Date.now());
      game.save();
    },

    resumeGame(game){
      try {
        let pausedStartDelta = game.get("timePausedTs") - game.get("timeStartTs");
        let previousDelta = game.get("timeEndTs") - game.get("timeStartTs");
        game.set("timeStartTs", Date.now() - pausedStartDelta);
        game.set("timeEndTs", game.get("timeStartTs") + previousDelta);
      } catch(err) {
        console.log("error when resuming...");  
      }
      game.set("timePausedTs", undefined);
      game.save();
      
    },

    letGameEndInXMinutes(game, xMinutes, shouldResetStart) {
      game.set("timeEndTs", Date.now() + xMinutes * 60 * 1000);

      if (shouldResetStart) { game.set("timeStartTs", Date.now()); }

      game.save();
    },

    nextRound(game, minutesPerRound) {
      if (!minutesPerRound) {
        alert("Minutes per round not correctly set...");
        return;
      }

      game.set("timeStartTs", Date.now());
      game.set("timeEndTs", Date.now() + minutesPerRound * 60 * 1000);

      game.incrementProperty("roundCnt", 1);
      game.save();

      game.get("allUsers").forEach((u) => {
        u.set("goalTomatoes", game.getValueforUserCurrentRound(u.get("playerIdInGame")));
        u.save();
      });
    },

    saveSettings(game) {
      game.save();
      game.get("allUsers").forEach((u) => { u.save(); });
      this.toggleProperty("isEditing");
    },

    revertGameConfig() {
      this.set("game.gameConfigurationRO", this.get("game.gameConfiguration"));
    },

    saveGameConfig() {
      let self = this;

      var promiseArr = self.get("game.users")
        .filter( (x) => { return x && !x.get("isDeleted"); } )
        .map( (x) => { return x.destroyRecord; } );

      self.get("game.users").clear();

      Promise.all(promiseArr).then(function() {
        self.set("game.gameConfigurationSafe", self.get("game.gameConfigurationRO"));
        self.set("game.roundCnt", 0);
        self.get("game").save().then(function() {
          _.range(self.get("game.numberOfPlayers.nrOfBuyers")).forEach(function() {
            self.send("addUser", self.get("game"), "buyer");
          });

          _.range(self.get("game.numberOfPlayers.nrOfSellers")).forEach(function() {
            self.send("addUser", self.get("game"), "seller");
          });

          self.set("isConfiguration", false);
        });
      });
    },


    exportCSV(historyLogs) {
      var data = [];
      var titles = ["userSender", "userReceiver", "state", "offer", "tS"];

      data.push(titles);
      historyLogs.map((historyElement) => {
        // historyElement => 1x historical element
        // now go through each element in titles and get it from historyElement
        var resolvedTitles = titles.map((titleElement) => {
          return historyElement.get(titleElement);
        });
        data.push(resolvedTitles);
      });
      this.get('csv').export(data, 'test.csv');
    },

  }
});
