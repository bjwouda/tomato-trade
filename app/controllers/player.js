import Ember from 'ember';
import OfferActions from '../mixins/offer-actions';

export default Ember.Controller.extend(OfferActions, {
	i18n: Ember.inject.service(),

	actions: {
		changeLang(langCode) {
			this.set("i18n.locale", langCode);
		}
	}
});
