import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  tomatoes: attr('number', {defaultValue: 50}),
  price: attr('number', {defaultValue: 50}),
  isExternal: attr('boolean'),
  state: attr('string'),
  notes: attr('string'),
  ts: attr('number', {defaultValue: Date.now()}),
  
  game: belongsTo('game'),
  receiver: belongsTo('user'),
  sender: belongsTo('user'),

  senderName: Ember.computed('sender.name', 'isExternal', function() {
  	if (this.get('isExternal')) {
  		return "External";
  	} else {
  		return this.get('sender.name');
  	}
  })
});