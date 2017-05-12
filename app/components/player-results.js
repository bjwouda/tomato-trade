import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  histories: [],
  
  loadHistories: Ember.on('init', Ember.observer("game.gameHasEnded", function() {
    if(this.get("game.gameHasEnded")) {
      // Load the data only when the game ends.
      let self = this;
      
      let historyQuery = this.get('store').query('history', {
        orderBy: "historyGame",
        equalTo: this.get("game.id")
      });
      
      historyQuery.then(function(histories) {
        self.set("histories", histories.filter(function(history) {
          return history.get('type') === "Statistic";
        }));
      });
    }
    else {
      // Reset the data when we go back in time.
      this.set("histories", []);
    }
  })),
  
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
    
    return createChartData("Remaining tomatoes", labels, data);
  })
});

function createChartData(label, labels, data) {
  return {
    labels: labels,
    datasets: [
      {
        label: label,
        fill: false,
        lineTension: 0,
        backgroundColor: "hsl(9,100%,64%)",
        borderColor: "hsl(9,100%,64%)",
        pointBorderColor: "hsl(9,100%,44%)",
        pointBackgroundColor: "hsl(9,100%,64%)",
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHitRadius: 16,
        data: data
      }
    ]
  };
}
