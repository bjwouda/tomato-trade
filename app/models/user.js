import Ember from 'ember'; 
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';


import _ from 'lodash/lodash';

function storeWithWeek(key) {
  return Ember.computed("userGame.weekCnt", "playerWeekStatus", {
    get() {
      let weekCnt = this.get("userGame.weekCnt");
      let tmpKey = `playerWeekStatus.w${weekCnt}.${key}`;
      return this.get(tmpKey) || 0;
    },
    set() {
      let val = arguments[1];
      let weekCnt = this.get("userGame.weekCnt");
      var previousObj = this.get("playerWeekStatus");

      if (!weekCnt) {return;}

      if (! previousObj[`w${weekCnt}`]) { previousObj[`w${weekCnt}`] = {}; }
      previousObj[`w${weekCnt}`][key] = val;

      console.log(previousObj);

      this.set("playerWeekStatus", previousObj);
      // this.save();
      return val;
    }
  });
}

export default Model.extend({
  rev         : attr('string'),

  // normal attribtues
  name               : attr('string'),
  
  goalTomatoes       : storeWithWeek("goalTomatoes"),
  tomatoes           : storeWithWeek("tomatoes"),
  remainingTomatoes  : Ember.computed("tomatoes", "goalTomatoes", function() {
    return this.get("goalTomatoes") - Math.abs(this.get("tomatoes"));
  }),

  money              : storeWithWeek("money"),
  avgTomatoPrice     : Ember.computed("tomatoes", "money", function() {
    if (this.get("money") === 0) {return 0;}
    return Math.abs(this.get("tomatoes") / this.get("money"));
  }),
  
  isSeller           : attr('boolean'),
  playerWeekStatus   : attr({defaultValue: {}}),

  // relational attributes
  userGame           : belongsTo('game'),
  receivedOffers     : hasMany('offer', { async: true, inverse: 'receiver' }),
  sentOffers         : hasMany('offer', { async: true, inverse: 'sender' }),

  // temporary attributes
  _offerTomato       : undefined,
  _offerPrice        : undefined,

  playerIdInGame: Ember.computed("playerPosition", function() {
    let prefix = this.get("isSeller") ? "s" : "b";
    let pos = this.get("playerPosition");
    return `${prefix}${pos}`;
  }),

  playerPosition: Ember.computed("userGame.buyers", "userGame.sellers", "isSeller", "id", function () {
    if (this.get("isSeller")) { // for the sellers
      return this.get("userGame.sellers").map((x) => { return x.get("id"); }).indexOf(this.get("id")) + 1;
    } else { // for the buyers
      if (this.get("userGame.buyers")) {
        return this.get("userGame.buyers").map((x) => { return x.get("id"); }).indexOf(this.get("id")) + 1;
      }
    }
  }),

  groupedReceivedOpenOffers: Ember.computed("traders.@each.id", "receivedOffers.@each.state", "sentOpenOffers.@each.state", "historicOffers.@each.state", function () {
    var userIds = this.get("traders").map( (x) => { 
      return {"id": x.get("id"), "ref": x};
    } ); // [1, 2, 3]
    var tmpReturnObj = _.indexBy(userIds, "id"); // {1: 1, 2: 2, 3: 3}
    tmpReturnObj["External"] = {"id": "External", "ref": {'name': "External"}};
    
    var receivedOpenOffersLUT = _.groupBy(this.get("receivedOpenOffers"),  (x) => { return x.get("senderId");} );
    var sentOpenOffersLUT = _.groupBy(this.get("sentOpenOffers"),  (x) => { return x.get("receiverId");} );
    var historicOffersSentLUT = _.groupBy(this.get("historicOffers"),  (x) => { return x.get("senderId");} );
    var historicOffersReceivedLUT = _.groupBy(this.get("historicOffers"),  (x) => { return x.get("receiverId");} );

    var newReturnObj = _.mapValues(tmpReturnObj, function(v, k) { 
      var a = historicOffersReceivedLUT[k] ? historicOffersReceivedLUT[k] : [];
      var b = historicOffersSentLUT[k] ? historicOffersSentLUT[k] : [];
      var allHistorcOffers = a.concat(b);
      allHistorcOffers = _.sortBy(allHistorcOffers, function(o) { return o.get("ts"); });
      
      return {
        user: v.ref, 
        openOffers: receivedOpenOffersLUT[k] ? receivedOpenOffersLUT[k] : [],
        sentOffers: sentOpenOffersLUT[k] ? sentOpenOffersLUT[k] : [],
        history: allHistorcOffers,
      }; 
    });
    
    console.log(newReturnObj);
    
    return newReturnObj;
  }),

  // computed attributes

  externalOffers: Ember.computed("groupedReceivedOpenOffers", function() {
    return this.get("groupedReceivedOpenOffers.External");
  }),

  receivedOpenOffers: Ember.computed.filter('receivedOffers.@each.state', 
                         (el) => {return el.get("state") === "open"; }),
  sentOpenOffers: Ember.computed.filter('sentOffers.@each.state', 
                         (el) => {return el.get("state") === "open"; }),

  historicOffers: Ember.computed('receivedOffers.@each.state', 'sentOffers.@each.state', 
    function() {
      var receivedOffers = this.get('receivedOffers').filter((el) => {return el.get("state") !== "open"; });
      var sentOffers = this.get('sentOffers').filter((el) => {return el.get("state") !== "open"; });

      let combination = [].concat(receivedOffers, sentOffers);
      return _.sortBy(combination, function(o) { return o.get('ts'); }).reverse();
  }),

  roleDescription: Ember.computed('isSeller', function() {
    return this.get('isSeller') ? 'seller' : 'buyer';
  }),

  traders: Ember.computed('isSeller', 'userGame.sellers.[]', 'userGame.buyers.[]', function(){
  	if (this.get('isSeller')) {
  		return this.get('userGame.buyers');
  	} else {
  		return this.get('userGame.sellers');
  	}
  }),

  hasValidOffer: Ember.computed('_offerPrice', '_offerTomato', function() {
  	return +this.get('_offerTomato') > 0 && +this.get('_offerPrice') > 0;
  })

});
