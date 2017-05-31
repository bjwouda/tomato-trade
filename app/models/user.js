import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

import storeWithWeek from '../utils/store-with-week';
import _ from 'lodash/lodash';

function calcSellerKPI(remainingTomatoes, money, avgTomatoPrice, fine, goalTomatoes) {
    if(remainingTomatoes < 0) {
        money = money + remainingTomatoes * (avgTomatoPrice + fine);
    }

    return money / goalTomatoes;
}

function calcBuyerKPI(money, tomatoes, goalTomatoes, retailPrice, remainingTomatoes, fine, fixedCost) {
    let costBuying = Math.abs(money);
    let totalRevenue = Math.min(tomatoes, goalTomatoes) * retailPrice;
    let totalFine = Math.max(0, remainingTomatoes * fine);
    let totalFixedCosts = goalTomatoes * fixedCost;

    return (totalRevenue - costBuying - totalFixedCosts - totalFine) / goalTomatoes;
    // body...
}

export default Model.extend({
    i18n: Ember.inject.service(),

    // normal attribtues
    name: attr('string'),

    goalTomatoes: storeWithWeek("userGame.weekCnt", "goalTomatoes"),
    tomatoes: storeWithWeek("userGame.weekCnt", "tomatoes"),
    money: storeWithWeek("userGame.weekCnt", "money"),
    extOfferTomato: storeWithWeek("userGame.weekCnt", "extOfferTomato"),
    extOfferPrice: storeWithWeek("userGame.weekCnt", "extOfferPrice"),

    enableExternalTrading: attr('boolean', { default: false }),
    isSeller: attr('boolean'),
    playerWeekStatus: attr('json'),

    // relational attributes
    userGame: belongsTo('game'),
    receivedOffers: hasMany('offer', { async: true, inverse: 'receiver' }),
    sentOffers: hasMany('offer', { async: true, inverse: 'sender' }),

    logPlayerStatus: Ember.computed("sellerKPI", "buyerKPI", function() {
        let isSellerLUT = {
            true: ["goalTomatoes", "remainingTomatoes", "tomatoes", "sellerKPI"],
            false: ["goalTomatoes", "remainingTomatoes", "tomatoes", "buyerKPI"],
        };
        let propsToLog = isSellerLUT[this.get("isSeller")];
        let vals = propsToLog.map(x => `${x}:${this.get(x)}`);
        return vals.join(", ");
    }),
    
    absoluteTomatoes: Ember.computed("tomatoes", function() {
      return Math.abs(this.get("tomatoes"));
    }),

    remainingTomatoes: Ember.computed("tomatoes", "goalTomatoes", function() {
        return this.get("goalTomatoes") - Math.abs(this.get("tomatoes"));
    }),

    avgTomatoPrice: Ember.computed("tomatoes", "money", function() {
        if(this.get("money") === 0) { return 0; }
        return Math.abs(this.get("money") / this.get("tomatoes"));
    }),

    weeklyKPIOverview: Ember.computed("sellerKPI", "buyerKPI", function () {
        let x = this.get("playerWeekStatus");
        delete x["firebaseDummyPlaceholder"]; // needs to be kicked out, otherwise causes trouble ;-)

        let xArr = _.map(x, (v,k) => {return _.extend({idx: k}, v); });

        let fn = () => {};
        if(this.get("isSeller")) {
            fn = (goalTomatoes, money, tomatoes) => {
                let remainingTomatoes = +this.get("remainingTomatoes");
                let fine              = +this.get("userGame.fine");
                let avgTomatoPrice    = +this.get('avgTomatoPrice');
                return calcSellerKPI(remainingTomatoes, money, avgTomatoPrice, fine, goalTomatoes);
            };
        } else {
            fn = (goalTomatoes, money, tomatoes) => {
                let retailPrice       = +this.get("userGame.retailPrice");
                let fixedCost         = +this.get("userGame.fixedCost");
                let remainingTomatoes = +this.get("remainingTomatoes");
                let fine              = +this.get("userGame.fine");
                return calcBuyerKPI(money, tomatoes, goalTomatoes, retailPrice, remainingTomatoes, fine, fixedCost);
            };
        }

        xArr.forEach( (x) => {
            x.kpi = fn(+(x.goalTomatoes || 0), +(x.money || 0), +(x.tomatoes || 0));
        } );

        return xArr;
        // goalTomatoes, money, tomatoes
    }),

    sellerKPI: Ember.computed("tomatoes", "money", function() {
        let remainingTomatoes = +this.get("remainingTomatoes");
        let money             = +this.get("money");
        let fine              = +this.get("userGame.fine");
        let avgTomatoPrice    = +this.get('avgTomatoPrice');
        let goalTomatoes      = +this.get('goalTomatoes');

        return calcSellerKPI(remainingTomatoes, money, avgTomatoPrice, fine, goalTomatoes);
    }),

    buyerKPI: Ember.computed("userGame.fine", "userGame.fixedCost", "userGame.retailPrice", "money", "goalTomatoes", function() {
        let retailPrice = this.get("userGame.retailPrice");
        let fixedCost = this.get("userGame.fixedCost");
        let tomatoes = this.get("tomatoes");
        let goalTomatoes = this.get("goalTomatoes");
        let remainingTomatoes = this.get("remainingTomatoes");
        let fine = this.get("userGame.fine");
        let money = this.get('money');

        return calcBuyerKPI(money, tomatoes, goalTomatoes, retailPrice, remainingTomatoes, fine, fixedCost);
    }),

    //Result s1, s2, b1, b2...
    playerIdInGame: Ember.computed("playerPosition", function() {
        let prefix = this.get("isSeller") ? "s" : "b";
        let pos = this.get("playerPosition");
        return `${prefix}${pos}`;
    }),

    //Result Seller 1 - Bob
    descriptivePlayerIdInGame: Ember.computed("playerPosition", "name", function() {
        var prefix = this.get("isSeller") ? "player.seller" : "player.buyer";
        prefix = this.get('i18n').t(prefix);
        let pos = this.get("playerPosition");
        let postfix = this.get("name") ? ` - ${this.get("name")}` : '';
        return `${prefix} ${pos}${postfix}`;
    }),

    descriptivePlayerIdInGameForLogger: Ember.computed("playerPosition", "name", function() {
        var prefix = this.get("isSeller") ? "seller" : "buyer";
        let pos = this.get("playerPosition");
        let postfix = this.get("name") ? ` - ${this.get("name")}` : '';
        return `${prefix} ${pos}${postfix}`;
    }),


    playerPosition: Ember.computed("userGame.buyers", "userGame.sellers", "isSeller", "id", function() {
        if(this.get("isSeller")) { // for the sellers
            return this.get("userGame.sellers").map((x) => {
                return x.get("id"); }).indexOf(this.get("id")) + 1;
        } else { // for the buyers
            if(this.get("userGame.buyers")) {
                return this.get("userGame.buyers").map((x) => {
                    return x.get("id"); }).indexOf(this.get("id")) + 1;
            }
        }
    }),

    // groupedReceivedOpenOffers: Ember.computed("traders.@each.id", "receivedOffers.@each.state", "sentOpenOffers.@each.state", "historicOffers.@each.state", function () {
    groupedReceivedOpenOffers: Ember.computed("traders.@each.id", "receivedOpenOffers", "sentOpenOffers", "historicOffers", function() {
        var userIds = this.get("traders").map((x) => {
            return { "id": x.get("id"), "ref": x };
        }); // [1, 2, 3]
        var tmpReturnObj = _.indexBy(userIds, "id"); // {1: 1, 2: 2, 3: 3}
        tmpReturnObj["External"] = { "id": "External", "ref": { 'name': "External" } };

        var receivedOpenOffersLUT = _.groupBy(this.get("receivedOpenOffers"), (x) => {
            return x.get("senderId"); });
        var sentOpenOffersLUT = _.groupBy(this.get("sentOpenOffers"), (x) => {
            return x.get("receiverId"); });
        var historicOffersSentLUT = _.groupBy(this.get("historicOffers"), (x) => {
            return x.get("senderId"); });
        var historicOffersReceivedLUT = _.groupBy(this.get("historicOffers"), (x) => {
            return x.get("receiverId"); });

        var newReturnObj = _.mapValues(tmpReturnObj, function(v, k) {
            var a = historicOffersReceivedLUT[k] ? historicOffersReceivedLUT[k] : [];
            var b = historicOffersSentLUT[k] ? historicOffersSentLUT[k] : [];
            var allHistorcOffers = a.concat(b);
            allHistorcOffers = _.sortBy(allHistorcOffers, function(o) {
                return o.get("ts"); });

            return {
                user: v.ref,
                openOffers: receivedOpenOffersLUT[k] ? receivedOpenOffersLUT[k] : [],
                sentOffers: sentOpenOffersLUT[k] ? sentOpenOffersLUT[k] : [],
                history: allHistorcOffers,
            };
        });

        // console.log(newReturnObj);

        return newReturnObj;
    }),

    // computed attributes

    externalOffers: Ember.computed("groupedReceivedOpenOffers", function() {
        return this.get("groupedReceivedOpenOffers.External");
    }),

    receivedOpenOffers: Ember.computed.filter('receivedOffers.@each.state',
        (el) => {
            return el.get("state") === "open"; }),
    sentOpenOffers: Ember.computed.filter('sentOffers.@each.state',
        (el) => {
            return el.get("state") === "open"; }),

    historicOffers: Ember.computed('receivedOffers.@each.state', 'sentOffers.@each.state',
        function() {
            var receivedOffers = this.get('receivedOffers').filter((el) => {
                return el.get("state") !== "open"; });
            var sentOffers = this.get('sentOffers').filter((el) => {
                return el.get("state") !== "open"; });

            let combination = [].concat(receivedOffers, sentOffers);
            return _.sortBy(combination, function(o) {
                return o.get('ts'); }).reverse();
        }),

    roleDescription: Ember.computed('isSeller', function() {
        return this.get('isSeller') ? 'seller' : 'buyer';
    }),

    traders: Ember.computed('isSeller', 'userGame.sellers.[]', 'userGame.buyers.[]', function() {
        if(this.get('isSeller')) {
            return this.get('userGame.buyers');
        } else {
            return this.get('userGame.sellers');
        }
    }),
});
