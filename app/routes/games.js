import Ember from 'ember';

export default Ember.Route.extend({
  model(p) {
    return this.store.find('game', p.game_id);
  }
});
