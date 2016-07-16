import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

import GameConfigParser from '../mixins/game-config-parser';


import _ from 'lodash/lodash';

export default Model.extend(GameConfigParser, {
  i18n: Ember.inject.service(),

  users: hasMany('user', { async: true }),
  offers: hasMany('offer', { async: true }),
  historyLogs: hasMany('history', { async: true }),
  history: attr('string'),
  minutesPerRound: attr('number', { defaultValue: 5 }),
  roundCnt: attr('number', { defaultValue: 0 }),

  //Config Scenarios
  gameConfiguration: attr('string'), // CHECK THE MIXIN, quite some stuff attached there...
  timeStartTs: attr('number'),
  timeEndTs: attr('number'),
  timePausedTs: attr('number'),

  isPaused: Ember.computed("timePausedTs", function() { return this.get("timePausedTs") !== undefined && this.get("timePausedTs") !== null; }),

  weekCnt: Ember.computed("roundCnt", function() {
    var roundCnt = this.get("roundCnt") - 1;
    if (roundCnt < 0) {roundCnt = 0;}
    return this.get(`gameMatrix.${roundCnt}.tradingFor`);
  }),

  gameIsAboutToStart: Ember.computed("roundCnt", "numberOfRounds", function() {
    return +this.get("roundCnt") === 0;
  }),

  gameIsRunning: Ember.computed("roundCnt", "numberOfRounds", function() {
    return +this.get("roundCnt") > 0 && this.get("roundCnt") <= this.get("numberOfRounds.total");
  }),

  isLastRound: Ember.computed("roundCnt", "numberOfRounds", function() {
    return +this.get("roundCnt") === this.get("numberOfRounds.total");
  }),

  gameHasEnded: Ember.computed("roundCnt", "numberOfRounds", function() {
    return +this.get("roundCnt") > this.get("numberOfRounds.total");
  }),


  // using descending sort
  offerSortingDesc: ['ts:desc'],
  sortedOffers: Ember.computed.sort('offers', 'offerSortingDesc'),

  sellers: Ember.computed.filter('users.@each.isSeller',
    el => el.get("isSeller") === true),
  buyers: Ember.computed.filter('users.@each.isSeller',
    el => el.get("isSeller") === false),


  currentTitle: Ember.computed("roundCnt", function() {
    return  this.get(`gameMatrix.${this.get("roundCnt") - 1}.roundTitle`);
  }),

  allUsers: Ember.computed.filter('users', function() {
    return true;
  }),

  userLUT: Ember.computed('allUsers', function() {
    return _.groupBy(this.get("allUsers"), (x) => {
      return x.get("id"); });
  })

});
