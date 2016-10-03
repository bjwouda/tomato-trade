import Ember from 'ember';

import LogFunctions from '../mixins/log-functions';

export default Ember.Mixin.create(LogFunctions, {
  actions: {
    // OFFERS
    sendOfferAll(game, sender) {
      sender.get("traders").map((el) => {
        this.send("sendOffer", game, sender, el);
      });
    },

    sendOffer(game, sender, receiver, tomatoes, price) {
      Ember.run(() => {
        var isExternal = false;
        if (+sender === 0 || +receiver === 0) { isExternal = true; }

        var newOffer = this.store.createRecord('offer', {
          tomatoes: tomatoes,
          price: price,
          idxOfOfferInGame: game.get("offerCnt"),
          isExternal: isExternal,
          roundNumber: game.get("roundNumber"),
          weekNumber: game.get("weekNumber"),
          ts: Date.now(),
          state: "open",
          notes: `${moment().format()};created\n`,
        });

        this.logPlayerOffer(this.store, game, sender, receiver, tomatoes, price, "open", newOffer.get("id"), game.get("offerCnt"));

        game.incrementProperty('offerCnt');
        game.get('offers').addObject(newOffer);

        if (+receiver !== 0) {
          receiver.get('receivedOffers').addObject(newOffer);
          receiver.set("hasDirtyAttributes", false);
        }

        if (+sender !== 0) {
          sender.get('sentOffers').addObject(newOffer);
          sender.set("hasDirtyAttributes", false);
        }

        newOffer.save().then(() => {
          if (+sender !== 0) { sender.save(); }
          if (+receiver !== 0) { receiver.save(); }
          game.save();
          return true;
        });
      })
    },

    confirmOffer(game, offer) {
      offer.set("isConfirmed", true);
      offer.set("notes", offer.get("notes") + `${moment().format()};confirmed\n`);
      offer.save();

      this.logPlayerOfferWithObj(this.store, game, offer, "confirmed");

      if (offer.get("isExternal")) {
        this.send("acceptOffer", game, offer);
      }
    },

    recallConfirmationOffer(game, offer) {
      offer.set("isConfirmed", false);
      offer.set("notes", offer.get("notes") + `${moment().format()};confirmed\n`);
      offer.save();

      this.logPlayerOfferWithObj(this.store, game, offer, "recalled - confirmed");
    },

    acceptOffer(game, offer) {
      let self = this;

      Ember.run(function() {

        // Do some extra check that no negative values occur somehow...

        let receiverTomatoes = +offer.get("receiver.content.tomatoes") + offer.get("tomatoes") < offer.get("receiver.content.goalTomatoes")
                          && offer.get("receiver.content.isSeller");

        let senderTomatoes = +offer.get("sender.content.tomatoes") + offer.get("tomatoes") < offer.get("sender.content.goalTomatoes")
                          && offer.get("sender.content.isSeller");

        if (receiverTomatoes || senderTomatoes) { 
          debugger;
          self.send("declineOffer", game, offer);
          return
        }

        offer.set("isAccepted", true);
        offer.set("state", "accepted");
        offer.set("notes", offer.get("notes") + `${moment().format()};accepted\n`);

        if (offer.get("receiver.content") !== null) {
          var sign = offer.get("receiver.content.isSeller") ? 1 : -1;
          offer.set("receiver.content.money", +offer.get("receiver.content.money") + sign * offer.get("price") * offer.get("tomatoes"));
          offer.set("receiver.content.tomatoes", +offer.get("receiver.content.tomatoes") - sign * offer.get("tomatoes"));
          offer.set("receiver.content.hasDirtyAttributes", false);
          offer.get("receiver.content").save();
        }

        if (offer.get("sender.content") !== null) {
          var sign = offer.get("sender.content.isSeller") ? 1 : -1;
          offer.set("sender.content.money", +offer.get("sender.content.money") + sign * offer.get("price") * offer.get("tomatoes"));
          offer.set("sender.content.tomatoes", +offer.get("sender.content.tomatoes") - sign * offer.get("tomatoes"));
          offer.set("sender.content.hasDirtyAttributes", false);
          offer.get("sender.content").save();
        }

        offer.save();

        self.logPlayerOfferWithObj(self.store, game, offer, "accepted");
        
      })
    },

    declineOffer(game, offer) {
      offer.set("state", "declined");
      offer.set("notes", offer.get("notes") + `${moment().format()};declined\n`);
      offer.save();

      this.logPlayerOfferWithObj(this.store, game, offer, "declined");

    },

    recallOffer(game, offer) {
      offer.set("state", "recalled");
      offer.set("notes", offer.get("notes") + `${moment().format()};recalled\n`);
      offer.save();

      this.logPlayerOfferWithObj(this.store, game, offer, "recalled - open");
    },

  }

});
