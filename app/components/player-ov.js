import Ember from 'ember';

import OfferActions from '../mixins/offer-actions';


export default Ember.Component.extend(OfferActions, {

  actions: {
    saveUser(user) { user.save(); },

    changePercentageOfGoal(game, user) {
      var prc;
      do {
        prc = prompt("How many % do you wanna alter the prognosis?");

        if (prc === null) { return; }
      }
      while (! /^\s*-?[0-9]{1,10}\s*$/.test(prc));

      let currentTomatoes = user.get("goalTomatoes");
      let newGoalTomatoes = Math.floor(currentTomatoes * (1.0 + 0.01 * +prc));
      user.set("goalTomatoes", newGoalTomatoes);
      user.save();

      
      var newHistoryObj = this.store.createRecord('history', {
        offerId      : undefined,
        userSender   : "Prognisis modification to " + user.get("descriptivePlayerIdInGame") ,
        userReceiver : "",
        state        : "",
        cssStatus    : "info",
        offer        : "by " + prc + "%",
        round        : "Round " + game.get("roundCnt"),
        type         : "Prognosis"
      });

      game.get('historyLogs').addObject(newHistoryObj);

      newHistoryObj.save().then(() => { 
        game.save();
        return true;
      });
        
      // need a log here
    },

  }

});
