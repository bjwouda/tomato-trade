import Ember from 'ember';


export default Ember.Mixin.create({
  actions: {
    // OFFERS
    sendOfferAll(game, sender) {
      sender.get("traders").map((el) => {
        this.send("sendOffer", game, sender, el);
      });
    },

    sendOffer(game, sender, receiver, tomatoes, price) {
      var isExternal = false;
      if (+sender === 0 || +receiver === 0) { isExternal = true; }

      var newOffer = this.store.createRecord('offer', {
        tomatoes: tomatoes,
        price: price,
        isExternal: isExternal,
        ts: Date.now(),
        state: "open",
        notes: `${moment().format()};created\n`
      });

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
    },

    acceptOffer(offer) {
      offer.set("state", "accepted");
      offer.set("notes", offer.get("notes") + `${moment().format()};accepted\n`);

      var sign = offer.get("receiver.content.isSeller") ? 1 : -1;

      if (offer.get("receiver.content") !== null) {
        offer.set("receiver.content.money", +offer.get("receiver.content.money") + sign * offer.get("price"));
        offer.set("receiver.content.tomatoes", +offer.get("receiver.content.tomatoes") - sign * offer.get("tomatoes"));
        offer.set("receiver.content.hasDirtyAttributes", false);
        offer.get("receiver.content").save();
      }

      if (offer.get("sender.content") !== null) {
        // SIGNS ARE REVERSED !!!
        sign *= -1;
        offer.set("sender.content.money", +offer.get("sender.content.money") + sign * offer.get("price"));
        offer.set("sender.content.tomatoes", +offer.get("sender.content.tomatoes") - sign * offer.get("tomatoes"));
        offer.set("sender.content.hasDirtyAttributes", false);
        offer.get("sender.content").save();
      }

      offer.save();
    },

    declineOffer(offer) {
      offer.set("state", "declined");
      offer.set("notes", offer.get("notes") + `${moment().format()};declined\n`);
      offer.save();
    },

    recallOffer(offer) {
      offer.set("state", "recalled");
      offer.set("notes", offer.get("notes") + `${moment().format()};recalled\n`);
      offer.save();
    },

  }
});
