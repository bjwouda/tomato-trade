import Ember from 'ember';

import TableUtilities from "../mixins/table-utilities";

import _ from 'lodash/lodash';

export default Ember.Component.extend(TableUtilities, {
  transactions: Ember.computed("histories.[]", "histories.@each", function() {
    return _.range(1, 100).map(function(round) {
      return Ember.Object.create({
        round: round,
        sender: "You",
        receiver: "Not you",
        amount: 1000,
        unitPrice: 1
      });
	  });
  }),
  
  columns: Ember.computed("i18n.locale", function() {
    return [
      {
        "propertyName": "round",
        "title": this.localize("results.transactions.round")
      },
      {
        "propertyName": "sender",
        "title": this.localize("results.transactions.sender")
      },
      {
        "propertyName": "receiver",
        "title": this.localize("results.transactions.receiver")
      },
      {
        "propertyName": "amount",
        "title": this.localize("results.transactions.amount")
      },
      {
        "propertyName": "unitPrice",
        "title": this.localize("results.transactions.unitPrice"),
        "template": "custom/euro-currency-column"
      }
    ];
  })
});
