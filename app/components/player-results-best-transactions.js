import Ember from 'ember';

import TableUtilities from "../mixins/table-utilities";

import _ from 'lodash/lodash';

export default Ember.Component.extend(TableUtilities, {
  transactions: Ember.computed("histories.[]", "histories.@each", function() {
    let histories = this.get("histories");
    
    let offers = histories.filter(function(history) {
      return history.get("state") === "accepted" && history.get("userSender") !== "External" && history.get("userReceiver") !== "External";
    });
    
    let self = this;
    
    return offers.map(function(offer) {
      let roundParameters = offer.get("round").split(/ /);
      let senderParameters = offer.get("userSender").split(/[ -]+/);
      let receiverParameters = offer.get("userReceiver").split(/[ -]+/);
      let offerParameters = offer.get("offer").split(/:|, /);
      
      let sender = self.localize(senderParameters[0]) + " " + senderParameters[1] + " " + senderParameters[2];
      let receiver = self.localize(receiverParameters[0]) + " " + receiverParameters[1] + " " + receiverParameters[2];
      
      if(senderParameters[0] === "External") {
        sender = senderParameters[0];
      }
      
      if(receiverParameters[0] === "External") {
        receiver = receiverParameters[0];
      }
      
      return Ember.Object.create({
        round: parseInt(roundParameters[1]),
        sender: sender,
        receiver: receiver,
        amount: parseInt(offerParameters[1]),
        unitPrice: parseFloat(offerParameters[3])
      });
    });
  }),
  
  bestTransactions: Ember.computed.sort("transactions", function(transaction1, transaction2) {
    // See the unit price column definition for some important information regarding sorting.
    if(this.get("role") === "buyer") {
      // Lowest unit price.
      return transaction1.get("unitPrice") - transaction2.get("unitPrice");
    }
    else if(this.get("role") === "seller") {
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
        "sortDirection": this.get("role") === "buyer" ? "asc" : "desc"
      }
    ];
  })
});
