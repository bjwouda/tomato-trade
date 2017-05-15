import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  // These are used in the child components.
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
  }))
});
