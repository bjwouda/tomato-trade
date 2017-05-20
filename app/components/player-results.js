import Ember from 'ember';

import moment from 'moment';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  // These are used in the child components.
  histories: [],
  
  loadHistories: Ember.on('init', Ember.observer("game.gameHasEnded", "game.isImported", function() {
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
  }))
});
