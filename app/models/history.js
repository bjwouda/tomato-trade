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
    tomatoesOffer			: attr('string'),
    priceOffer				: attr('string'),
    round                   : attr('string'),
    idxOfOfferInGame        : attr('number'),
    
    ts                      : attr('number', { 
        defaultValue(){ return new Date().getTime(); }
    }), //timeStamp
    
    historyGame  : belongsTo('game', {async: true}),

    idxOfOfferInGameCalc: Ember.computed("offerId", function() {
        // return "0";

        if (!this.get("offerId")) { return "status"; }

        let gameOffers = this.get("historyGame.offers");
        if (gameOffers === undefined || gameOffers.map === undefined) { return ""; }

        return gameOffers.map((x)=>{ return x.get("id"); }).indexOf(this.get("offerId"));
        
    }),

    tsDesc     : Ember.computed('ts', function() {
        return moment(this.get("ts")).format("HH:mm:ss");
    }),

    //using descending sort
    //offerSortingDescById  : ['offerId:desc'],
    //sortedOffersById: Ember.computed.sort('offers', 'offerSortingDesc'),

});