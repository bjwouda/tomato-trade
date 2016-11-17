import Ember from 'ember';
import OfferActions from '../mixins/offer-actions';
import LangActions from '../mixins/lang-actions';

import _ from 'lodash/lodash';

export default Ember.Controller.extend(OfferActions, LangActions, {
	game: Ember.computed.alias("model.userGame.content"),
	_extOfferTomato: 0,

	clearInputsOnNewRound: Ember.observer("game.roundCnt", function() {
		this.set("_ext_offerTomato", "")
		this.get("game.users").forEach((u) => {
			u.set("_offerTomato", "")
			u.set("_offerPrice", "")
		})
	})
});
