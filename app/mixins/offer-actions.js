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

      {{debugger}}

      //Create history record
      var newHistoryObj = this.store.createRecord('history', {
        offerId      : newOffer.id,
        userSender   : (+sender === 0) ? "External" : ((sender.get('name')) ? sender.get('name') : sender.get('descriptivePlayerIdInGame')),
        userReceiver : (+receiver === 0) ? "External" : ((receiver.get('name')) ? receiver.get('name') : receiver.get('descriptivePlayerIdInGame')),
        state        : "Open",
        cssStatus    : "active",
        offer        : "tomatoes: " + tomatoes + ", price: " + price
      });

      game.get('offers').addObject(newOffer);
      game.get('historyLogs').addObject(newHistoryObj);

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

      newHistoryObj.save().then(() => { 
        game.save();
        return true;
      });
    },

    confirmOffer(game, offer) {
      offer.set("isConfirmed", true);
      offer.set("notes", offer.get("notes") + `${moment().format()};confirmed\n`);
      offer.save();
    },

    recallConfirmationOffer(game, offer) {
      offer.set("isConfirmed", false);
      offer.set("notes", offer.get("notes") + `${moment().format()};confirmed\n`);
      offer.save();
    },

    acceptOffer(game, offer) {
      offer.set("isAccepted", true);
      offer.set("state", "accepted");
      offer.set("notes", offer.get("notes") + `${moment().format()};accepted\n`);

      var sign = offer.get("receiver.content.isSeller") ? 1 : -1;

      //Create history record
      var newHistoryObj = this.store.createRecord('history', {
        offerId      : offer.id,
        userSender   : (offer.get('sender.id') === undefined) ? "External"  : ((offer.get('sender.name')) ? offer.get('sender.name') : offer.get('sender.descriptivePlayerIdInGame')),//offer.get('sender.name'),
        userReceiver : (offer.get('receiver.id') === undefined) ? "External"  : ((offer.get('receiver.name')) ? offer.get('receiver.name') : offer.get('receiver.descriptivePlayerIdInGame')),//offer.get('receiver.name'),
        state        : "Accepted",
        cssStatus    : "success",
        offer        : "tomatoes: " + offer.get('tomatoes') + ", price: " + offer.get('price')
      });

      if (offer.get("receiver.content") !== null) {
        offer.set("receiver.content.money", +offer.get("receiver.content.money") + sign * offer.get("price") * offer.get("tomatoes"));
        offer.set("receiver.content.tomatoes", +offer.get("receiver.content.tomatoes") - sign * offer.get("tomatoes"));
        offer.set("receiver.content.hasDirtyAttributes", false);
        offer.get("receiver.content").save();
      }

      if (offer.get("sender.content") !== null) {
        // SIGNS ARE REVERSED !!!
        sign *= -1;
        offer.set("sender.content.money", +offer.get("sender.content.money") + sign * offer.get("price") * offer.get("tomatoes"));
        offer.set("sender.content.tomatoes", +offer.get("sender.content.tomatoes") - sign * offer.get("tomatoes"));
        offer.set("sender.content.hasDirtyAttributes", false);
        offer.get("sender.content").save();
      }

      offer.save();

      game.get('historyLogs').addObject(newHistoryObj);
      newHistoryObj.save().then(() => { 
        game.save();
        return true;
      });
    },

    declineOffer(game, offer) {
      offer.set("state", "declined");
      offer.set("notes", offer.get("notes") + `${moment().format()};declined\n`);
      offer.save();

      //Store offer into historical record
      var newHistoryObj = this.store.createRecord('history', {
        offerId      : offer.id,
        userSender   : (offer.get('sender.id') === undefined) ? "External"  : ((offer.get('sender.name')) ? offer.get('sender.name') : offer.get('sender.descriptivePlayerIdInGame')),
        userReceiver : (offer.get('receiver.id') === undefined) ? "External"  : ((offer.get('receiver.name')) ? offer.get('receiver.name') : offer.get('receiver.descriptivePlayerIdInGame')),
        state        : "Declined",
        cssStatus    : "danger",
        offer        : "tomatoes: " + offer.get('tomatoes') + ", price: " + offer.get('price')
      });

      game.get('historyLogs').addObject(newHistoryObj);

      newHistoryObj.save().then(() => { 
        game.save();
        return true;
      });

    },

    recallOffer(game, offer) {
      offer.set("state", "recalled");
      offer.set("notes", offer.get("notes") + `${moment().format()};recalled\n`);
      offer.save();

      //Store offer into historical record
      var newHistoryObj = this.store.createRecord('history', {
        offerId      : offer.id,
        userSender   : (offer.get('sender.id') === undefined) ? "External"  : ((offer.get('sender.name')) ? offer.get('sender.name') : offer.get('sender.descriptivePlayerIdInGame')),
        userReceiver : (offer.get('receiver.id') === undefined) ? "External"  : ((offer.get('receiver.name')) ? offer.get('receiver.name') : offer.get('receiver.descriptivePlayerIdInGame')),
        state        : "Recalled - Open",
        cssStatus    : "active",
        offer        : "tomatoes: " + offer.get('tomatoes') + ", price: " + offer.get('price')
      });

      game.get('historyLogs').addObject(newHistoryObj);

      newHistoryObj.save().then(() => { 
        game.save();
        return true;
      });
    },

  }

});
