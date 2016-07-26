import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

import GameConfigParser from '../mixins/game-config-parser';
import storeWithWeek from '../utils/store-with-week';


import _ from 'lodash/lodash';

export default Model.extend(GameConfigParser, {
  i18n: Ember.inject.service(),
  ts:                attr('number', { defaultValue(){ return new Date().getTime(); } }), //timeStamp
  history:           attr('string'),
  gameConfiguration: attr('string'), // CHECK THE MIXIN, quite some stuff attached there...
  gameName:          attr('string'),
  
  roundCnt:          attr('number', { defaultValue: 0 }),
  minutesPerRound:   attr('number', { defaultValue: 5 }),
  fine:              attr('number', { defaultValue: 0.2 }),
  fixedCost:         attr('number', { defaultValue: 0.05 }),
  timeStartTs:       attr('number'),
  timeEndTs:         attr('number'),
  timePausedTs:      attr('number'),
  
  retailPrice:       storeWithWeek("roundCnt", "retailPrice"),
  playerWeekStatus:  attr('json', { defaultValue: {} }),

  users:             hasMany('user', { async: true }),
  offers:            hasMany('offer', { async: true }),
  historyLogs:       hasMany('history', { async: true }),

  //                                     __           __
  //   _________  ____ ___  ____  __  __/ /____  ____/ /
  //  / ___/ __ \/ __ `__ \/ __ \/ / / / __/ _ \/ __  /
  // / /__/ /_/ / / / / / / /_/ / /_/ / /_/  __/ /_/ /
  // \___/\____/_/ /_/ /_/ .___/\__,_/\__/\___/\__,_/
  //                    /_/

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

  //Descending sort to historyLogs
  historyLogsSortingDescById  : ['ts:asc'],
  sortedHistoryLogsById: Ember.computed.sort('historyLogs', 'historyLogsSortingDescById'),

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
