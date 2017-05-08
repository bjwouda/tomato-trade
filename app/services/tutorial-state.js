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
  
  recedeTutorialState(tutorial, amount) {
    if(typeof amount == 'undefined') {
      amount = 1;
    }
    
    let tutorialState = this.get('tutorialState');
    
    if(!_.has(tutorialState, tutorial)) {
      tutorialState[tutorial] = 0;
    }
	
	tutorialState[tutorial] -= amount;
	
	this.set('quantumState', !this.get('quantumState'));
  },
  
  advanceTutorialState(tutorial, amount) {
    if(typeof amount == 'undefined') {
      amount = 1;
    }
    
    let tutorialState = this.get('tutorialState');
    
    if(!_.has(tutorialState, tutorial)) {
      tutorialState[tutorial] = 0;
    }
	
	tutorialState[tutorial] += amount;
	
	this.set('quantumState', !this.get('quantumState'));
  }
});
