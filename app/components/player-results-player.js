import Ember from 'ember';

import OfferUtilities from "../mixins/offer-utilities";

import GameConfigParser from "../mixins/game-config-parser";

import _ from 'lodash/lodash';

export default Ember.Component.extend(OfferUtilities, {
  configuration: Ember.computed("histories.[]", "histories.@each", function() {
    let history = this.get("histories").find(function(history) {
      return history.get("state") === "New Config loaded";
    });
    
    let gameConfigurationSafe = history.get("offer");
    
    let gameConfigParser = Ember.Object.extend(GameConfigParser).create({
      gameConfigurationSafe: gameConfigurationSafe
    });
    
    return gameConfigParser.get("gameMatrix");
  }),
  
  weeks: Ember.computed("configuration", function() {
    let configuration = this.get("configuration");
    
    let weeks = configuration.map(function(round) {
      return parseInt(round.tradingFor);
    });
    
    return _.uniq(weeks).sort(function(value1, value2) {
      return value1 - value2;
    });
  }),
  
  weeksForRounds: Ember.computed("configuration", function() {
    let configuration = this.get("configuration");
    
    let weeksForRounds = [];
    
    configuration.forEach(function(roundConfiguration) {
      let round = parseInt(roundConfiguration.round);
      
      weeksForRounds[round] = parseInt(roundConfiguration.tradingFor);
    });
    
    return weeksForRounds;
  }),
  
  goalsPerPlayerPerWeek: Ember.computed("configuration", function() {
    let configuration = this.get("configuration");
    
    let goalsPerPlayerPerWeek = [];
    
    configuration.forEach(function(roundConfiguration) {
      let week = parseInt(roundConfiguration.tradingFor);
      
      let playerSettings = roundConfiguration.playerSettings;
      
      let goalsPerPlayer = [];
      
      playerSettings.forEach(function(goal, index) {
        let position = index + 1;
        
        // TODO work in prognosis percentage
        goalsPerPlayer[position] = parseFloat(goal);
      });
      
      goalsPerPlayerPerWeek[week] = goalsPerPlayer;
    });
    
    return goalsPerPlayerPerWeek;
  }),
  
  prognoses: Ember.computed("histories.[]", "histories.@each", function() {
    let prognoses = [];
    
    this.get("histories").forEach(function(history) {
      let sender = history.get("userSender");
      
      let prefix = "Prognisis modification to ";
      
      // Don't look at me, I'm hideous!
      if(sender.startsWith(prefix)) {
        let user = sender.slice(prefix.length);
        let userParameters = user.split(/[ -]+/);
        
        let role = userParameters[0];
        let position = parseInt(userParameters[1]);
        
        let percentageParameters = history.get("offer").match(/by (\d+)%/);
        let percentage = parseInt(percentageParameters[1]);
        
        let roundParameters = history.get("round").split(/ /);
        let round = parseInt(roundParameters[1]);
        
        let prognosis = Ember.Object.create({
          role: role,
          position: position,
          percentage: percentage,
          round: round
        });
        
        prognoses.pushObject(prognosis);
      }
    }, this);
    
    return prognoses;
  }),
  
  offers: Ember.computed("histories.[]", "histories.@each", function() {
    return this.get("histories").filter(function(history) {
      let state = history.get("state");
      
      return this.isOfferAcceptedState(state);
    }, this);
  }),
  
  offersPerWeek: Ember.computed("offers", "weeks", "weeksForRounds", function() {
    let offers = this.get("offers");
    let weeks = this.get("weeks");
    let weeksForRounds = this.get("weeksForRounds");
    
    let offersPerWeek = [];
    
    weeks.forEach(function(week) {
      offersPerWeek[week] = [];
    });
    
    offers.forEach(function(offer) {
      let roundParameters = offer.get("round").split(/ /);
      let round = parseInt(roundParameters[1]);
      
      let week = weeksForRounds[round];
      
      offersPerWeek[week].pushObject(offer);
    });
    
    return offersPerWeek;
  }),
  
  offersPerPlayerPerWeek: Ember.computed("offersPerWeek", "weeks", "buyers", "sellers", function() {
    let offersPerWeek = this.get("offersPerWeek");
    
    let weeks = this.get("weeks");
    let buyers = this.get("buyers");
    let sellers = this.get("sellers");
    
    let players = buyers.concat(sellers);
    
    let offersPerPlayerPerWeek = [];
    
    weeks.forEach(function(week) {
      let offers = offersPerWeek[week];
      
      let offersPerPlayer = [];
    
      players.forEach(function(player) {
        let position = player.get("playerPosition");
        
        // Sellers are placed behind buyers to match the player settings from the configuration.
        if(player.get("isSeller")) {
          position += buyers.length;
        }
        
        offersPerPlayer[position] = [];
      });
      
      offers.forEach(function(offer) {
        let senderParameters = offer.get("userSender").split(/[ -]+/);
        let receiverParameters = offer.get("userReceiver").split(/[ -]+/);
        
        let senderRole = senderParameters[0];
        let senderPosition = parseInt(senderParameters[1]);
        
        let receiverRole = receiverParameters[0];
        let receiverPosition = parseInt(receiverParameters[1]);
        
        if(!this.isOfferExternalUser(senderRole)) {
          // Place sellers behind buyers to match the player settings from the configuration.
          if(this.isOfferSellerUser(senderRole)) {
            senderPosition += buyers.length;
          }
          
          offersPerPlayer[senderPosition].pushObject(offer);
        }
        
        if(!this.isOfferExternalUser(receiverRole)) {
          // Place sellers behind buyers to match the player settings from the configuration.
          if(this.isOfferSellerUser(receiverRole)) {
            receiverPosition += buyers.length;
          }
          
          offersPerPlayer[receiverPosition].pushObject(offer);
        }
      }, this);
      
      offersPerPlayerPerWeek[week] = offersPerPlayer;
    }, this);
    
    return offersPerPlayerPerWeek;
  }),
  
  revenuePerPlayerPerWeek: Ember.computed("offersPerPlayerPerWeek", "weeks", "buyers", "sellers", function() {
    let offersPerPlayerPerWeek = this.get("offersPerPlayerPerWeek");
    
    let weeks = this.get("weeks");
    let buyers = this.get("buyers");
    let sellers = this.get("sellers");
    
    let players = buyers.concat(sellers);
      
    let revenuePerPlayerPerWeek = [];
    
    weeks.forEach(function(week) {
      let offersPerPlayer = offersPerPlayerPerWeek[week];
      
      let revenuePerPlayer = [];
      
      players.forEach(function(player) {
        let position = player.get("playerPosition");
        
        // Sellers are placed behind buyers to match the player settings from the configuration.
        if(player.get("isSeller")) {
          position += buyers.length;
        }
        
        let offers = offersPerPlayer[position];
      
        let revenue = offers.reduce(function(revenue, offer) {
          let offerParameters = offer.get("offer").split(/, |:/);
          
          let volume = parseFloat(offerParameters[1]);
          let unitPrice = parseFloat(offerParameters[3]);
          
          return revenue + volume * unitPrice;
        }, 0.0);
        
        revenuePerPlayer[position] = revenue;
      });
      
      revenuePerPlayerPerWeek[week] = revenuePerPlayer;
    });
    
    return revenuePerPlayerPerWeek;
  }),
  
  averageUnitPricePerPlayerPerWeek: Ember.computed("goalsPerPlayerPerWeek", "revenuePerPlayerPerWeek", "weeks", "buyers", "sellers", function() {
    let goalsPerPlayerPerWeek = this.get("goalsPerPlayerPerWeek");
    let revenuePerPlayerPerWeek = this.get("revenuePerPlayerPerWeek");
    
    let weeks = this.get("weeks");
    let buyers = this.get("buyers");
    let sellers = this.get("sellers");
    
    let players = buyers.concat(sellers);
    
    let averageUnitPricePerPlayerPerWeek = [];
    
    weeks.forEach(function(week) {
      let goalsPerPlayer = goalsPerPlayerPerWeek[week];
      let revenuePerPlayer = revenuePerPlayerPerWeek[week];
      
      let averageUnitPricePerPlayer = [];
      
      players.forEach(function(player) {
        let position = player.get("playerPosition");
        
        // Sellers are placed behind buyers to match the player settings from the configuration.
        if(player.get("isSeller")) {
          position += buyers.length;
        }
        
        let goal = goalsPerPlayer[position];
        let revenue = revenuePerPlayer[position];
        
        // TODO kpi for buyer
        let averageUnitPrice = revenue / goal;
        
        averageUnitPricePerPlayer[position] = averageUnitPrice;
      });
      
      averageUnitPricePerPlayerPerWeek[week] = averageUnitPricePerPlayer;
    });
    
    return averageUnitPricePerPlayerPerWeek;
  }),
  
  averageUnitPricePerPlayer: Ember.computed("averageUnitPricePerPlayerPerWeek", "weeks", "buyers", "sellers", function() {
    let averageUnitPricePerPlayerPerWeek = this.get("averageUnitPricePerPlayerPerWeek");
    
    let weeks = this.get("weeks");
    let buyers = this.get("buyers");
    let sellers = this.get("sellers");
    
    let players = buyers.concat(sellers);
    
    let averageUnitPricePerPlayer = [];
    
    players.forEach(function(player) {
      let position = player.get("playerPosition");
      
      if(player.get("isSeller")) {
        position += buyers.length;
      }
      
      let totalAverageUnitPrice = 0.0;
      
      averageUnitPricePerPlayerPerWeek.forEach(function(averageUnitPricePerPlayer) {
        let averageUnitPrice = averageUnitPricePerPlayer[position];
        
        totalAverageUnitPrice += averageUnitPrice;
      });
      
      // More like, average average unit price...
      let averageUnitPrice = totalAverageUnitPrice / weeks.length;
      
      averageUnitPricePerPlayer[position] = averageUnitPrice;
    });
    
    return averageUnitPricePerPlayer;
  }),
  
  averageUnitPrice: Ember.computed("averageUnitPricePerPlayer", "player", "buyers", function() {
    let averageUnitPricePerPlayer = this.get("averageUnitPricePerPlayer");
    
    let player = this.get("player");
    
    let buyers = this.get("buyers");
    
    let position = player.get("playerPosition");
    
    if(player.get("isSeller")) {
      position += buyers.length;
    }
    
    return averageUnitPricePerPlayer[position];
  }),
  
  isWinner: Ember.computed("averageUnitPricePerPlayer", "player", "buyers", "sellers", function() {
    let averageUnitPricePerPlayer = this.get("averageUnitPricePerPlayer");
    
    let player = this.get("player");
    
    let buyers = this.get("buyers");
    let sellers = this.get("sellers");
    
    let players = buyers.concat(sellers);
    
    let position = player.get("playerPosition");
    
    if(player.get("isSeller")) {
      position += buyers.length;
    }
    
    let maximumAverageUnitPrice = Number.MIN_VALUE;
    let winnerPosition = -1;
    
    players.forEach(function(contender) {
      let contenderPosition = contender.get("playerPosition");
      
      if(contender.get("isSeller")) {
        contenderPosition += buyers.length;
      }
      
      let averageUnitPrice = averageUnitPricePerPlayer[contenderPosition];
      
      if(averageUnitPrice > maximumAverageUnitPrice) {
        maximumAverageUnitPrice = averageUnitPrice;
        
        winnerPosition = contenderPosition;
      }
    });
    
    return position === winnerPosition;
  })
});
