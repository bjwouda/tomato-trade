import Ember from 'ember';

export default Ember.Route.extend({
  model(p) {
    return this.get('store').query('history', {
    	orderBy: "historyGame",
    	equalTo: p.game_id
    });
  },

  afterModel() {
  	this.get("store").findAll("offer");
  }


});
