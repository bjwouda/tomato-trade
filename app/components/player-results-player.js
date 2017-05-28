import Ember from 'ember';

import OfferUtilities from "../mixins/offer-utilities";

export default Ember.Component.extend(OfferUtilities, {
  configuration: Ember.computed("histories.[]", "histories.@each", function() {
    let history = this.get("histories").find(function(history) {
      return history.get("state") === "New Config loaded";
    });
    
    let gameConfigurationSafe = history.get("offer");
    
    let gameConfigParser = Ember.Object.extend(GameConfigParser).create({
      gameConfigurationSafe: gameConfigurationSafe
    });
    
    return gameConfigParser.get("gameMatrix");
  }),
  
  offers: Ember.computed("histories.[]", "histories.@each", function() {
    return this.get("histories").filter(function(history) {
      let sender = history.get("userSender");
      let receiver = history.get("userReceiver");
      let state = history.get("state");
      
      // TODO this doesn't make sense, fix it
      return this.isOfferAcceptedState(state) && this.isOfferUser(sender) || this.isOfferUser(receiver);
    });
  }),
  
  averageUnitPrice: Ember.computed("histories.[]", "histories.@each", function() {
    // TODO need weeks, calculate offer total per week, calculate average, average weeks, work in prognosis percentage
    // TODO medal
  }),
  
  cooperative1Revenue: Ember.computed("histories.[]", "histories.@each", function() {
    let histories = this.get("histories");
    
    let offers = histories.filter(function(history) {
      let sender = history.get("userSender");
      let receiver = history.get("userReceiver");
      let state = history.get("state");
      let round = parseInt(history.get("round").split(/ /)[1]);
      
      // TODO
      let hasUsers = (sender.startsWith("seller 1") && (receiver.startsWith("buyer 1") || receiver.startsWith("buyer 2") || receiver.startsWith("External"))) || (receiver.startsWith("seller 1") && (sender.startsWith("buyer 1") || sender.startsWith("buyer 2") || sender.startsWith("External")));
      let hasState = this.isOfferAcceptedState(state);
      let hasRound = round === index;
      
      return hasUsers && hasState && hasRound;
    }, this);
    
    let revenue = offers.map(function(offer) {
      let offerParameters = offer.get("offer").split(/, |:/);
      
      return offerParameters[1] * offerParameters[3];
    }).reduce(function(revenue1, revenue2) {
      return revenue1 + revenue2;
    }, 0);
    
    return revenue;
  })
});
