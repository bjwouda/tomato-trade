import Ember from 'ember';

import OfferUtilities from "../mixins/offer-utilities";

import GameConfigParser from "../mixins/game-config-parser";

import _ from 'lodash/lodash';
import moment from 'moment';

// This is used as the configuration when no data has yet been loaded. Since there will be no players, it won't actually be used.
let emptyConfiguration = `
game            , w1 , d1
retailPrice     ,  0 ,  0
fine            ,  0 ,  0
fixedCost       ,  0 ,  0
minutesPerRound ,  0 ,  0
b1              ,  0 ,  0
b1_extPrice     ,  0 ,  0
b1_extTomato    ,  0 ,  0
s1              ,  0 ,  0
s1_extPrice     ,  0 ,  0
s1_extTomato    ,  0 ,  0
`;

export default Ember.Component.extend(OfferUtilities, {
  store: Ember.inject.service(),
  
  // These are used in the child components. We retrieve all the results from the histories for backwards compatibility.
  histories: [],
  
  // These are used to determine the child components.
  buyers: [],
  sellers: [],
  
  // These are used to determine the results.
  players: [],
  positions: [],
  
  loadHistories: Ember.on("init", Ember.observer("game.gameHasEnded", "game.isImported", function() {
    if(this.get("game.gameHasEnded") || this.get("game.isImported")) {
      // Load the data only when the game ends (or is imported).
      let self = this;
      
      let historyQuery = this.get('store').query('history', {
        orderBy: "historyGame",
        equalTo: this.get("game.id")
      });
      
      historyQuery.then(function(histories) {
        // Duplicate the array before sorting it since sorting is in place and the provided array is not mutable.
        self.set("histories", histories.slice().sort(function(history1, history2) {
          return moment(history1.get("ts")).diff(moment(history2.get("ts")));
        }));
      });
    }
    else {
      // Reset the data when we go back in time.
      this.set("histories", []);
    }
  })),
  
  loadPlayers: Ember.observer("histories.[]", "histories.@each", function() {
    let histories = this.get("histories");
    
    let offers = histories.filter(function(history) {
      return this.isOfferState(history.get("state"));
    }, this);
    
    let players = [];
    
    let filterOffers = function(offers, type) {
      offers.forEach(function(offer) {
        let parameters = offer.get(type).split(/[ -]+/);
        
        let role = parameters[0];
        let position = parameters[1];
        let name = parameters[2];
        
        // Skip external offers.
        if(!this.isOfferExternalUser(role)) {
          players.pushObject(Ember.Object.create({
            // Mimic the original player model so we can reuse templates.
            roleDescription: role,
            playerPosition: parseInt(position),
            name: name,
            isSeller: this.isOfferSellerUser(role)
          }));
        }
      }, this);
    };
    
    filterOffers.call(this, offers, "userSender");
    filterOffers.call(this, offers, "userReceiver");
    
    let buyers = [];
    let sellers = [];
    
    let filterPlayers = function(role, subjects) {
      players.forEach(function(player) {
        if(player.get("roleDescription") === role) {
          let hasSubject = subjects.any(function(subject) {
            return subject.get("playerPosition") === player.get("playerPosition");
          });
          
          if(!hasSubject) {
            subjects.pushObject(player);
          }
        }
      });
    };
    
    filterPlayers("buyer", buyers);
    filterPlayers("seller", sellers);
    
    // sortBy doesn't appear to work.
    let sortPlayers = function(player1, player2) {
      return player1.get("playerPosition") - player2.get("playerPosition");
    };
    
    buyers.sort(sortPlayers);
    sellers.sort(sortPlayers);
    
    this.set("buyers", buyers);
    this.set("sellers", sellers);
    
    // This mimics the order in the game configuration.
    players = buyers.concat(sellers);
    
    let positions = players.map(function(player, index) {
      return index + 1;
    });
    
    this.set("players", players);
    this.set("positions", positions);
  }),
  
  positionsForPlayers: Ember.computed("players", function() {
    let positionsForPlayers = [];
    
    let players = this.get("players");
    
    positionsForPlayers["buyer"] = [];
    positionsForPlayers["seller"] = [];
    
    players.forEach(function(player, index) {
      let role = player.get("roleDescription");
      let position = player.get("playerPosition");
      
      positionsForPlayers[role][position] = index + 1;
    });
    
    return positionsForPlayers;
  }),
  
  gameConfigParser: Ember.computed("histories.[]", "histories.@each", function() {
    let history = this.get("histories").find(function(history) {
      return history.get("state") === "New Config loaded";
    });
    
    // Return an empty configuration if the histories have not yet loaded. Since there will be no players, it won't be used.
    let gameConfigurationSafe = history ? history.get("offer") : emptyConfiguration;
    
    let gameConfigParser = Ember.Object.extend(GameConfigParser).create({
      gameConfigurationSafe: gameConfigurationSafe
    });
    
    return gameConfigParser;
  }),
  
  configuration: Ember.computed("gameConfigParser", function() {
    return this.get("gameConfigParser.gameMatrix");
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
  
  typesForRounds: Ember.computed("configuration", function() {
    let configuration = this.get("configuration");
    
    let typesForRounds = [];
    
    configuration.forEach(function(roundConfiguration) {
      let round = parseInt(roundConfiguration.round);
      
      typesForRounds[round] = roundConfiguration.tradeType;
    });
    
    return typesForRounds;
  }),
  
  buyerPropertiesPerWeek: Ember.computed("gameConfigParser", "weeks", "weeksForRounds", function() {
    let gameConfigParser = this.get("gameConfigParser");
    
    let weeks = this.get("weeks");
    let weeksForRounds = this.get("weeksForRounds");
    
    let buyerPropertiesPerWeek = [];
    
    weeks.forEach(function(week) {
      buyerPropertiesPerWeek[week] = Ember.Object.create({
        fine: 0.0,
        fixedCosts: 0.0,
        retailPrice: 0.0
      });
    });
    
    let numberOfRounds = gameConfigParser.get("numberOfRounds").total;
    
    for(let round = 1; round < numberOfRounds + 1; round++) {
      let week = weeksForRounds[round];
      
      buyerPropertiesPerWeek[week] = Ember.Object.create({
        fine: gameConfigParser.getSellerFineForRound(round),
        fixedCosts: gameConfigParser.getSellerFixedCostForRound(round),
        retailPrice: gameConfigParser.getRetailpriceForRound(round)
      });
    }
    
    return buyerPropertiesPerWeek;
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
      
      let prefix = "Prognosis modification to ";
      
      // Don't look at me, I'm hideous!
      if(sender.startsWith(prefix)) {
        let user = sender.slice(prefix.length);
        let userParameters = user.split(/[ -]+/);
        
        let role = userParameters[0];
        let position = parseInt(userParameters[1]);
        
        let percentageParameters = history.get("offer").match(/by (-?\d+)%/);
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
  
  prognosesPerWeek: Ember.computed("prognoses", "weeks", "weeksForRounds", function() {
    let prognoses = this.get("prognoses");
    let weeks = this.get("weeks");
    let weeksForRounds = this.get("weeksForRounds");
    
    let prognosesPerWeek = [];
    
    weeks.forEach(function(week) {
      prognosesPerWeek[week] = [];
    });
    
    prognoses.forEach(function(prognosis) {
      let week = weeksForRounds[prognosis.get("round")];
      
      prognosesPerWeek[week].pushObject(prognosis);
    });
    
    return prognosesPerWeek;
  }),
  
  prognosesPerPlayerPerWeek: Ember.computed("prognosesPerWeek", "weeks", "positions", "positionsForPlayers", function() {
    let prognosesPerWeek = this.get("prognosesPerWeek");
    
    let weeks = this.get("weeks");
    let positions = this.get("positions");
    
    let positionsForPlayers = this.get("positionsForPlayers");
    
    let prognosesPerPlayerPerWeek = [];
    
    weeks.forEach(function(week) {
      let prognoses = prognosesPerWeek[week];
      
      let prognosesPerPlayer = [];
      
      positions.forEach(function(position) {
        prognosesPerPlayer[position] = 1.0;
      });
      
      prognoses.forEach(function(prognosis) {
        let role = prognosis.get("role");
        let position = prognosis.get("position");
        
        position = positionsForPlayers[role][position];
        
        // We no longer need the whole object now, just the percentage.
        prognosesPerPlayer[position] = 1.0 + 0.01 * prognosis.get("percentage");
      }, this);
      
      prognosesPerPlayerPerWeek[week] = prognosesPerPlayer;
    }, this);
    
    return prognosesPerPlayerPerWeek;
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
  
  offersPerPlayerPerWeek: Ember.computed("offersPerWeek", "weeks", "positions", "positionsForPlayers", function() {
    let offersPerWeek = this.get("offersPerWeek");
    
    let weeks = this.get("weeks");
    let positions = this.get("positions");
    
    let positionsForPlayers = this.get("positionsForPlayers");
    
    let offersPerPlayerPerWeek = [];
    
    weeks.forEach(function(week) {
      let offers = offersPerWeek[week];
      
      let offersPerPlayer = [];
      
      positions.forEach(function(position) {
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
          senderPosition = positionsForPlayers[senderRole][senderPosition];
          
          offersPerPlayer[senderPosition].pushObject(offer);
        }
        
        if(!this.isOfferExternalUser(receiverRole)) {
          receiverPosition = positionsForPlayers[receiverRole][receiverPosition];
          
          offersPerPlayer[receiverPosition].pushObject(offer);
        }
      }, this);
      
      offersPerPlayerPerWeek[week] = offersPerPlayer;
    }, this);
    
    return offersPerPlayerPerWeek;
  }),
  
  volumePerPlayerPerWeek: Ember.computed("offersPerPlayerPerWeek", "weeks", "positions", function() {
    let offersPerPlayerPerWeek = this.get("offersPerPlayerPerWeek");
    
    let weeks = this.get("weeks");
    let positions = this.get("positions");
    
    let volumePerPlayerPerWeek = [];
    
    weeks.forEach(function(week) {
      let offersPerPlayer = offersPerPlayerPerWeek[week];
      
      let volumePerPlayer = [];
      
      positions.forEach(function(position) {
        let offers = offersPerPlayer[position];
        
        let volume = offers.reduce(function(volume, offer) {
          let offerParameters = offer.get("offer").split(/, |:/);
          
          let amount = parseFloat(offerParameters[1]);
          
          return volume + amount;
        }, 0.0);
        
        volumePerPlayer[position] = volume;
      });
      
      volumePerPlayerPerWeek[week] = volumePerPlayer;
    });
    
    return volumePerPlayerPerWeek;
  }),
  
  revenuePerPlayerPerWeek: Ember.computed("offersPerPlayerPerWeek", "weeks", "positions", function() {
    let offersPerPlayerPerWeek = this.get("offersPerPlayerPerWeek");
    
    let weeks = this.get("weeks");
    let positions = this.get("positions");
    
    let revenuePerPlayerPerWeek = [];
    
    weeks.forEach(function(week) {
      let offersPerPlayer = offersPerPlayerPerWeek[week];
      
      let revenuePerPlayer = [];
      
      positions.forEach(function(position) {
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
  
  kpiPerPlayerPerWeek: Ember.computed("buyerPropertiesPerWeek", "goalsPerPlayerPerWeek", "prognosesPerPlayerPerWeek", "volumePerPlayerPerWeek", "revenuePerPlayerPerWeek", "weeks", "players", "positions", function() {
    let buyerPropertiesPerWeek = this.get("buyerPropertiesPerWeek");
    let goalsPerPlayerPerWeek = this.get("goalsPerPlayerPerWeek");
    let prognosesPerPlayerPerWeek = this.get("prognosesPerPlayerPerWeek");
    let volumePerPlayerPerWeek = this.get("volumePerPlayerPerWeek");
    let revenuePerPlayerPerWeek = this.get("revenuePerPlayerPerWeek");
    
    let weeks = this.get("weeks");
    let players = this.get("players");
    let positions = this.get("positions");
    
    let kpiPerPlayerPerWeek = [];
    
    weeks.forEach(function(week) {
      let buyerProperties = buyerPropertiesPerWeek[week];
      let goalsPerPlayer = goalsPerPlayerPerWeek[week];
      let prognosesPerPlayer = prognosesPerPlayerPerWeek[week];
      let volumePerPlayer = volumePerPlayerPerWeek[week];
      let revenuePerPlayer = revenuePerPlayerPerWeek[week];
      
      let kpiPerPlayer = [];
      
      positions.forEach(function(position) {
        let fine = buyerProperties.get("fine");
        let fixedCosts = buyerProperties.get("fixedCosts");
        let retailPrice = buyerProperties.get("retailPrice");
        
        let goal = goalsPerPlayer[position];
        let prognosis = prognosesPerPlayer[position];
        let volume = volumePerPlayer[position];
        let revenue = revenuePerPlayer[position];
        
        goal *= prognosis;
        
        // Players is a zero indexed array.
        if(players[position - 1].get("isSeller")) {
          // The KPI for cooperatives is the unit price.
          kpiPerPlayer[position] = revenue / goal;
        }
        else {
          let deficit = Math.max(0.0, (goal - volume));
          
          let totalFine = fine * deficit;
          let totalFixedCosts = goal * fixedCosts;
          
          // Revenue is actually expenditure, in this case.
          let totalCosts = revenue + totalFine + totalFixedCosts;
          
          let amount = Math.min(goal, volume);
          let income = amount * retailPrice;
          let profit = income - totalCosts;
          
          // The KPI for traders is the unit profit.
          kpiPerPlayer[position] = profit / goal;
        }
      });
      
      kpiPerPlayerPerWeek[week] = kpiPerPlayer;
    });
    
    return kpiPerPlayerPerWeek;
  }),
  
  averageKPIPerPlayer: Ember.computed("kpiPerPlayerPerWeek", "weeks", "positions", function() {
    let kpiPerPlayerPerWeek = this.get("kpiPerPlayerPerWeek");
    
    let weeks = this.get("weeks");
    let positions = this.get("positions");
    
    let averageKPIPerPlayer = [];
    
    positions.forEach(function(position) {
      let total = kpiPerPlayerPerWeek.reduce(function(total, kpiPerPlayer) {
        return total + kpiPerPlayer[position];
      }, 0.0);
      
      averageKPIPerPlayer[position] = total / weeks.length;
    });
    
    return averageKPIPerPlayer;
  })
});
