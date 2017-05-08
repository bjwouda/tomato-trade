import Ember from 'ember';

import _ from 'lodash/lodash';

export default Ember.Service.extend({
  tutorialState: Ember.Object.create(),
  
  quantumState: false,
  
  getTutorialState(tutorial) {
    let tutorialState = this.get('tutorialState');
    
    if(_.has(tutorialState, tutorial)) {
      return tutorialState[tutorial];
    }
    else {
      return 0;
    }
  },
  
  setTutorialState(tutorial, state) {
    let tutorialState = this.get('tutorialState');
    
    tutorialState[tutorial] = state;
    
    this.set('quantumState', !this.get('quantumState'));
  },
  
  decrementTutorialState(tutorial) {
    let tutorialState = this.get('tutorialState');
    
    if(!_.has(tutorialState, tutorial)) {
      tutorialState[tutorial] = 0;
    }
    
    tutorialState[tutorial] -= 1;
    
    this.set('quantumState', !this.get('quantumState'));
  },
  
  incrementTutorialState(tutorial) {
    let tutorialState = this.get('tutorialState');
    
    if(!_.has(tutorialState, tutorial)) {
      tutorialState[tutorial] = 0;
    }
    
    tutorialState[tutorial] += 1;
    
    this.set('quantumState', !this.get('quantumState'));
  }
});
