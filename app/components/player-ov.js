import Ember from 'ember';

import OfferActions from '../mixins/offer-actions';


export default Ember.Component.extend(OfferActions, {

  actions: {
    saveUser(user) { user.save(); },

    changePercentageOfGoal(user) {
      var prc;
      do {
        prc = prompt("How many % do you wanna alter the prognosis?");
      }
      while (! /^\s*-?[0-9]{1,10}\s*$/.test(prc));

      let currentTomatoes = user.get("goalTomatoes");
      let newGoalTomatoes = Math.floor(currentTomatoes * (1.0 + 0.01 * +prc));
      user.set("goalTomatoes", newGoalTomatoes);
      user.save();
      // need a log here
    },

  }

});
