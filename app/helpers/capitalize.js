import Ember from 'ember';

import _ from 'lodash/lodash';

export function capitalize(params/*, hash*/) {
  return _.capitalize(params);
}

export default Ember.Helper.helper(capitalize);
