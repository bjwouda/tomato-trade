import Ember from 'ember';

import OfferActions from '../mixins/offer-actions';

export default Ember.Component.extend(OfferActions, {
  i18n: Ember.inject.service(),
  
  actions: {
    saveUser(user) {
      user.save();
    }
  }
});
