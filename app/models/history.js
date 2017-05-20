import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
    offerId                 : attr('string'),
    userSender              : attr('string'), //e.g. Seller1
    userReceiver            : attr('string'), //Buyer1
    state                   : attr('string'), //Open, Accepted, Declined could also be represented by color (Yellow: offer sent, Red: offer rejected, etc)
    cssStatus               : attr('string'), //active, success, danger 
    offer                   : attr('string'), // number of tomatos, price
    tomatoesOffer           : attr('string'),
    priceOffer              : attr('string'),
    round                   : attr('string'),
    idxOfOfferInGame        : attr('number'),
    
    ts                      : attr('number', { defaultValue(){ return +moment(); } }), //timeStamp
    
    historyGame             : belongsTo('game', {async: true}),

    idxOfOfferInGameCalc: Ember.computed("offerId", "historyGame", "historyGame.offers.[]", function() {
        // return "0";

        if (!this.get("offerId")) { return "status"; }

        let gameOffers = this.get("historyGame.offers")

        if (gameOffers === undefined || gameOffers.map === undefined) { return ""; }

        let ids = JSON.parse(sessionStorage["allObjIds"])
        return ids.indexOf(this.get("offerId")) + 1;
        
    }),

    tsDesc: Ember.computed('ts', function() {
        return moment(this.get("ts")).format("HH:mm:ss");
    }),

    //using descending sort
    //offerSortingDescById  : ['offerId:desc'],
    //sortedOffersById: Ember.computed.sort('offers', 'offerSortingDesc'),

});