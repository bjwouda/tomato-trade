import Ember from 'ember';
import LangActions from '../mixins/lang-actions';
import config from '../config/environment';

export default Ember.Controller.extend(LangActions, {
    version: config.APP.VERSION
});
