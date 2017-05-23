import Ember from 'ember';

export default Ember.Mixin.create({
  isOfferOpenState(state) {
    return state === "open";
  },
  
  isOfferAcceptedState(state) {
    return state === "accepted";
  },
  
  isOfferDeclinedState(state) {
    return state === "declined";
  },
  
  isOfferConfirmedState(state) {
    return state === "confirmed" ;
  },
  
  isOfferRecalledOpenState(state) {
    return state === "recalled - open";
  },
  
  isOfferRecalledConfirmedState(state) {
    return state === "recalled - confirmed";
  },
  
  isOfferState(state) {
    return this.isOfferOpenState(state) || this.isOfferAcceptedState(state) || this.isOfferDeclinedState(state) || this.isOfferConfirmedState(state) || this.isOfferRecalledOpenState(state) || this.isOfferRecalledConfirmedState(state);
  },
  
  isOfferBuyerUser(user) {
    return user === "buyer";
  },
  
  isOfferSellerUser(user) {
    return user === "seller";
  },
  
  isOfferExternalUser(user) {
    return user === "External";
  }
});
