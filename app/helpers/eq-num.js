import Ember from 'ember';

export function eqNum(params/*, hash*/) {
  let prm0 = params[0];
  let prm1 = params[1];
  return +prm0 === +prm1;
}

export default Ember.Helper.helper(eqNum);
