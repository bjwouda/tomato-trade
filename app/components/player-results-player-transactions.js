import Ember from 'ember';

import OfferUtilities from "../mixins/offer-utilities";
import ChartUtilities from "../mixins/chart-utilities";

import GameConfigParser from "../mixins/game-config-parser";

import _ from 'lodash/lodash';

import moment from 'moment';

function getDataForOffers(offers) {
  return offers.map(function(offer) {
    let offerParameters = offer.get("offer").split(/, |:/);
    
    let unitPrice = offerParameters[3];
    
    let time = offer.get("ts");
    
    return {
      x: moment(time),
      y: +(unitPrice)
    };
  });
}

function getColorsForOffers(offers) {
  return offers.map(function(offer) {
    let state = offer.get("state");
    
    let stateColors = {
      "open"                 : "hsl(9,0%,100%)",
      "confirmed"            : "hsl(69,100%,64%)",
      "recalled - confirmed" : "hsl(9,0%,64%)",
      "accepted"             : "hsl(129,100%,64%)",
      "declined"             : "hsl(9,100%,64%)",
      "recalled - open"      : "hsl(9,0%,64%)"
    };
    
    return stateColors[state];
  });
}

function getBordersForOffers(offers, typesForRounds) {
  return offers.map(function(offer) {
    let round = parseInt(offer.get("round").split(/ /)[1]);
    
    let type = typesForRounds[round];
    
    let typeBorders = {
      "weekly" : "hsl(9,100%,44%)",
      "daily"  : "hsl(129,100%,24%)"
    };
    
    return typeBorders[type];
  });
}

function getRadiiForOffers(offers) {
  return offers.map(function(offer) {
    let offerParameters = offer.get("offer").split(/, |:/);
    
    let tomatoes = parseInt(offerParameters[1]);
    
    // Apply an exponential bracketing.
    if(tomatoes <= 50000) {
      return 4;
    }
    else if(tomatoes <= 250000) {
      return 6;
    }
    else if(tomatoes <= 1250000) {
      return 8;
    }
    else {
      return 10;
    }
  });
}

function getColorForPosition(position) {
  let hue = 9 + 200 * (position - 1);
  let saturation = 100;
  let lightness = 64;
  
  return `hsl(${hue},${saturation}%,${lightness}%)`;
}

function getDashForDirection(direction) {
  if(direction === "send") {
    // A solid line for outgoing offers.
    return [];
  }
  else if(direction === "receive") {
    // A dashed line for incoming offers.
    return [4, 2];
  }
}

export default Ember.Component.extend(OfferUtilities, ChartUtilities, {
  i18n: Ember.inject.service(),
  
  selectedWeek: 1,
  
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
  
  typesForRounds: Ember.computed("configuration", function() {
    let configuration = this.get("configuration");
    
    let typesForRounds = [];
    
    configuration.forEach(function(roundConfiguration) {
      let round = parseInt(roundConfiguration.round);
      
      typesForRounds[round] = roundConfiguration.tradeType;
    });
    
    return typesForRounds;
  }),
  
  offers: Ember.computed("histories.[]", "histories.@each", function() {
    return this.get("histories").filter(function(history) {
      let state = history.get("state");
      
      return this.isOfferState(state);
    }, this);
  }),
  
  indices: Ember.computed("offers", function() {
    let offers = this.get("offers");
    
    let indices = offers.map(function(offer) {
      return parseInt(offer.get("idxOfOfferInGame"));
    });
    
    return _.uniq(indices).sort(function(value1, value2) {
      return value1 - value2;
    });
  }),
  
  groups: Ember.computed("offers", "indices", function() {
    let offers = this.get("offers");
    let indices = this.get("indices");
    
    let groups = [];
    
    indices.forEach(function(index) {
      let group = offers.filter(function(offer) {
        let offerIndex = parseInt(offer.get("idxOfOfferInGame"));
        
        return offerIndex === index;
      });
      
      // No need to sort the offers, they should already be in chronological order.
      groups.pushObject(group);
    });
    
    // No need to sort the groups, they should already be in index order.
    return groups;
  }),
  
  selection: Ember.computed("groups", "weeksForRounds", "selectedWeek", function() {
    let groups = this.get("groups");
    
    let weeksForRounds = this.get("weeksForRounds");
    let selectedWeek = this.get("selectedWeek");
    
    return groups.filter(function(group) {
      // We know there is at least one offer, and that they all contain (almost) the same information.
      let offer = group[0];
      
      let round = parseInt(offer.get("round").split(/ /)[1]);
      
      let week = weeksForRounds[round];
      
      return week === selectedWeek;
    });
  }),
  
  data: Ember.computed("i18n.locale", "player", "buyers", "sellers", "selection", "typesForRounds", function() {
    let i18n = this.get("i18n");
    
    let player = this.get("player");
    
    let buyers = this.get("buyers");
    let sellers = this.get("sellers");
    
    let selection = this.get("selection");
    
    let playerRole = player.get("roleDescription");
    let playerPosition = player.get("playerPosition");
    let playerIsSeller = player.get("isSeller");
    
    let clients = playerIsSeller ? buyers : sellers;
    
    let actions = [
      "send",
      "receive"
    ];
    
    let dataSets = [];
    
    clients.forEach(function(client) {
      let clientRole = client.get("roleDescription");
      let clientPosition = client.get("playerPosition");
      
      actions.forEach(function(action) {
        let isSender = action === "send";
        
        let senderRole       = isSender ? playerRole     : clientRole    ;
        let senderPosition   = isSender ? playerPosition : clientPosition;
        let receiverRole     = isSender ? clientRole     : playerRole    ;
        let receiverPosition = isSender ? clientPosition : playerPosition;
        
        let groups = selection.filter(function(group) {
          // We know there is at least one offer, and that they all contain (almost) the same information.
          let offer = group[0];
          
          let sender = offer.get("userSender");
          let receiver = offer.get("userReceiver");
          
          return this.isOfferUser(sender, senderRole, senderPosition) && this.isOfferUser(receiver, receiverRole, receiverPosition);
        }, this);
        
        let offers = groups.reduce(function(array, group) {
          return array.concat(group);
        }, []);
        
        let key = isSender ? "player.results.player.transactions.to" : "player.results.player.transactions.from";
        
        let labels = [
          i18n.t(key),
          i18n.t(clientRole),
          clientPosition
        ];
        
        let label = labels.join(i18n.t("player.results.player.transactions.space"));
        
        let data = getDataForOffers(offers);
        let colors = getColorsForOffers(offers);
        let borders = getBordersForOffers(offers, this.get("typesForRounds"));
        let radii = getRadiiForOffers(offers);
        let color = getColorForPosition(clientPosition);
        let dash = getDashForDirection(action);
        
        let dataSet = this.createChartDataSet(label, data, colors, borders, radii, color, dash);
        
        dataSets.pushObject(dataSet);
      }, this);
    }, this);
    
    return this.createChartData(dataSets);
  }),
  
  options: {
    scales: {
      xAxes: [{
        type: 'time',
        position: 'bottom',
        time: {
          displayFormats: {
            'second': "HH:mm:ss"
          },
          tooltipFormat: "DD-MM-YYYY HH:mm:ss",
          unit: 'second',
          unitStepSize: 30
        }
      }]
    }
  },
  
  actions: {
    selectWeek(week) {
      this.set("selectedWeek", week);
    }
  }
});
