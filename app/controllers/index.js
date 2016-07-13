import Ember from 'ember';
import OfferActions from '../mixins/offer-actions';
import LangActions from '../mixins/lang-actions';


export default Ember.Controller.extend(OfferActions, LangActions, {

  activeUser        : null,
  gameConfiguration : null,
  isConfiguration   : null,

  actions: {

    // USER
    saveUser(user) { user.save(); },
    deleteUser(user) { 
      user.destroyRecord(); 
      gameConfiguration = null;
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

      if (game.get("currentTradeType") === "weekly") { game.incrementProperty("weekCnt", 1); }
      game.set("currentTradeType", game.get("nextTradeType"));

      if (game.get("currentTradeType") === "weekly") {
        game.set("nextTradeType", "daily");
      } else {
        game.set("nextTradeType", "weekly");
      }

      game.save();
    },

    removeGame(item) {
      item.destroyRecord();
      this.set('isConfiguration', false);
    },

    createNewGame() {
      var newComment = this.store.createRecord('game', { "history": "foo", "gameConfiguration" : this.gameConfiguration });
      newComment.save();
      //this.sendAction('addUser', 'game', "seller");
      //this.addUser(this.store.get('game'), "seller");

      //set game configuration
      while(this.get('gameConfiguration') !== ''){
        var config = this.get('gameConfiguration');
        var userConfig = config.substring(0, config.indexOf(","));
        this.set('gameConfiguration', config.replace(userConfig + ',', '').trim());
        
        {{debugger}}
        this.set('gameConfiguration', "");

      }
      this.set('isConfiguration', true);
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

    saveConfiguration(config) {
      //check input format before creating game
        this.set('gameConfiguration', config);
    }
  }
});
