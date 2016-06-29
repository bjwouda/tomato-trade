import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

import _ from 'lodash/lodash';

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
  	                   
  allUsers        : Ember.computed.filter('users.[]', function() {
    return true;
  }),
  	                   
  userLUT         : Ember.computed('allUsers.[]', function () {
    return _.groupBy(this.get("allUsers"),  (x) => { return x.get("id"); } );
  })

});