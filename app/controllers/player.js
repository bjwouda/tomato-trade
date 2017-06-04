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
  
  tutorialOffer1Open: Ember.computed("model.name", function() {
    return Ember.Object.create({
      ts: moment(),
      roundNumber: 0,
      senderName: this.get("model.name"),
      receiverName: "Tutorial",
      tomatoes: 100,
      price: 1.0,
      state: "open"
    });
  }),
  
  tutorialOffer1Declined: Ember.computed("model.name", function() {
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
  
  tutorialOffer2Confirmed: Ember.computed("model.name", function() {
    return Ember.Object.create({
      ts: moment(),
      roundNumber: 0,
      senderName: this.get("model.name"),
      receiverName: "Tutorial",
      tomatoes: 100,
      price: 0.98,
      state: "confirmed",
      isConfirmed: true
    });
  }),
  
  tutorialOffer2Accepted: Ember.computed("model.name", function() {
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
  
  tutorialOffer3Open: Ember.computed("model.name", function() {
    return Ember.Object.create({
      ts: moment(),
      roundNumber: 0,
      senderName: "Tutorial",
      receiverName: this.get("model.name"),
      tomatoes: 60,
      price: 0.75,
      state: "open"
    });
  }),
  
  tutorialOffer3Declined: Ember.computed("model.name", function() {
    return Ember.Object.create({
      ts: moment(),
      roundNumber: 0,
      senderName: "Tutorial",
      receiverName: this.get("model.name"),
      tomatoes: 60,
      price: 0.75,
      state: "declined"
    });
  }),
  
  tutorialOpenOffersEmpty: [],
  tutorialSentOffersEmpty: [],
  
  tutorialOpenOffers1: Ember.computed("tutorialOffer3Open", function() {
    return [
      this.get("tutorialOffer3Open")
    ];
  }),
  
  tutorialSentOffers1: Ember.computed("tutorialOffer1Open", function() {
    return [
      this.get("tutorialOffer1Open")
    ];
  }),
  
  tutorialSentOffers2: Ember.computed("tutorialOffer2Confirmed", function() {
    return [
      this.get("tutorialOffer2Confirmed")
    ];
  }),
  
  tutorialLast5Transactions1: Ember.computed("tutorialOffer1Declined", function() {
    return [
      this.get("tutorialOffer1Declined")
    ];
  }),
  
  tutorialLast5Transactions2: Ember.computed("tutorialOffer1Declined", "tutorialOffer2Accepted", function() {
    return [
      this.get("tutorialOffer2Accepted"),
      this.get("tutorialOffer1Declined")
    ];
  }),
  
  tutorialLast5Transactions3: Ember.computed("tutorialOffer1Declined", "tutorialOffer2Accepted", "tutorialOffer3Declined", function() {
    return [
      this.get("tutorialOffer3Declined"),
      this.get("tutorialOffer2Accepted"),
      this.get("tutorialOffer1Declined")
    ];
  }),
  
  previouslyAcceptedOffers1: Ember.computed("tutorialOffer2Accepted", function() {
    return [
      this.get("tutorialOffer2Accepted")
    ];
  }),
});
