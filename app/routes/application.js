import Ember from 'ember';

export default Ember.Route.extend({
  i18n: Ember.inject.service(),
  
  moment: Ember.inject.service(),
  
  title: function() {
    return this.get("i18n").t("index.title");
  },
  
  beforeModel() {
    this.get('moment').changeLocale('nl');
  }
});
