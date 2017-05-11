import Ember from 'ember';
import OfferActions from '../mixins/offer-actions';
import LangActions from '../mixins/lang-actions';

import _ from 'lodash/lodash';

let lastRound = 1;

export default Ember.Controller.extend(OfferActions, LangActions, {
  game: Ember.computed.alias("model.userGame.content"),
  _extOfferTomato: 0,

  clearInputsOnNewRound: Ember.observer("game.roundCnt", function() {
    let roundCnt = this.get('game.roundCnt');
    
    if (roundCnt === lastRound) { return; }
    
    lastRound = roundCnt;

    this.set("_ext_offerTomato", "");
    this.get("game.users").forEach((u) => {
      u.set("_offerTomato", "");
      u.set("_offerPrice", "");
    });
  }),
  
  isTutorialActive: Ember.computed.alias("game.gameIsAboutToStart"),
  
  chartData: Ember.computed("game", function() {
    return createChartData(["Round 1", "Round 2", "Round 3", "Round 4", "Round 5", "Round 6", "Round 7", "Round 8", "Round 9"], "Points", [10, 11, 8, 7, 13, 14, 6, 3, 8]);
  })
});

function createChartData(labels, label, data) {
  return {
    labels: labels,
    datasets: [
      {
        label: label,
        fill: false,
        lineTension: 0,
        backgroundColor: "hsl(9,100%,64%)",
        borderColor: "hsl(9,100%,64%)",
        pointBorderColor: "hsl(9,100%,44%)",
        pointBackgroundColor: "hsl(9,100%,64%)",
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHitRadius: 16,
        data: data
      }
    ]
  };
}