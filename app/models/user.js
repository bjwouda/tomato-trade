import Ember from 'ember'; 
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

import _ from 'lodash/lodash';

export default Model.extend({

  // normal attribtues
  name               : attr('string'),
  
  goalTomatoes       : attr('number', {defaultValue: 0}),
  tomatoes           : attr('number', {defaultValue: 0}),
  money              : attr('number', {defaultValue: 0}),
  isSeller           : attr('boolean'),

  // relational attributes
  userGame           : belongsTo('game'),
  receivedOffers     : hasMany('offer', { async: true, inverse: 'receiver' }),
  sentOffers         : hasMany('offer', { async: true, inverse: 'sender' }),

  // temporary attributes
  _offerTomato       : 0,
  _offerPrice        : 0,

  playerPosition     : Ember.computed("userGame.buyers", "userGame.sellers", "isSeller", "id", function () {
    if (this.get("isSeller")) { // for the sellers
      return this.get("userGame.sellers").map((x) => { return x.get("id"); }).indexOf(this.get("id")) + 1;
    } else { // for the buyers
      return this.get("userGame.buyers").map((x) => { return x.get("id"); }).indexOf(this.get("id")) + 1;
    }
  }),

  groupedReceivedOpenOffers : Ember.computed("traders.@each.id", "receivedOffers.@each.state", "sentOpenOffers.@each.state", "historicOffers.@each.state", "sender.id", function () {
    var self = this;
    
    var userIds = this.get("traders").map( (x) => x.get("id") ); // [1, 2, 3]
    var tmpReturnObj = _.indexBy(userIds); // {1: 1, 2: 2, 3: 3}
    
    var receivedOpenOffersLUT = _.groupBy(this.get("receivedOpenOffers"),  (x) => { return x.get("sender.id");} );
    var sentOpenOffersLUT = _.groupBy(this.get("sentOpenOffers"),  (x) => { return x.get("receiver.id");} );
    var historicOffersReceivedLUT = _.groupBy(this.get("historicOffers"),  (x) => { return x.get("receiver.id");} );
    var historicOffersSentLUT = _.groupBy(this.get("historicOffers"),  (x) => { return x.get("sender.id");} );

    
    var newReturnObj = _.mapValues(tmpReturnObj, function(v, k) { 
      var a = historicOffersReceivedLUT[k] ? historicOffersReceivedLUT[k] : [];
      var b = historicOffersSentLUT[k] ? historicOffersSentLUT[k] : []
      var allHistorcOffers = a.concat(b)
      allHistorcOffers = _.sortBy(allHistorcOffers, function(o) { return o.get("ts"); });
      
      return {
        user: self.get("userGame.userLUT." + k + ".0"), 
        openOffers: receivedOpenOffersLUT[k] ? receivedOpenOffersLUT[k] : [],
        sentOffers: sentOpenOffersLUT[k] ? sentOpenOffersLUT[k] : [],
        history: allHistorcOffers,
      }; 
    });
    
    console.log(newReturnObj);
    
    return newReturnObj;
  }),

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
