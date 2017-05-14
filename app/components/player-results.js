import Ember from 'ember';

import _ from 'lodash/lodash';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  
  histories: [],
  
  loadHistories: Ember.on('init', Ember.observer("game.gameHasEnded", function() {
    if(this.get("game.gameHasEnded")) {
      // Load the data only when the game ends.
      let self = this;
      
      let historyQuery = this.get('store').query('history', {
        orderBy: "historyGame",
        equalTo: this.get("game.id")
      });
      
      historyQuery.then(function(histories) {
        self.set("histories", histories.filter(function(history) {
          return history.get('type') === "Statistic";
        }));
      });
    }
    else {
      // Reset the data when we go back in time.
      this.set("histories", []);
    }
  })),
  
  trader1RemainingTomatoes: Ember.computed("histories.[]", "histories.@each", function() {
    let histories = this.get('histories');
    
    let statistics = histories.filter(function(history) {
      return history.get('userSender') === "Stats for Trader 1";
    });
    
    let labels = statistics.map(function(statistic) {
      return statistic.get('round');
    });
    
    let data = statistics.map(function(statistic) {
      // Hacky way to get to the remaining tomatoes in existing histories.
      return statistic.get('offer').split(/, |:/)[3];
    });
    
    return createChartData("Remaining tomatoes", labels, data);
  }),
  
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
  
  transactionsTableColumns: Ember.computed("i18n.locale", function() {
    return [
      {
        "propertyName": "round",
        "title": localize(this, "i18n", "results.round")
      },
      {
        "propertyName": "sender",
        "title": localize(this, "i18n", "results.sender")
      },
      {
        "propertyName": "receiver",
        "title": localize(this, "i18n", "results.receiver")
      },
      {
        "propertyName": "amount",
        "title": localize(this, "i18n", "results.amount")
      },
      {
        "propertyName": "unitPrice",
        "title": localize(this, "i18n", "results.unitPrice"),
        "template": "custom/euro-currency-column"
      }
    ];
  }),
  
  bestTransactions: Ember.computed.sort("transactions", function(transaction1, transaction2) {
    return transaction1.get('round') - transaction2.get('round');
  }),
  
  bestTransactionsTableColumns: Ember.computed("i18n.locale", function() {
    return [
      {
        "propertyName": "round",
        "title": localize(this, "i18n", "results.round"),
        "disableSorting": true,
        "disableFiltering": true
      },
      {
        "propertyName": "sender",
        "title": localize(this, "i18n", "results.sender"),
        "disableSorting": true,
        "disableFiltering": true
      },
      {
        "propertyName": "receiver",
        "title": localize(this, "i18n", "results.receiver"),
        "disableSorting": true,
        "disableFiltering": true
      },
      {
        "propertyName": "amount",
        "title": localize(this, "i18n", "results.amount"),
        "disableSorting": true,
        "disableFiltering": true
      },
      {
        "propertyName": "unitPrice",
        "title": localize(this, "i18n", "results.unitPrice"),
        "disableSorting": true,
        "disableFiltering": true,
        "template": "custom/euro-currency-column"
      }
    ];
  }),
  
  transactionsTableClasses: {
    "table": "table table-responsive",
    // Makes the table footer look less uneven. See also ".table-summary" in "app.css".
    "footerSummaryNumericPagination": "col-md-7 col-sm-7col-xs-7",
    "paginationWrapperNumeric": "col-md-3 col-sm-3 col-xs-3"
  },
  
  transactionsTableMessages: {
    "tableSummary": "%@ - %@ / %@",
    "noDataToShow": ""
  }
});

function createChartData(label, labels, data) {
  return {
    labels: labels,
    datasets: [
      {
        label: label,
        fill: false,
        lineTension: 0,
        backgroundColor: "hsl(9,100%,64%)",
        borderColor: "hsl(9,100%,64%)",
        pointBorderColor: "hsl(9,100%,44%)",
        pointBackgroundColor: "hsl(9,100%,64%)",
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHitRadius: 16,
        data: data
      }
    ]
  };
}

function localize(self, i18n, key) {
  // i18n allows HTML, but ember-models-table doesn't. So don't use HTML.
  return "" + self.get(i18n).t(key);
}
