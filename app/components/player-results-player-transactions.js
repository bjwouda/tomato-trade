import Ember from 'ember';

import ChartUtilities from "../mixins/chart-utilities";

import _ from 'lodash/lodash';

export default Ember.Component.extend(ChartUtilities, {
  selectedRound: 1,
  
  numberOfRounds: Ember.computed("histories.[]", "histories.@each", function() {
    let offers = this.get("histories").filter(function(history) {
      return isOfferState(history.get("state"));
    });
    
    return Math.max.apply(null, offers.map(function(offer) {
      return parseInt(offer.get("round").split(/ /)[1]);
    }));
  }),
  
  rounds: Ember.computed("numberOfRounds", function() {
    return _.range(1, 1 + this.get("numberOfRounds"));
  }),
  
  data: Ember.computed("histories.[]", "histories.@each", "selectedRound", function() {
    let histories = this.get("histories");
    let selectedRound = this.get("selectedRound");
    
    let offers1 = histories.filter(function(history) {
      let sender = history.get("userSender");
      let receiver = history.get("userReceiver");
      let state = history.get("state");
      let round = parseInt(history.get("round").split(/ /)[1]);
      
      let hasUsers = sender.startsWith("seller 1") && receiver.startsWith("buyer 1");
      let hasState = isOfferState(state);
      let hasRound = round === selectedRound;
      
      return hasUsers && hasState && hasRound;
    });
    
    let offers2 = histories.filter(function(history) {
      let sender = history.get("userSender");
      let receiver = history.get("userReceiver");
      let state = history.get("state");
      let round = parseInt(history.get("round").split(/ /)[1]);
      
      let hasUsers = receiver.startsWith("seller 1") && sender.startsWith("buyer 1");
      let hasState = isOfferState(state);
      let hasRound = round === selectedRound;
      
      return hasUsers && hasState && hasRound;
    });
    
    let data1 = offers1.map(function(offer) {
      // Hacky way to get to the offer parameters in existing histories.
      let offerParameters = offer.get("offer").split(/, |:/);
      
      let tomatoes = offerParameters[1];
      let unitPrice = offerParameters[3];
      
      let time = offer.get("ts");
      
      return {
        x: moment(time),
        y: +(unitPrice)
      };
    });
    
    let data2 = offers2.map(function(offer) {
      // Hacky way to get to the offer parameters in existing histories.
      let offerParameters = offer.get("offer").split(/, |:/);
      
      let tomatoes = offerParameters[1];
      let unitPrice = offerParameters[3];
      
      let time = offer.get("ts");
      
      return {
        x: moment(time),
        y: +(unitPrice)
      };
    });
    
    let colors1 = offers1.map(function(offer) {
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
    
    let colors2 = offers2.map(function(offer) {
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
    
    let chartDataSet1 = this.createChartDataSet("results.player.seller1Buyer2Offers", data1, colors1);
    let chartDataSet2 = this.createChartDataSet("results.player.seller1Buyer2Offers", data2, colors2);
    
    return this.createChartData([
      chartDataSet1,
      chartDataSet2
    ]);
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

function isOfferState(state) {
  return state === "open" || state === "accepted" || state === "declined" || state === "confirmed" || state === "recalled - open" || state === "recalled - confirmed";
}
