import Ember from 'ember';
import OfferActions from '../mixins/offer-actions';
import LangActions from '../mixins/lang-actions';

import _ from 'lodash/lodash';

let lastRound = 1

export default Ember.Controller.extend(OfferActions, LangActions, {
	game: Ember.computed.alias("model.userGame.content"),
	_extOfferTomato: 0,

	clearInputsOnNewRound: Ember.observer("game.roundCnt", function() {

        let roundCnt = this.get('game.roundCnt')
        if (roundCnt === lastRound) { return }
        lastRound = roundCnt

		this.set("_ext_offerTomato", "")
		this.get("game.users").forEach((u) => {
			u.set("_offerTomato", "")
			u.set("_offerPrice", "")
		})
	})
});
