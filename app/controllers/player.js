import Ember from 'ember';
import OfferActions from '../mixins/offer-actions';
import LangActions from '../mixins/lang-actions';
import TutorialActions from '../mixins/tutorial-actions';

let lastRound = 1;

export default Ember.Controller.extend(OfferActions, LangActions, TutorialActions, {
  game: Ember.computed.alias("model.userGame.content"),
  _extOfferTomato: 0,
  
  clearInputsOnNewRound: Ember.observer("game.roundCnt", function() {
    let roundCnt = this.get('game.roundCnt');
    
    if(roundCnt === lastRound)  {
      return;
    }
    
    lastRound = roundCnt;

    this.set("_ext_offerTomato", "");
    this.get("game.users").forEach((u) => {
      u.set("_offerTomato", "");
      u.set("_offerPrice", "");
    });
  }),
  
  isTutorialActive: Ember.computed.alias("game.gameIsAboutToStart")
});
