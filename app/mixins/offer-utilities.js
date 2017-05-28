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
  
  isOfferUser(user, role, position) {
    if(typeof position === "undefined") {
      return user.startsWith(role);
    }
    else {
      return user.startsWith(role + " " + position);
    }
  },
  
  isOfferBuyerUser(user, position) {
    return this.isOfferUser(user, "buyer");
  },
  
  isOfferSellerUser(user, position) {
    return this.isOfferUser(user, "seller");
  },
  
  isOfferExternalUser(user) {
    return user === "External";
  }
});
