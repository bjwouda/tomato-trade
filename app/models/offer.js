import Ember from 'ember'; 
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';


export default Model.extend({
  rev         : attr('string'),
  tomatoes    : attr('number'),
  price       : attr('number'),
  isExternal  : attr('boolean'),
  state       : attr('string'), // {'open': <ts>, 'accepted' <ts>}
  isConfirmed : attr('boolean', {defaultValue: false}),// before offer is 'accepted' it needs to be confirmed by both sides
  isAccepted  : attr('boolean', {defaultValue: false}),// before offer is 'accepted' it needs to be confirmed by both sides

  // notes      : attr('string'),
  ts         : attr('number', { defaultValue(){ return +moment(); } }), //timeStamp

  idxOfOfferInGame : attr('number'),
  roundNumber : attr('number'),
  weekNumber : attr('number'),
  game       : belongsTo('game'),
  receiver   : belongsTo('user'),
  sender     : belongsTo('user'),

  // for the race-condition, check if this flag is set, then set the state to accepted no matter what
  isAcceptedWatch : Ember.observer("isAccepted", function() {
    if(this.get("isAccepted")) {
      this.set("state", "accepted");
      this.save();
    }
  }),

  senderName : Ember.computed('sender.name', 'isExternal', function() {
    return (this.get('sender.id') === undefined) ? "External" : this.get('sender.name');
  }),

  receiverName : Ember.computed('sender.name', 'isExternal', function() {
    return (this.get("receiver.id") === undefined) ? "External" : this.get('receiver.name');
  }),

  senderId : Ember.computed('sender.id', 'isExternal', function() {
    return (this.get('sender.id') === undefined) ? "External" : this.get('sender.id');
  }),

  receiverId : Ember.computed('sender.id', 'isExternal', function() {
    return (this.get("receiver.id") === undefined) ? "External" : this.get('receiver.id');
  }),

  idxOfOfferInGameCalc: Ember.computed("", function() {
    let gameOffers = this.get("game.offers");
    if(gameOffers === undefined || gameOffers.map === undefined) { return ""; }

    return gameOffers.map((x)=>{ return x.get("id"); }).indexOf(this.get("id"));
    
  }),

});
