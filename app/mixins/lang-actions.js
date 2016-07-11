import Ember from 'ember';

export default Ember.Mixin.create({
	i18n: Ember.inject.service(),
	moment: Ember.inject.service(),

	actions: {
		changeLang(langCode) {
			this.set("i18n.locale", langCode);
			this.get('moment').changeLocale(langCode);
		}
	}
});
