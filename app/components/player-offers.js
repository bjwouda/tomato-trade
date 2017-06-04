import Ember from 'ember';

import OfferActions from '../mixins/offer-actions';
import TutorialActions from '../mixins/tutorial-actions';

export default Ember.Component.extend(OfferActions, TutorialActions, {
  tagName: ''
});
