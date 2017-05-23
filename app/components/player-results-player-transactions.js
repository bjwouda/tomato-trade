import Ember from 'ember';

import OfferUtilities from "../mixins/offer-utilities";
import ChartUtilities from "../mixins/chart-utilities";

import _ from 'lodash/lodash';

function getOffersForPairInRound(offers, role1, position1, role2, position2) {
  return offers.filter(function(offer) {
    return offer.get("userSender").startsWith(role1 + " " + position1) && offer.get("userReceiver").startsWith(role2 + " " + position2);
  });
}

function getDataFromOffers(offers) {
  return offers.map(function(offer) {
    let offerParameters = offer.get("offer").split(/, |:/);
    
    let tomatoes = offerParameters[1];
    let unitPrice = offerParameters[3];
    
    let time = offer.get("ts");
    
    return {
      x: moment(time),
      y: +(unitPrice)
    };
  });
}

function getColorsFromOffers(offers) {
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

export default Ember.Component.extend(OfferUtilities, ChartUtilities, {
  selectedRound: 1,
  
  numberOfRounds: Ember.computed("histories.[]", "histories.@each", function() {
    let offers = this.get("histories").filter(function(history) {
      return this.isOfferState(history.get("state"));
    }, this);
    
    return Math.max.apply(null, offers.map(function(offer) {
      return parseInt(offer.get("round").split(/ /)[1]);
    }));
  }),
  
  rounds: Ember.computed("numberOfRounds", function() {
    return _.range(1, 1 + this.get("numberOfRounds"));
  }),
  
  data: Ember.computed("histories.[]", "histories.@each", "buyers", "sellers", "selectedRound", function() {
    let histories = this.get("histories");
    
    let buyers = this.get("buyers");
    let sellers = this.get("sellers");
    
    let selectedRound = this.get("selectedRound");
    
    let offers = histories.filter(function(history) {
      let state = history.get("state");
      let round = parseInt(history.get("round").split(/ /)[1]);
      
      let hasState = this.isOfferState(state);
      let hasRound = round === selectedRound;
      
      return hasState && hasRound;
    }, this);
    
    let player = this.get("player");
    let playerRole = player.get("roleDescription");
    let playerPosition = player.get("playerPosition");
    let playerIsSeller = player.get("isSeller");
    
    let clients = [];
    
    if(playerIsSeller) {
      clients = buyers;
    }
    else {
      clients = sellers;
    }
    
    let dataSets = [];
    
    clients.forEach(function(client) {
      let clientRole = client.get("roleDescription");
      let clientPosition = client.get("playerPosition");
      
      let sentOffers = getOffersForPairInRound(offers, playerRole, playerPosition, clientRole, clientPosition);
      let receivedOffers = getOffersForPairInRound(offers, clientRole, clientPosition, playerRole, playerPosition);
      
      let sentData = getDataFromOffers(sentOffers);
      let receivedData = getDataFromOffers(receivedOffers);
      
      let sentColors = getColorsFromOffers(sentOffers);
      let receivedColors = getColorsFromOffers(receivedOffers);
      
      let sentDataSet = this.createChartDataSet("results.player.received", sentData, sentColors);
      let receivedDataSet = this.createChartDataSet("results.player.sent", receivedData, receivedColors);
      
      dataSets.pushObject(sentDataSet);
      dataSets.pushObject(receivedDataSet);
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
    selectRound(round) {
      this.set("selectedRound", round);
    }
  }
});
