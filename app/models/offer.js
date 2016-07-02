import Ember from 'ember'; 
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  tomatoes   : attr('number', {defaultValue: 0}),
  price      : attr('number', {defaultValue: 0}),
  isExternal : attr('boolean'),
  state      : attr('string'), // {'open': <ts>, 'accepted' <ts>}

  notes      : attr('string'),
  ts         : attr('number', {defaultValue: Date.now()}),
  
  game       : belongsTo('game'),
  receiver   : belongsTo('user'),
  sender     : belongsTo('user'),

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
  })

});
