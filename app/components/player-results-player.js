import Ember from 'ember';

export default Ember.Component.extend({
  cooperative1Revenue: Ember.computed("histories.[]", "histories.@each", "round", function() {
    let histories = this.get("histories");
    let index = this.get("round");
    
    let offers = histories.filter(function(history) {
      let sender = history.get("userSender");
      let receiver = history.get("userReceiver");
      let state = history.get("state");
      let round = parseInt(history.get("round").split(/ /)[1]);
      
      let hasUsers = (sender.startsWith("seller 1") && (receiver.startsWith("buyer 1") || receiver.startsWith("buyer 2") || receiver.startsWith("External"))) || (receiver.startsWith("seller 1") && (sender.startsWith("buyer 1") || sender.startsWith("buyer 2") || sender.startsWith("External")));
      let hasState = state === "accepted";
      let hasRound = round === index;
      
      return hasUsers && hasState && hasRound;
    });
    
    let revenue = offers.map(function(offer) {
      let offerParameters = offer.get("offer").split(/, |:/);
      
      return offerParameters[1] * offerParameters[3];
    }).reduce(function(revenue1, revenue2) {
      return revenue1 + revenue2;
    }, 0);
    
    return revenue;
  }),
  
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
  })
});
