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
  })
});
