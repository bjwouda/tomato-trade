import Ember from 'ember';

export default Ember.Route.extend({
  i18n: Ember.inject.service(),
  
  title: function() {
    return this.get("i18n").t("index.title");
  },
  
  model: function() {
    return this.store.findAll('game');
  }
});
