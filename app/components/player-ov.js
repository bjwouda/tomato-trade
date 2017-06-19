import Ember from 'ember';

import OfferActions from '../mixins/offer-actions';

export default Ember.Component.extend(OfferActions, {
  i18n: Ember.inject.service(),
  
  actions: {
    saveUser(user) {
      user.save();
    },
    
    toggleExternalTrading(user) {
      user.toggleProperty("enableExternalTrading");
      user.save();
      
      let newHistoryObj = this.get("store").createRecord('history', {
        offerId: undefined,
        userSender: user.get("descriptivePlayerIdInGameForLogger"),
        userReceiver: "",
        state: "Change to external trade status",
        cssStatus: "",
        offer: user.get("enableExternalTrading") ? "Enabled" : "Disabled",
        round: "Round " + (user.get("userGame.roundCnt") + 1),
        historyGame: user.get("userGame")
      });
      
      newHistoryObj.save().then(() => {
        return true;
      });
    }
  }
});
