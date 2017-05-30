import Ember from 'ember';

import TableUtilities from "../mixins/table-utilities";

import _ from 'lodash/lodash';

export default Ember.Controller.extend(TableUtilities, {
  needsReload: Ember.computed("model.[]", function() {    
    let history = this.get("model");
    let offerIds = history.map(x => x.get("offerId"));
    //console.log(sessionStorage["allObjIds"]);
    //console.log(JSON.stringify(_.uniq(offerIds).sort()));
    return sessionStorage["allObjIds"] !== JSON.stringify(_.uniq(offerIds).sort());
  }),
  
  // Descending sort of historyLogs.
  historyLogsSortingDescById: ['ts:desc'],
  sortedHistoryLogsById: Ember.computed.sort('model', 'historyLogsSortingDescById'),
  
  columns: Ember.computed("i18n.locale", function() {
    return [
      {
        "propertyName": "round",
        "title": this.localize("history.round")
      },
      {
        "propertyName": "idxOfOfferInGameCalc",
        "title": this.localize("history.calculatedOfferID"),
      },
      {
        "propertyName": "idxOfOfferInGame",
        "title": this.localize("history.offerID"),
      },
      {
        "propertyName": "userSender",
        "title": this.localize("history.sender")
      },
      {
        "propertyName": "userReceiver",
        "title": this.localize("history.receiver")
      },
      {
        "propertyName": "state",
        "title": this.localize("history.status")
      },
      {
        "propertyName": "offer",
        "title": this.localize("history.offer")
      },
      {
        "propertyName": "tomatoesOffer",
        "title": this.localize("history.tomatoes")
      },
      {
        "propertyName": "priceOffer",
        "title": this.localize("history.unitPrice"),
        "template": "custom/euro-currency-column"
      },
      {
        "propertyName": "ts",
        "title": this.localize("history.time"),
        "template": "custom/moment-time-column"
      }
    ];
  }),
  
  actions: {
    importHistory(rows) {
      if(confirm(this.get("i18n").t("history.confirm"))) {
        let store = this.get("store");
        let model = this.get("model");
        let game = this.get("game");
        
        model.forEach(function(history) {
          history.destroyRecord();
        });
        
        model = [];
        
        // offerID and cssStatus are not available, but are fortunately not needed for imported games.
        rows.forEach(function(row) {
          // offerTomatoes and offerPrice are not required to be backwards compatible with older exports.
          if(
            typeof row.userSender !== "undefined" &&
            typeof row.userReceiver !== "undefined" &&
            typeof row.state !== "undefined" &&
            typeof row.offer !== "undefined" &&
            typeof row.round !== "undefined" &&
            typeof row.idxOfOfferInGameCalc !== "undefined" &&
            typeof row.tsDesc !== "undefined"
          ) {
            // idxOfOfferInGame was originally something else, but using the imported idxOfOfferInGameCalc
            // should result in the same behaviour (this was the computed idxOfOfferInGameCalc originally).
            let history = store.createRecord("history", {
              userSender: row.userSender,
              userReceiver: row.userReceiver,
              state: row.state,
              offer: row.offer,
              round: row.round,
              offerTomotoes: row.offerTomatoes,
              offerPrice: row.offerPrice,
              idxOfOfferInGame: row.idxOfOfferInGameCalc,
              ts: +moment(row.tsDesc, "HH:mm:ss"),
              historyGame: game
            });
            
            history.save();
            
            model.pushObject(history);
          }
        });
        
        this.set("model", model);
        
        // Replace the session storage originally set up in the route as well.
        let offerIds = model.map(history => history.get("offerId"));
        sessionStorage["allObjIds"] = JSON.stringify(_.uniq(offerIds).sort());
        
        game.set("isImported", true);
        game.save();
      }
    },
    
    exportHistory() {
      var data = [];
      var titles = ["round", "idxOfOfferInGameCalc", "userSender", "userReceiver", "state", "offer", "tomatoesOffer", "priceOffer", "tsDesc"];
      
      data.push(titles);
      
      this.get('sortedHistoryLogsById').map((historyElement) => {
        // historyElement => 1x historical element
        // now go through each element in titles and get it from historyElement
        var resolvedTitles = titles.map((titleElement) => {
          return historyElement.get(titleElement);
        });
        data.push(resolvedTitles);
      });
      
      this.get('excel').export(data, 'sheet1', 'History.xlsx');
    },
  }
});
