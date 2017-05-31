import Transform from 'ember-data/transform';

import _ from 'lodash/lodash';

export default Transform.extend({
  deserialize(serialized) {
  	return serialized;
    // return JSON.parse(serialized) | {};
  },

  serialize(deserialized) {
  	if(_.isEmpty(deserialized)) {
  		return {firebaseDummyPlaceholder: "firebaseDummyPlaceholder"};
  	} {
  		return deserialized;
  	}

    // return JSON.stringify(deserialized);
  }
});
