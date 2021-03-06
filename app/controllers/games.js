import Ember from 'ember';

import OfferActions from '../mixins/offer-actions';
import LangActions from '../mixins/lang-actions';
import LogFunctions from '../mixins/log-functions';

import _ from 'lodash/lodash';

import moment from 'moment';

export default Ember.Controller.extend(OfferActions, LangActions, LogFunctions, {
  autoTradingString: "",
  autoTradingArr: [],
  activeUser: null,
  gameConfiguration: null,
  game: Ember.computed.alias("model"),
  
  isEditing: true,
  
  historyCompletelyLoaded: Ember.observer("model.historyLogs.[]", "model.historyLogs.@each.isLoaded", function() {
    this.set("showFilterTable", false);
  }),
  
  autoTradingTimer: Ember.on("init", function() {
    let inRangeCheck = (x, arr) => {
      return _.inRange(x, arr[0], arr[1]);
    };
    
    let isInTimeArray = (ts) => {
      let autoTradingArr = this.get('autoTradingArr');
      return autoTradingArr.some((arr) => inRangeCheck(ts, arr));
    };
    
    let timerHandle = setInterval(() => {
      let prevTimeMissingSec = this.get("timeMissingSec");
      let newTimeMissingSec = moment(this.get("game.timeEndTs")).diff(moment());
      
      this.set("timeMissingSec", newTimeMissingSec, 'seconds');
      
      let prevCheck = isInTimeArray(prevTimeMissingSec);
      let newCheck = isInTimeArray(newTimeMissingSec);
      
      // here we dont need to do anything
      if(prevCheck === newCheck) {
        return;
      }
      
      // if the new value is negative -> prev was positive -> flank down -> disable everything
      // must be the other case ;-) -> flank up
      let flankDown = (newCheck === false);
      
      this.get("game.users").forEach((u) => {
        u.set("enableExternalTrading", !flankDown);
        u.save();
        
        let newHistoryObj = this.get("store").createRecord('history', {
          offerId: undefined,
          userSender: u.get("descriptivePlayerIdInGameForLogger"),
          userReceiver: "",
          state: "Automatic change to external trade status",
          cssStatus: "",
          offer: u.get("enableExternalTrading") ? "Enabled" : "Disabled",
          round: "Round " + (this.get("game.roundCnt") + 1),
          historyGame: this.get("game")
        });
        
        newHistoryObj.save().then(() => {
          return true;
        });
      });
    }, 1000);
  }),
  
  actions: {
    setAutoTrading(s) {
      let arr = s.split(";").map(x => x.split("-"));
      let autoTradingArr = arr.map(x => x.map(y => parseInt(+y * 60 * 1000)).sort((a, b) => a - b));
      this.set("autoTradingArr", autoTradingArr);
      
      this.set("autoTradingTs", moment().format("LTS"));
    },
    
    allowGlobalExternalTrading() {
      this.get("game.users").forEach((u) => {
        u.toggleProperty("enableExternalTrading");
        u.save();
        
        let newHistoryObj = this.get("store").createRecord('history', {
          offerId: undefined,
          userSender: u.get("descriptivePlayerIdInGameForLogger"),
          userReceiver: "",
          state: "Global change to external trade status",
          cssStatus: "",
          offer: u.get("enableExternalTrading") ? "Enabled" : "Disabled",
          round: "Round " + (this.get("game.roundCnt") + 1),
          historyGame: this.get("game")
        });
        
        newHistoryObj.save().then(() => {
          return true;
        });
      });
    },
    
    // USER
    
    saveUser(user) {
      user.save();
    },
    
    deleteUser(user) {
      user.destroyRecord();
    },
    
    rollbackUser(user) {
      user.rollbackAttributes();
    },
    
    setActiveUser(user) {
      this.set("activeUser", user);
    },
    
    addUser(game, userType) {
      let isSeller = false;
      
      if(userType === 'seller') {
        isSeller = true;
      }
      
      let newUser = this.store.createRecord('user', { isSeller });
      
      game.get('users').pushObject(newUser);
      
      newUser.save().then(() => {
        return game.save();
      });
    },
    
    // GAME
    
    pauseGame(game) {
      game.set("timePausedTs", moment());
      game.save();
    },
    
    resumeGame(game) {
      try {
        let pausedStartDelta = game.get("timePausedTs") - game.get("timeStartTs");
        let previousDelta = game.get("timeEndTs") - game.get("timeStartTs");
        game.set("timeStartTs", moment() - pausedStartDelta);
        game.set("timeEndTs", game.get("timeStartTs") + previousDelta);
      }
      catch(error) {
        console.log("Error when resuming...");
      }
      game.set("timePausedTs", undefined);
      game.save();
    },
    
    letGameEndInXMinutes(game, xMinutes, shouldResetStart) {
      game.set("timeEndTs", moment() + xMinutes * 60 * 1000);
      
      if(shouldResetStart) {
        game.set("timeStartTs", moment());
      }
      
      game.save();
    },
    
    letGameEnd(game) {
      game.set("roundCnt", game.get("numberOfRounds.total"));
      
      this.send("nextRound", game);
    },
    
    nextRound(game, minutesPerRound) {
      let gameIsLastRound = this.get('game.isLastRound');
      
      minutesPerRound = game.getMinutesPerRoundForRound(1 + game.get("roundCnt"));
      
      if(!minutesPerRound) {
        minutesPerRound = 5;
      }
      
      let newHistoryObj;
      
      // Create history record to record moving to the next round
      if(game.get("roundCnt") !== 0) {
        newHistoryObj = this.store.createRecord('history', {
          offerId: undefined,
          userSender: "Round " + (game.get("roundCnt") + 1),
          userReceiver: "Round " + (game.get("roundCnt") + 2),
          state: "New Round",
          cssStatus: "info",
          offer: "Minutes on this round " + minutesPerRound, // We could also include tomato goal for each user
          round: "Round " + (game.get("roundCnt") + 1),
          historyGame: game
        });

        game.get("users").map((u) => {
          let userHistory = this.store.createRecord('history', {
            offerId: undefined,
            userSender: `Stats for ${u.get("descriptivePlayerIdInGame")}`,
            userReceiver: "",
            state: "",
            cssStatus: "info",
            offer: u.get("logPlayerStatus"),
            round: "Round " + game.get("roundCnt"),
            historyGame: game
          });
          
          userHistory.save();
          
          if(gameIsLastRound) {
            let allKpis = u.get("weeklyKPIOverview").map( x=> x.kpi);
            let meanKpi = _.sum(allKpis) / allKpis.length;
            
            let userTotalHistory = this.store.createRecord('history', {
              offerId: undefined,
              userSender: `Final stats for ${u.get("descriptivePlayerIdInGame")}`,
              userReceiver: "",
              state: "",
              cssStatus: "info",
              offer: `Final KPI (average) ${meanKpi}`,
              round: "Round " + game.get("roundCnt"),
              historyGame: game
            });
            
            userTotalHistory.save();
          }
          
          if(u.get("enableExternalTrading")) {
            u.set("enableExternalTrading", false);
            
            let newHistoryObj = this.get("store").createRecord('history', {
              offerId: undefined,
              userSender: u.get("descriptivePlayerIdInGameForLogger"),
              userReceiver: "",
              state: "End of round change to external trade status",
              cssStatus: "",
              offer: u.get("enableExternalTrading") ? "Enabled" : "Disabled",
              round: "Round " + (this.get("game.roundCnt") + 1),
              historyGame: this.get("game")
            });
            
            newHistoryObj.save().then(() => {
              return true;
            });
          }
        });
      }
      else {
        newHistoryObj = this.store.createRecord('history', {
          offerId: undefined,
          userSender: "Game starting",
          userReceiver: "Setting up:",
          state: "First Round",
          cssStatus: "info",
          offer: "Minutes on this round " + minutesPerRound, // We could also include tomato goal for each user
          round: "Round " + game.get("roundCnt"),
          historyGame: game
        });
      }
      
      newHistoryObj.save().then(() => {
        return true;
      });
      
      game.set("timeStartTs", moment());
      game.set("timeEndTs", moment() + minutesPerRound * 60 * 1000);
      game.incrementProperty("roundCnt", 1);
      
      game.get("offers").map(x => x.destroyRecord());
          
      game.save();
      
      if(game.get("gameIsRunning")) {
        game.save().then(() => {
          let lut = [
            ["getRetailpriceForRound", "retailPrice"],
            ["getMinutesPerRoundForRound", "minutesPerRound"],
            ["getSellerFineForRound", "fine"],
            ["getSellerFixedCostForRound", "fixedCost"],
          ];
          
          for (let [fnName, attrName] of lut) {
            //console.log(fnName);
            //console.log(attrName);
            let newVal = game[fnName](game.get("roundCnt"));
            game.set(attrName, newVal);
          }
          
          game.save();
        });
        
        let autoTradingString = game.getTradingScheduleForRound(game.get("roundCnt"));
        let arr = autoTradingString.split(";").map(x => x.split("-"));
        let autoTradingArr = arr.map(x => x.map(y => parseInt(+y * 60 * 1000)).sort((a, b) => a - b));
        this.set("autoTradingString", autoTradingString);
        this.set("autoTradingArr", autoTradingArr);
        this.set("autoTradingTs", moment().format("LTS"));
        
        // Automatically perform the prognosis adjustment.
        if(game.get("currentGameSettings").tradeType === "daily") {
          game.get("allUsers").forEach((user) => {
            user.set("goalTomatoes", game.getValueforUserCurrentRound(user.get("playerIdInGame")));
            user.set("extOfferTomato", game.getValueforUserCurrentRound(user.get("playerIdInGame"), '_extTomato'));
            user.set("extOfferPrice", game.getValueforUserCurrentRound(user.get("playerIdInGame"), '_extPrice'));
            
            let index = _.random(5);
            
            let percentages = [-10, -5, 0, 0, 5, 10];
            let percentage = percentages[index];
            
            // Straight up copied from player-ov.js.
            let currentTomatoes = user.get("goalTomatoes");
            let newGoalTomatoes = Math.floor(currentTomatoes * (1.0 + 0.01 * percentage));
            
            user.set("goalTomatoes", newGoalTomatoes);
            user.set("prognosis", percentage);
            user.save();
            
            let anotherNewHistoryObj = this.store.createRecord('history', {
              offerId      : undefined,
              userSender   : "Prognosis modification to " + user.get("roleDescription") + " " + user.get("playerPosition"),
              userReceiver : "",
              state        : "",
              cssStatus    : "info",
              offer        : "by " + percentage + "%",
              round        : "Round " + game.get("roundCnt"),
              historyGame  : game
            });
            
            anotherNewHistoryObj.save().then(() => {
              return true;
            });
          });
        }
        else {
          game.get("allUsers").forEach((u) => {
            u.set("goalTomatoes", game.getValueforUserCurrentRound(u.get("playerIdInGame")));
            u.set("extOfferTomato", game.getValueforUserCurrentRound(u.get("playerIdInGame"), '_extTomato'));
            u.set("extOfferPrice", game.getValueforUserCurrentRound(u.get("playerIdInGame"), '_extPrice'));
            u.set("prognosis", 0);
            u.save();
          });
        }
      }
      else {
        this.set("autoTradingString", "");
        this.set("autoTradingArr", []);
        this.set("autoTradingTs", undefined);
        
        game.get("allUsers").forEach((u) => {
          u.set("goalTomatoes", 0);
          u.set("extOfferTomato", 0);
          u.set("extOfferPrice", 0);
          u.set("prognosis", 0);
          u.save();
        });
      }
    },
    
    saveSettings(game) {
      game.save();
      game.get("allUsers").forEach((u) => { u.save(); });
      this.toggleProperty("isEditing");
    },
    
    revertGameConfig() {
      this.set("game.gameConfigurationRO", this.get("game.gameConfiguration"));
    },
    
    updateGameConfig() {
      this.set("game.gameConfigurationSafe", this.get("game.gameConfigurationRO"));
      this.get("game").save();
    },
    
    saveGameConfig() {
      let self = this;
      
      if(!self.get("game.isNew")) {
        var r = confirm(this.get("i18n").t("games.confirmation"));
        if(!r) {
          return;
        }
      }
      
      self.set("game.isNew", false);
      
      let historyQuery = this.get('store').query('history', {
        orderBy: "historyGame",
        equalTo: this.get("game.id")
      });
      
      historyQuery.then(function(records) {
        let historyPromises = records.map(function(record) {
          return record.destroyRecord();
        });
        
        let userPromises = self.get("game.users").filter((x) => {
          return x && !x.get("isDeleted");
        }).map((x) => {
          return x.destroyRecord();
        });
        
        self.get("game.users").clear();
        
        let promises = historyPromises.concat(userPromises);
        
        Ember.RSVP.Promise.all(promises).then(function() {
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
            
            let newHistoryObj = self.get("store").createRecord('history', {
              offerId: undefined,
              userSender: "---",
              userReceiver: "---",
              state: "New Config loaded",
              cssStatus: "info",
              offer: self.get("game.gameConfigurationSafe"),
              round: "---",
              historyGame: self.get("game")
            });
            newHistoryObj.save();
          });
        });
      });
    },
    
    testManyOffers() {
      Ember.run(() => {
        let self = this;
        let game = this.get("game");
        let users = this.get("game.users").then(function(_users) {
          //sendOffer(game, sender, receiver, tomatoes, price)
          let users = _users.map(x => x);
          
          for(let x of _.range(50)) {
            self.send("sendOffer", game, users[0], users[1], 1.0, 1.0);
            console.log(x);
          }
        });
      });
    }
  }
});
