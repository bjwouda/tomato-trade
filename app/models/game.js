import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

import GameConfigParser from '../mixins/game-config-parser';
import storeWithWeek from '../utils/store-with-week';

let rawConfigString = `
game            , w1   , w2    , d1   , w3   , d2   , w4   , d3    , d4  # 4 weeks  , 10 trades
retailPrice     , 1.0  , 1.0   , 1.0  , 1.0  , 1.0  , 1.0  , 1.0   , 1.0  # 4 weeks , 10 trades
fine            , 3.0  , 1.0   , 1.0  , 1.0  , 1.0  , 1.0  , 1.0   , 1.0  # 4 weeks , 10 trades
fixedCost       , 2.0  , 1.0   , 1.0  , 1.0  , 1.0  , 1.0  , 1.0   , 1.0  # 4 weeks , 10 trades
minutesPerRound , 2.0  , 1.0   , 1.0  , 1.0  , 1.0  , 1.0  , 1.0   , 1.0  # 4 weeks , 10 trades
b1              , 1000 , 12000 , 1000 , 1000 , 1000 , 1000 , 12000 , 1000
b1_extPrice     , 9999 , 12000 , 1000 , 1000 , 1000 , 1000 , 12000 , 1000
b1_extTomato    , 1    , 12000 , 1000 , 1000 , 1000 , 1000 , 12000 , 1000
s1              , 1000 , 12000 , 1000 , 1000 , 1000 , 1000 , 12000 , 1000
s1_extPrice     , 9999 , 12000 , 1000 , 1000 , 1000 , 1000 , 12000 , 1000
s1_extTomato    , 1    , 12000 , 1000 , 1000 , 1000 , 1000 , 12000 , 1000
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
