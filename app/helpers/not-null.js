import Ember from 'ember';

export function notNull(params/*, hash*/) {
  return params[0] !== null;
}

export default Ember.Helper.helper(notNull);
