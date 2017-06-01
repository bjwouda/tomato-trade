import Ember from 'ember';

export default Ember.Route.extend({
  i18n: Ember.inject.service(),
  
  title: function() {
    return this.get("i18n").t("index.title");
  },
  
  model: function(p) {
    return this.store.find('user', p.player_id);
  },
});
