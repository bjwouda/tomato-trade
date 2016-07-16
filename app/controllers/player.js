import Ember from 'ember';
import OfferActions from '../mixins/offer-actions';
import LangActions from '../mixins/lang-actions';

export default Ember.Controller.extend(OfferActions, LangActions, {
	game: Ember.computed.alias("model.userGame.content")

});
