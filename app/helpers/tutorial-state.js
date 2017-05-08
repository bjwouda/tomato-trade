import Ember from 'ember';

import _ from 'lodash/lodash';

import tutorials from '../tutorials/tutorials';

export function tutorialState(params/*, hash*/) {
  let tutorial = params[0];
  let state = params[1];
  
  let states = tutorials[tutorial];
  
  return _.indexOf(states, state);
}

export default Ember.Helper.helper(tutorialState);
