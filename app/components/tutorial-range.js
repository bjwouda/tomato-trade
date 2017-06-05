import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  
  tutorialState: Ember.inject.service(),
  
  // Using not one but two hacks! 'tutorialState.quantumState' is toggled every time
  // 'tutorialState.tutorialState' has changed, and 'tutorial' comes from the calling template.
  state: Ember.computed('tutorialState.tutorialState', 'tutorialState.quantumState', function() {
    return this.get('tutorialState').getTutorialState(this.get('tutorial'));
  })
});
