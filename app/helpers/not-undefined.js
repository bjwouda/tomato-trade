import Ember from 'ember';

export function notUndefined(params/*, hash*/) {
  return typeof params[0] !== 'undefined';
}

export default Ember.Helper.helper(notUndefined);
