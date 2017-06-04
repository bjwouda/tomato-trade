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
  
  isTutorialActive: Ember.computed.alias("game.gameIsAboutToStart"),
  
  tutorialOffer1: Ember.computed("model.name", function() {
    return Ember.Object.create({
      ts: moment(),
      roundNumber: 0,
      senderName: this.get("model.name"),
      receiverName: "Tutorial",
      tomatoes: 100,
      price: 1.0,
      state: "declined"
    });
  }),
  
  tutorialOffer2: Ember.computed("model.name", function() {
    return Ember.Object.create({
      ts: moment(),
      roundNumber: 0,
      senderName: this.get("model.name"),
      receiverName: "Tutorial",
      tomatoes: 100,
      price: 0.98,
      state: "accepted"
    });
  }),
  
  tutorialLast5Transactions1: Ember.computed("tutorialOffer1", function() {
    return [
      this.get("tutorialOffer1")
    ];
  }),
  
  tutorialLast5Transactions2: Ember.computed("tutorialOffer1", "tutorialOffer2", function() {
    return [
      this.get("tutorialOffer2"),
      this.get("tutorialOffer1")
    ];
  }),
  
  previouslyAcceptedOffers1: Ember.computed("tutorialOffer2", function() {
    return [
      this.get("tutorialOffer2")
    ];
  }),
});
