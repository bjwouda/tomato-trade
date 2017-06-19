import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

import GameConfigParser from '../mixins/game-config-parser';
import storeWithWeek from '../utils/store-with-week';

import moment from 'moment';

let rawConfigString = `
game            ,      w1 ,      d1 ,      w2 ,      d2
retailPrice     ,    1.20 ,    1.20 ,    1.10 ,    1.10
fine            ,    0.20 ,    0.20 ,    0.20 ,    0.20
fixedCost       ,    0.05 ,    0.05 ,    0.05 ,    0.05
minutesPerRound ,       7 ,       7 ,       7 ,       7
tradingSchedule ,     3-5 ,     3-5 ,     3-5 ,     3-5
b1              , 2400000 , 2400000 , 2750000 , 2750000
b1_extPrice     ,    1.15 ,    1.25 ,    1.20 ,    1.15
b1_extTomato    ,  350000  , 500000 ,  900000 ,  350000
b2              , 2750000 , 2750000 , 1800000 , 1800000
b2_extPrice     ,    1.30 ,    1.20 ,    1.20 ,    1.20
b2_extTomato    ,  400000 ,  500000 ,  800000 , 1000000
s1              , 2500000 , 2500000 , 2000000 , 2000000
s1_extPrice     ,    1.05 ,    1.05 ,    1.05 ,    1.05
s1_extTomato    , 2000000 ,  400000 ,  400000 ,  200000
s2              , 1500000 , 1500000 , 2500000 , 2500000
s2_extPrice     ,    1.10 ,    1.10 ,    1.10 ,    1.00
s2_extTomato    ,  900000 ,  550000 ,  900000 ,  300000
`;

import _ from 'lodash/lodash';

export default Model.extend(GameConfigParser, {
  i18n: Ember.inject.service(),
  ts:                attr('number', { defaultValue(){ return +moment(); } }), //timeStamp
  history:           attr('string'),
  gameConfiguration: attr('string', { defaultValue: rawConfigString }), // CHECK THE MIXIN, quite some stuff attached there...
  gameName:          attr('string'),
  
  offerCnt:          attr('number', { defaultValue: 1 }),
  roundCnt:          attr('number', { defaultValue: 0 }),
  minutesPerRound:   storeWithWeek("roundCnt", "minutesPerRound"),
  fine:              storeWithWeek("roundCnt", "fine"),
  fixedCost:         storeWithWeek("roundCnt", "fixedCost"),
  timeStartTs:       attr('number'),
  timeEndTs:         attr('number'),
  timePausedTs:      attr('number'),
  isNew:             attr('boolean', { defaultValue: true }),
  
  retailPrice:       storeWithWeek("roundCnt", "retailPrice"),
  playerWeekStatus:  attr('json', { defaultValue: {} }),

  users:             hasMany('user', { async: true }),
  offers:            hasMany('offer', { async: true }),
  // historyLogs:       hasMany('history', { async: true }),
  
  isImported:        attr('boolean', { defaultValue: false }),

  //                                     __           __
  //   _________  ____ ___  ____  __  __/ /____  ____/ /
  //  / ___/ __ \/ __ `__ \/ __ \/ / / / __/ _ \/ __  /
  // / /__/ /_/ / / / / / / /_/ / /_/ / /_/  __/ /_/ /
  // \___/\____/_/ /_/ /_/ .___/\__,_/\__/\___/\__,_/
  //                    /_/

  isPaused: Ember.computed("timePausedTs", function() { return this.get("timePausedTs") !== undefined && this.get("timePausedTs") !== null; }),

  roundNumber: Ember.computed.alias("roundCnt"),
  weekNumber: Ember.computed.alias("weekCnt"),
  weekCnt: Ember.computed("roundCnt", function() {
    var roundCnt = this.get("roundCnt") - 1;
    if(roundCnt < 0) {roundCnt = 0;}
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
  historyLogsSortingDescById  : ['ts:desc'],
  sortedHistoryLogsById: Ember.computed.sort('historyLogs', 'historyLogsSortingDescById'),

  sellers: Ember.computed.filter('users.@each.isSeller',
    el => el.get("isSeller") === true),
  buyers: Ember.computed.filter('users.@each.isSeller',
    el => el.get("isSeller") === false),


  currentGameSettings: Ember.computed("roundCnt", function() {
    return  this.get(`gameMatrix.${this.get("roundCnt") - 1}`);
  }),

  allUsers: Ember.computed.filter('users', function() {
    return true;
  }),

  userLUT: Ember.computed('allUsers', function() {
    return _.groupBy(this.get("allUsers"), (x) => {
      return x.get("id"); });
  })

});
