import Ember from 'ember';
import OfferActions from '../mixins/offer-actions';
import LangActions from '../mixins/lang-actions';
import LogFunctions from '../mixins/log-functions';

import _ from 'lodash/lodash';

export default Ember.Controller.extend(OfferActions, LangActions, LogFunctions, {

    activeUser: null,
    gameConfiguration: null,
    game: Ember.computed.alias("model"),

    isEditing: true,

    historyCompletelyLoaded: Ember.observer("model.historyLogs.[]", "model.historyLogs.@each.isLoaded", function() {
        this.set("showFilterTable", false);
    }),


    // isConfiguration   : Ember.computed("model.[]", function() {
    //   return this.get("model.length") !== 0;
    // }),

    actions: {

        allowGlobalExternalTrading() {
            this.get("game.users").forEach( (u) => {


                u.toggleProperty("enableExternalTrading")
                u.save()
            })
        },

        // USER
        saveUser(user) { user.save(); },
        deleteUser(user) {
            user.destroyRecord();
        },
        rollbackUser(user) { user.rollbackAttributes(); },

        setActiveUser(user) {
            this.set("activeUser", user);
        },

        addUser(game, userType) {
            var isSeller = false;
            if (userType === 'seller') { isSeller = true; }
            var newUser = this.store.createRecord('user', { isSeller });

            game.get('users').pushObject(newUser);

            newUser.save().then(() => {
                return game.save();
            });
        },


        // GAME

        pauseGame(game) {
            game.set("timePausedTs", Date.now());
            game.save();
        },

        resumeGame(game) {
            try {
                let pausedStartDelta = game.get("timePausedTs") - game.get("timeStartTs");
                let previousDelta = game.get("timeEndTs") - game.get("timeStartTs");
                game.set("timeStartTs", Date.now() - pausedStartDelta);
                game.set("timeEndTs", game.get("timeStartTs") + previousDelta);
            } catch (err) {
                console.log("error when resuming...");
            }
            game.set("timePausedTs", undefined);
            game.save();

        },

        letGameEndInXMinutes(game, xMinutes, shouldResetStart) {
            game.set("timeEndTs", Date.now() + xMinutes * 60 * 1000);

            if (shouldResetStart) { game.set("timeStartTs", Date.now()); }

            game.save();
        },

        nextRound(game, minutesPerRound) {

            minutesPerRound = game.getMinutesPerRoundForRound(1 + game.get("roundCnt"));

            if (!minutesPerRound) {
                minutesPerRound = 5;
            }

            //Create history record to record moving to the next round
            if (game.get("roundCnt") !== 0) {
                var newHistoryObj = this.store.createRecord('history', {
                    offerId: undefined,
                    userSender: "Round " + (game.get("roundCnt") + 1),
                    userReceiver: "Round " + (game.get("roundCnt") + 2),
                    state: "New Round",
                    cssStatus: "info",
                    offer: "Minutes on this round " + minutesPerRound, //We could also include tomato goal for each user
                    round: "Round " + (game.get("roundCnt") + 1),
                    historyGame: game
                });

                game.get("users").map((u) => {
                    let userHistory = this.store.createRecord('history', {
                        offerId: undefined,
                        userSender: `Stats for ${u.get("descriptivePlayerIdInGame")}`,
                        userReceiver: "",
                        state: "",
                        cssStatus: "info",
                        offer: u.get("logPlayerStatus"),
                        round: "Round " + game.get("roundCnt"),
                        historyGame: game
                    });

                    userHistory.save().then(() => {
                        return true;
                    });

                    u.set("enableExternalTrading", false);

                });

            } else {
                var newHistoryObj = this.store.createRecord('history', {
                    offerId: undefined,
                    userSender: "Game starting",
                    userReceiver: "Setting up:",
                    state: "First Round",
                    cssStatus: "info",
                    offer: "Minutes on this round " + minutesPerRound, //We could also include tomato goal for each user
                    round: "Round " + game.get("roundCnt"),
                    historyGame: game
                });
            }




            newHistoryObj.save().then(() => {
                return true;
            });

            game.set("timeStartTs", Date.now());
            game.set("timeEndTs", Date.now() + minutesPerRound * 60 * 1000);
            game.incrementProperty("roundCnt", 1);

            game.get("offers").map(x => x.destroyRecord())

            game.save().then(() => {
                let lut = [
                    ["getRetailpriceForRound", "retailPrice"],
                    ["getMinutesPerRoundForRound", "minutesPerRound"],
                    ["getSellerFineForRound", "fine"],
                    ["getSellerFixedCostForRound", "fixedCost"],
                ];

                for (let [fnName, attrName] of lut) {
                    console.log(fnName);
                    console.log(attrName);
                    let newVal = game[fnName](game.get("roundCnt"));
                    game.set(attrName, newVal);
                }
                game.save()

            });

            game.get("allUsers").forEach((u) => {
                u.set("goalTomatoes", game.getValueforUserCurrentRound(u.get("playerIdInGame")));
                u.set("extOfferTomato", game.getValueforUserCurrentRound(u.get("playerIdInGame"), '_extTomato'));
                u.set("extOfferPrice", game.getValueforUserCurrentRound(u.get("playerIdInGame"), '_extPrice'));
                u.save();
            });

        },

        saveSettings(game) {
            game.save();
            game.get("allUsers").forEach((u) => { u.save(); });
            this.toggleProperty("isEditing");
        },

        revertGameConfig() {
            this.set("game.gameConfigurationRO", this.get("game.gameConfiguration"));
        },

        updateGameConfig() {
            this.set("game.gameConfigurationSafe", this.get("game.gameConfigurationRO"));
            this.get("game").save();
        },

        saveGameConfig() {
            let self = this;

            if (!self.get("game.isNew")) {
                var r = confirm("Are you sure to override the new config? Everything will start from scratch.");
                if (!r) {
                    return;
                }
            }

            self.set("game.isNew", false);

            var promiseArr = self.get("game.users")
                .filter((x) => {
                    return x && !x.get("isDeleted");
                })
                .map((x) => {
                    return x.destroyRecord();
                });

            self.get("game.users").clear();

            Promise.all(promiseArr).then(function() {
                self.set("game.gameConfigurationSafe", self.get("game.gameConfigurationRO"));
                self.set("game.roundCnt", 0);
                self.get("game").save().then(function() {
                    _.range(self.get("game.numberOfPlayers.nrOfBuyers")).forEach(function() {
                        self.send("addUser", self.get("game"), "buyer");
                    });

                    _.range(self.get("game.numberOfPlayers.nrOfSellers")).forEach(function() {
                        self.send("addUser", self.get("game"), "seller");
                    });

                    self.set("isConfiguration", false);
                    // self.send("nextRound", self.get("game"), 5);
                    self.send("clearHistoryLogs");
                });
            });
        },

        testManyOffers() {
            Ember.run(() => {
                let self = this;
                let game = this.get("game");
                let users = this.get("game.users").then(function(_users) {
                    // sendOffer(game, sender, receiver, tomatoes, price)
                    let users = _users.map(x => x);

                    for (let x of _.range(50)) {
                        self.send("sendOffer", game, users[0], users[1], 1.0, 1.0);
                        console.log(x);
                    }
                });

            })


        },

        clearHistoryLogs() {
            // this.get("game.historyLogs").clear();
            this.get("game").save();

            let historyQuery = this.get('store').query('history', {
                orderBy: "historyGame",
                equalTo: this.get("game.id")
            })

            historyQuery.then(function(record) {
                record.content.forEach(function(rec) {
                    Ember.run.once(this, function() {
                        rec.deleteRecord();
                        rec.save();
                    });
                }, this);
            });
        },

    }
});
