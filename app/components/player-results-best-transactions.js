import Ember from 'ember';

import OfferUtilities from "../mixins/offer-utilities";
import TableUtilities from "../mixins/table-utilities";

export default Ember.Component.extend(OfferUtilities, TableUtilities, {
  transactions: Ember.computed("histories.[]", "histories.@each", function() {
    let histories = this.get("histories");
    
    let offers = histories.filter(function(history) {
      return this.isOfferAcceptedState(history.get("state")) && !this.isOfferExternalUser(history.get("userSender")) && !this.isOfferExternalUser(history.get("userReceiver"));
    }, this);
    
    return offers.map(function(offer) {
      let roundParameters = offer.get("round").split(/ /);
      let senderParameters = offer.get("userSender").split(/[ -]+/);
      let receiverParameters = offer.get("userReceiver").split(/[ -]+/);
      let offerParameters = offer.get("offer").split(/:|, /);
      
      let sender = this.localize(senderParameters[0]) + " " + senderParameters[1] + " " + senderParameters[2];
      let receiver = this.localize(receiverParameters[0]) + " " + receiverParameters[1] + " " + receiverParameters[2];
      
      if(this.isOfferExternalUser(senderParameters[0])) {
        sender = senderParameters[0];
      }
      
      if(this.isOfferExternalUser(receiverParameters[0])) {
        receiver = receiverParameters[0];
      }
      
      return Ember.Object.create({
        round: parseInt(roundParameters[1]),
        sender: sender,
        receiver: receiver,
        amount: parseInt(offerParameters[1]),
        unitPrice: parseFloat(offerParameters[3])
      });
    }, this);
  }),
  
  bestTransactions: Ember.computed.sort("transactions", function(transaction1, transaction2) {
    // See the unit price column definition for some important information regarding sorting.
    if(this.isOfferBuyerUser(this.get("role"))) {
      // Lowest unit price.
      return transaction1.get("unitPrice") - transaction2.get("unitPrice");
    }
    else if(this.isOfferSellerUser(this.get("role"))) {
      // Highest unit price.
      return transaction2.get("unitPrice") - transaction1.get("unitPrice");
    }
    else {
      // Largest transaction (default).
      return transaction2.get("amount") * transaction2.get("unitPrice") - transaction1.get("amount") * transaction1.get("unitPrice");
    }
  }),
  
  columns: Ember.computed("i18n.locale", "role", function() {
    return [
      {
        "propertyName": "round",
        "title": this.localize("results.transactions.round"),
        "disableSorting": true,
        "disableFiltering": true,
        "template": "custom/round-number-column"
      },
      {
        "propertyName": "sender",
        "title": this.localize("results.transactions.sender"),
        "disableSorting": true,
        "disableFiltering": true,
      },
      {
        "propertyName": "receiver",
        "title": this.localize("results.transactions.receiver"),
        "disableSorting": true,
        "disableFiltering": true,
      },
      {
        "propertyName": "amount",
        "title": this.localize("results.transactions.amount"),
        "disableSorting": true,
        "disableFiltering": true,
        "template": "custom/tomato-amount-column"
      },
      {
        "propertyName": "unitPrice",
        "title": this.localize("results.transactions.unitPrice"),
        "disableSorting": true,
        "disableFiltering": true,
        "template": "custom/euro-currency-column",
        
        // Table sorts on round by default, even if sorting is disabled, grr.
        // Unfortunately, this makes the sort above subservient to this value.
        // We still need the sort above because we use the "take" helper.
        // Basically, this is a hack added to make things work.
        "sortPrecedence": 1000,
        "sortDirection": this.isOfferBuyerUser(this.get("role")) ? "asc" : "desc"
      }
    ];
  })
});
