import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

export default Model.extend({
  users            : hasMany('user', { async: true }),
  offers           : hasMany('offer', { async: true }),
  history          : attr('string'),

  // using descending sort
  offerSortingDesc : ['ts:desc'],
  sortedOffers     : Ember.computed.sort('offers', 'offerSortingDesc'),

  sellers          : Ember.computed.filter('users.@each.isSeller', 
  					   el => el.get("isSeller") === true),
  buyers           : Ember.computed.filter('users.@each.isSeller', 
  	                   el => el.get("isSeller") === false),

});
