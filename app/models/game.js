import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

import _ from 'lodash/lodash';

export default Model.extend({
  i18n: Ember.inject.service(),

  users            : hasMany('user', { async: true }),
  offers           : hasMany('offer', { async: true }),
  historyLogs      : hasMany('history', { async: true }),
  history          : attr('string'),
  
  minutesPerRound  : attr('number', { defaultValue: 5 }),
  weekCnt          : attr('number', { defaultValue: 0 }),
  nextCnt          : attr('number', { defaultValue: 0 }),
  currentTradeType : attr('string',  { defaultValue: "weekly" }),
  nextTradeType    : attr('string',  { defaultValue: "weekly" }),

  //Config Scenarios
  gameConfiguration: attr('string'),
  currentWeek      : attr('number', { defaultValue: 0}),

  //nextRound ()
  //loadGameConfig()

  
  timeStartTs      : attr('number'),
  timeEndTs        : attr('number'),

  // using descending sort
  offerSortingDesc : ['ts:desc'],
  sortedOffers: Ember.computed.sort('offers', 'offerSortingDesc'),

  // usersObserver: Ember.observer("users", function() {
  //   console.log("hello");
  //   console.log(this.get("users"));
  //   debugger;    
  //   var sellers = this.get("users.content").filter(el => el.get("isSeller") === true);

  //   // this.set("sellers", sellers);
  //   // var buyers = this.get("users").filter('users.@each.isSeller', el => el.get("isSeller") === false);
  //   // this.set("buyers", buyers);
  // }),
  	                   
  currentTitle: Ember.computed("weekCnt", "currentTradeType", function() {
    var tradeType = this.get("currentTradeType") || 'weekly';
    var tradingForWeek = +this.get("weekCnt") || 0;

    if (tradeType === "weekly") {
      tradingForWeek += 1;
    }

    var context = {
      currentWeek: this.get("weekCnt"),
      tradeType: tradeType,
      tradeWeek: tradingForWeek
    };

    return this.get('i18n').t("weekDescription", context);
  }),

  allUsers: Ember.computed.filter('users.[]', function() {
    return true;
  }),
  	                   
  userLUT: Ember.computed('allUsers.[]', function () {
    return _.groupBy(this.get("allUsers"),  (x) => { return x.get("id"); } );
  })

});