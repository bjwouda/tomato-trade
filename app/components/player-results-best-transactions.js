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
  
  bestTransactions: Ember.computed.sort("transactions", function(transaction1, transaction2) {
    return transaction1.get('round') - transaction2.get('round');
  }),
  
  columns: Ember.computed("i18n.locale", function() {
    return [
      {
        "propertyName": "round",
        "title": this.localize("results.transactions.round"),
        "disableSorting": true,
        "disableFiltering": true
      },
      {
        "propertyName": "sender",
        "title": this.localize("results.transactions.sender"),
        "disableSorting": true,
        "disableFiltering": true
      },
      {
        "propertyName": "receiver",
        "title": this.localize("results.transactions.receiver"),
        "disableSorting": true,
        "disableFiltering": true
      },
      {
        "propertyName": "amount",
        "title": this.localize("results.transactions.amount"),
        "disableSorting": true,
        "disableFiltering": true
      },
      {
        "propertyName": "unitPrice",
        "title": this.localize("results.transactions.unitPrice"),
        "disableSorting": true,
        "disableFiltering": true,
        "template": "custom/euro-currency-column"
      }
    ];
  })
});
