import Ember from 'ember';

import OfferUtilities from "../mixins/offer-utilities";
import TableUtilities from "../mixins/table-utilities";

export default Ember.Component.extend(OfferUtilities, TableUtilities, {
  transactions: Ember.computed("offers", function() {
    return this.get("offers").map(function(offer) {
      let roundParameters = offer.get("round").split(/ /);
      let senderParameters = offer.get("userSender").split(/[ -]+/);
      let receiverParameters = offer.get("userReceiver").split(/[ -]+/);
      let offerParameters = offer.get("offer").split(/:|, /);
      
      let role = senderParameters[0];
      let position = senderParameters[1];
      let name = senderParameters[2];
      
      let sender = this.localize("player.results.transactions.all." + role) + " " + position + (name ? " " + name : "");
      let receiver = this.localize("player.results.transactions.all." + role) + " " + position + (name ? " " + name : "");
      
      if(this.isOfferExternalUser(senderParameters[0])) {
        sender = this.localize("player.results.transactions.all.external");
      }
      
      if(this.isOfferExternalUser(receiverParameters[0])) {
        receiver = this.localize("player.results.transactions.all.external");
      }
      
      return {
        round: parseInt(roundParameters[1]),
        sender: sender,
        receiver: receiver,
        amount: parseInt(offerParameters[1]),
        unitPrice: parseFloat(offerParameters[3])
      };
    }, this);
  }),
  
  columns: Ember.computed("i18n.locale", function() {
    return [
      {
        "propertyName": "round",
        "title": this.localize("player.results.transactions.round"),
        "template": "custom/round-number-column"
      },
      {
        "propertyName": "sender",
        "title": this.localize("player.results.transactions.sender")
      },
      {
        "propertyName": "receiver",
        "title": this.localize("player.results.transactions.receiver")
      },
      {
        "propertyName": "amount",
        "title": this.localize("player.results.transactions.amount"),
        "template": "custom/tomato-amount-column"
      },
      {
        "propertyName": "unitPrice",
        "title": this.localize("player.results.transactions.unitPrice"),
        "template": "custom/euro-currency-column"
      }
    ];
  })
});
