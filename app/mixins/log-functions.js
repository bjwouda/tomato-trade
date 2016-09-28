import Ember from 'ember';

export default Ember.Mixin.create({

	logPlayerOfferWithObj(store, game, offer, state) {
		let self = this;

		Ember.run(function() {
			let sender = offer.get("sender.content") !== null ? offer.get("sender") : 0;
			let receiver = offer.get("receiver.content") !== null ? offer.get("receiver") : 0;
			let tomatoes = offer.get("tomatoes");
			let price = offer.get("price");
			let offerId = offer.get("id");

			self.logPlayerOffer(store, game, sender, receiver, tomatoes, price, state, offerId);
		})
	},

	logPlayerOffer(store, game, sender, receiver, tomatoes, price, state, offerId) {
	  Ember.run(function() {
	
		  let stateCssLUT = {
				"open"                 : "active",
				"confirmed"            : "success",
				"recalled - confirmed" : "active",
				"accepted"             : "success",
				"declined"             : "danger",
				"recalled - open"      : "active"
		  };


	      var newHistoryObj = store.createRecord('history', {
	        offerId      : offerId,
	        userSender   : (+sender === 0) ? "External" : `${sender.get('descriptivePlayerIdInGame')}`,
	        userReceiver : (+receiver === 0) ? "External" : `${receiver.get('descriptivePlayerIdInGame')}`,
	        state        : state,
	        cssStatus    : stateCssLUT[state],
	        offer        : "tomatoes: " + tomatoes + ", price: " + price,
	        tomatoesOffer: tomatoes,
	        priceOffer 	 : price,
	        round        : "Round " + game.get("roundCnt"),
	        historyGame  : game
	      });

	      // game.get('historyLogs').addObject(newHistoryObj);
	      
	      newHistoryObj.save();
	  	
	  })

	}


});
