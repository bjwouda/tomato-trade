import Ember from 'ember';

import OfferUtilities from "../mixins/offer-utilities";

import moment from 'moment';

export default Ember.Component.extend(OfferUtilities, {
  store: Ember.inject.service(),
  
  // These are used in the child components. We retrieve all the results from the histories for backwards compatibility.
  histories: [],
  
  // These are used to determine the child components.
  buyers: [],
  sellers: [],
  
  loadHistories: Ember.on('init', Ember.observer("game.gameHasEnded", "game.isImported", function() {
    if(this.get("game.gameHasEnded") || this.get("game.isImported")) {
      // Load the data only when the game ends (or is imported).
      let self = this;
      
      let historyQuery = this.get('store').query('history', {
        orderBy: "historyGame",
        equalTo: this.get("game.id")
      });
      
      historyQuery.then(function(histories) {
        // Duplicate the array before sorting it since sorting is in place and the provided array is not mutable.
        self.set("histories", histories.slice().sort(function(history1, history2) {
          return moment(history1.get("ts")).diff(moment(history2.get("ts")));
        }));
      });
    }
    else {
      // Reset the data when we go back in time.
      this.set("histories", []);
    }
  })),
  
  loadPlayers: Ember.observer("histories.[]", "histories.@each", function() {
    let histories = this.get("histories");
    
    let offers = histories.filter(function(history) {
      return this.isOfferState(history.get("state"));
    }, this);
    
    let players = [];
    
    let filterOffers = function(offers, type) {
      offers.forEach(function(offer) {
        let parameters = offer.get(type).split(/[ -]+/);
        
        let role = parameters[0];
        let position = parameters[1];
        let name = parameters[2];
        
        // Skip external offers.
        if(!this.isOfferExternalUser(role)) {
          players.pushObject(Ember.Object.create({
            // Mimic the original player model so we can reuse templates.
            roleDescription: role,
            playerPosition: parseInt(position),
            name: name,
            isSeller: this.isOfferSellerUser(role)
          }));
        }
      }, this);
    };
    
    filterOffers.call(this, offers, "userSender");
    filterOffers.call(this, offers, "userReceiver");
    
    let buyers = [];
    let sellers = [];
    
    let filterPlayers = function(role, subjects) {
      players.forEach(function(player) {
        if(player.get("roleDescription") === role) {
          let hasSubject = subjects.any(function(subject) {
            return subject.get("playerPosition") === player.get("playerPosition");
          });
          
          if(!hasSubject) {
            subjects.pushObject(player);
          }
        }
      });
    };
    
    filterPlayers("buyer", buyers);
    filterPlayers("seller", sellers);
    
    // sortBy doesn't appear to work.
    let sortPlayers = function(player1, player2) {
      return player1.get("playerPosition") - player2.get("playerPosition");
    };
    
    buyers.sort(sortPlayers);
    sellers.sort(sortPlayers);
    
    this.set("buyers", buyers);
    this.set("sellers", sellers);
  })
});
