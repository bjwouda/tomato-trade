import Ember from 'ember';

import OfferActions from '../mixins/offer-actions';


export default Ember.Component.extend(OfferActions, {

  actions: {
    saveUser(user) { user.save(); },

  }

});
