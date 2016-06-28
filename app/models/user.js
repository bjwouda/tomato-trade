import Ember from 'ember'; 
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

import _ from 'lodash/lodash';

export default Model.extend({

  // normal attribtues
  name               : attr('string'),
  tomatoes           : attr('number', {defaultValue: 200}),
  money              : attr('number', {defaultValue: 200}),
  isSeller           : attr('boolean'),

  // relational attributes
  userGame           : belongsTo('game'),
  receivedOffers     : hasMany('offer', { async: true, inverse: 'receiver' }),
  sentOffers         : hasMany('offer', { async: true, inverse: 'sender' }),

  // temporary attributes
  _offerTomato       : 0,
  _offerPrice        : 0,

  // computed attributes
  receivedOpenOffers : Ember.computed.filter('receivedOffers.@each.state', 
                         (el) => {return el.get("state") === "open"; }),
  sentOpenOffers     : Ember.computed.filter('sentOffers.@each.state', 
                         (el) => {return el.get("state") === "open"; }),

  historicOffers     : Ember.computed('receivedOffers.@each.state', 'sentOffers.@each.state', 
    function() {
      var receivedOffers = this.get('receivedOffers').filter((el) => {return el.get("state") !== "open"; });
      var sentOffers = this.get('sentOffers').filter((el) => {return el.get("state") !== "open"; });

      let combination = [].concat(receivedOffers, sentOffers);
      return _.sortBy(combination, function(o) { return o.get('ts'); }).reverse();
  }),

  traders            : Ember.computed('userGame.sellers.[]', 'userGame.buyers.[]', function(){
  	if (this.get('isSeller')) {
  		return this.get('userGame.buyers');
  	} else {
  		return this.get('userGame.sellers');
  	}
  }),

  hasValidOffer      : Ember.computed('_offerPrice', '_offerTomato', function() {
  	return +this.get('_offerTomato') > 0 && +this.get('_offerPrice') > 0;
  })

});
