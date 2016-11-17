import Ember from 'ember';

export default Ember.Controller.extend({

    columns: [{
            "propertyName": "round",
            "title": "Round",
            "filterWithSelect": true
        }, {
            "propertyName": "idxOfOfferInGameCalc",
            "title": "Offerid"
        }, {
            "propertyName": "userSender",
            "title": "Usersender"
        }, {
            "propertyName": "userReceiver",
            "title": "Userreceiver"
        }, {
            "propertyName": "state",
            "title": "State"
        },

        {
            "propertyName": "tomatoesOffer",
            "title": "tomatoes"
        }, {
            "propertyName": "priceOffer",
            "title": "price"
        }, {
            "propertyName": "tsDesc",
            "title": "Time"
        },

    ],

      //Descending sort to historyLogs
  	historyLogsSortingDescById  : ['ts:desc'],
  	sortedHistoryLogsById: Ember.computed.sort('model', 'historyLogsSortingDescById'),

    actions: {

        exportCSV(historyLogs) {
            var data = [];
            var titles = ["round", "idxOfOfferInGameCalc", "userSender", "userReceiver", "state", "offer", "tomatoesOffer", "priceOffer", "tsDesc"];

            data.push(titles);
            historyLogs.map((historyElement) => {
                // historyElement => 1x historical element
                // now go through each element in titles and get it from historyElement
                var resolvedTitles = titles.map((titleElement) => {
                    return historyElement.get(titleElement);
                });
                data.push(resolvedTitles);
            });
            // this.get('csv').export(data, 'test.csv');
            this.get('excel').export(data, 'sheet1', 'test.xlsx');
        },
    }

});
