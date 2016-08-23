import Ember from 'ember';
import OfferActions from '../mixins/offer-actions';
import LangActions from '../mixins/lang-actions';
import LogFunctions from '../mixins/log-functions';

import _ from 'lodash/lodash';

export default Ember.Controller.extend(OfferActions, LangActions, LogFunctions, {

  activeUser: null,
  gameConfiguration: null,
  game: Ember.computed.alias("model"),

  isEditing : true,

  historyCompletelyLoaded: Ember.observer("model.historyLogs.[]", "model.historyLogs.@each.isLoaded", function() {
    this.set("showFilterTable", false);
  }),

  columns: [
    {
      "propertyName": "round",
      "title": "Round",
      "filterWithSelect": true
    },
    {
      "propertyName": "idxOfOfferInGame",
      "title": "Offerid"
    },
    {
      "propertyName": "userSender",
      "title": "Usersender"
    },
    {
      "propertyName": "userReceiver",
      "title": "Userreceiver"
    },
    {
      "propertyName": "state",
      "title": "State"
    },
   
    {
      "propertyName": "tomatoesOffer",
      "title": "tomatoes"
    },
    {
      "propertyName": "priceOffer",
      "title": "price"
    },
    {
      "propertyName": "tsDesc",
      "title": "Time"
    },

  ],

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
      var newUser = this.store.createRecord('user', { isSeller });

      game.get('users').pushObject(newUser);

      newUser.save().then(() => {
        return game.save();
      });
    },


    // GAME

    pauseGame(game) {
      game.set("timePausedTs", Date.now());
      game.save();
    },

    resumeGame(game) {
      try {
        let pausedStartDelta = game.get("timePausedTs") - game.get("timeStartTs");
        let previousDelta = game.get("timeEndTs") - game.get("timeStartTs");
        game.set("timeStartTs", Date.now() - pausedStartDelta);
        game.set("timeEndTs", game.get("timeStartTs") + previousDelta);
      } catch (err) {
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

      minutesPerRound = game.getMinutesPerRoundForRound(1 + game.get("roundCnt"));

      if (!minutesPerRound) {
        alert("Minutes per round not correctly set...");
        return;
      }

      //Create history record to record moving to the next round
      if (game.get("roundCnt") !== 0){
        var newHistoryObj = this.store.createRecord('history', {
          offerId      : undefined,
          userSender   : "Round " + (game.get("roundCnt") + 1),
          userReceiver : "Round " + (game.get("roundCnt") + 2),
          state        : "New Round",
          cssStatus    : "info",
          offer        : "Minutes on this round " +  minutesPerRound, //We could also include tomato goal for each user
          round        : "Round " + (game.get("roundCnt") + 1)
        });
        
      } else {
        var newHistoryObj = this.store.createRecord('history', {
          offerId      : undefined,
          userSender   : "Game starting",
          userReceiver : "Setting up:",
          state        : "First Round",
          cssStatus    : "info",
          offer        : "Minutes on this round " +  minutesPerRound, //We could also include tomato goal for each user
          round        : "Round " + game.get("roundCnt")
        });     
      }
      
      game.get("users").map((u) => {
        let userHistory = this.store.createRecord('history', {
          offerId      : undefined,
          userSender   : `Stats for ${u.get("descriptivePlayerIdInGame")}`,
          userReceiver : "",
          state        : "",
          cssStatus    : "info",
          offer        : "",
          round        : "Round " + game.get("roundCnt")
        });     
        game.get('historyLogs').addObject(userHistory);
        userHistory.save().then(() => { 
          game.save();
          return true;
        });
      });

      game.get('historyLogs').addObject(newHistoryObj);

      newHistoryObj.save().then(() => { 
        game.save();
        return true;
      });

      game.set("timeStartTs", Date.now());
      game.set("timeEndTs", Date.now() + minutesPerRound * 60 * 1000);

      game.incrementProperty("roundCnt", 1);
      game.save().then(() => {
        let lut = [
          ["getRetailpriceForRound", "retailPrice"],
          ["getMinutesPerRoundForRound", "minutesPerRound"],
          ["getSellerFineForRound", "fine"],
          ["getSellerFixedCostForRound", "fixedCost"],
        ];

        for (let [fnName, attrName] of lut) {
          console.log(fnName);
          console.log(attrName);
          let newVal = game[fnName](game.get("roundCnt"));
          game.set(attrName, newVal);
        }

      });

      game.get("allUsers").forEach((u) => {
        u.set("goalTomatoes", game.getValueforUserCurrentRound(u.get("playerIdInGame")));
        u.set("extOfferTomato", game.getValueforUserCurrentRound(u.get("playerIdInGame"), '_extTomato'));
        u.set("extOfferPrice", game.getValueforUserCurrentRound(u.get("playerIdInGame"), '_extPrice'));
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
        .filter((x) => {
          return x && !x.get("isDeleted"); })
        .map((x) => {
          return x.destroyRecord(); });

      self.get("game.users").clear();
      self.get("game.historyLogs").clear();

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
          // self.send("nextRound", self.get("game"), 5);
          self.send("clearHistoryLogs");
        });
      });
    },

    clearHistoryLogs() {
      this.get("game.historyLogs").clear();
      this.get("game").save();
    },

    exportCSV(historyLogs) {
      var data = [];
      var titles = ["round", "idxOfOfferInGame", "userSender", "userReceiver", "state", "offer", "tomatoesOffer", "priceOffer", "tsDesc"];

      data.push(titles);
      historyLogs.map((historyElement) => {
        // historyElement => 1x historical element
        // now go through each element in titles and get it from historyElement
        var resolvedTitles = titles.map((titleElement) => {
          return historyElement.get(titleElement);
        });
        data.push(resolvedTitles);
      });
      // this.get('csv').export(data, 'test.csv');
      this.get('excel').export(data, 'sheet1', 'test.xlsx');
    },

  }
});
