import Ember from 'ember';

import OfferUtilities from "../mixins/offer-utilities";
import TableUtilities from "../mixins/table-utilities";

export default Ember.Component.extend(OfferUtilities, TableUtilities, {
  transactions: Ember.computed("offers", function() {
    // Leave out external offers, they can be pretty high and take up the top spots all the time.
    let offers = this.get("offers").filter(function(offer) {
      return !this.isOfferExternalUser(offer.get("userSender")) && !this.isOfferExternalUser(offer.get("userReceiver"));
    }, this);
    
    return offers.map(function(offer) {
      let roundParameters = offer.get("round").split(/ /);
      let senderParameters = offer.get("userSender").split(/[ -]+/);
      let receiverParameters = offer.get("userReceiver").split(/[ -]+/);
      let offerParameters = offer.get("offer").split(/:|, /);
      
      let sender = this.localize("player.results.transactions.best." + senderParameters[0]) + " " + senderParameters[1] + " " + senderParameters[2];
      let receiver = this.localize("player.results.transactions.best." + receiverParameters[0]) + " " + receiverParameters[1] + " " + receiverParameters[2];
      
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
        "title": this.localize("player.results.transactions.round"),
        "disableSorting": true,
        "disableFiltering": true,
        "template": "custom/round-number-column"
      },
      {
        "propertyName": "sender",
        "title": this.localize("player.results.transactions.sender"),
        "disableSorting": true,
        "disableFiltering": true,
      },
      {
        "propertyName": "receiver",
        "title": this.localize("player.results.transactions.receiver"),
        "disableSorting": true,
        "disableFiltering": true,
      },
      {
        "propertyName": "amount",
        "title": this.localize("player.results.transactions.amount"),
        "disableSorting": true,
        "disableFiltering": true,
        "template": "custom/tomato-amount-column"
      },
      {
        "propertyName": "unitPrice",
        "title": this.localize("player.results.transactions.unitPrice"),
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
