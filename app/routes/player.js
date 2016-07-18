import Ember from 'ember';

export default Ember.Route.extend({
  model: function(p) {
    return this.store.find('user', p.player_id);
  },
});
