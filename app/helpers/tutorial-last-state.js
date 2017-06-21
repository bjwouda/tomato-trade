import Ember from 'ember';

import tutorials from '../tutorials/tutorials';

export function tutorialLastState(params/*, hash*/) {
  let tutorial = params[0];
  
  let states = tutorials[tutorial];
  
  return states.length - 1;
}

export default Ember.Helper.helper(tutorialLastState);
