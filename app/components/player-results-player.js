import Ember from 'ember';

import ChartUtilities from "../mixins/chart-utilities";

export default Ember.Component.extend(ChartUtilities, {
  trader1RemainingTomatoes: Ember.computed("histories.[]", "histories.@each", function() {
    let histories = this.get('histories');
    
    let statistics = histories.filter(function(history) {
      return history.get('userSender') === "Stats for Trader 1";
    });
    
    let labels = statistics.map(function(statistic) {
      return statistic.get('round');
    });
    
    let data = statistics.map(function(statistic) {
      // Hacky way to get to the remaining tomatoes in existing histories.
      return statistic.get('offer').split(/, |:/)[3];
    });
    
    return this.createChartData("results.player.remainingTomatoes", labels, data);
  }),
  
  seller1Buyer2Offers: Ember.computed("histories.[]", "histories.@each", function() {
    let histories = this.get("histories");
    
    let offers = histories.filter(function(history) {
      let sender = history.get("userSender");
      let receiver = history.get("userReceiver");
      let state = history.get("state");
      
      let hasUsers = sender.startsWith("seller 1") && receiver.startsWith("buyer 2");
      let hasState = state === "open" || state === "accepted" || state === "declined" || state === "confirmed" || state === "recalled - open" || state === "recalled - confirmed";
      
      return hasUsers && hasState;
    });
    
    let labels = offers.map(function(offer) {
      return offer.get("state");
    });
    
    let data = offers.map(function(offer) {
      // Hacky way to get to the offer parameters in existing histories.
      let offerParameters = offer.get("offer").split(/, |:/);
      
      let tomatoes = offerParameters[1];
      let unitPrice = offerParameters[3];
      
      return +(unitPrice);
    });
    
    return this.createChartData("results.player.seller1Buyer2Offers", labels, data);
  }),
});
