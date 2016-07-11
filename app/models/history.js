import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	userSender   : attr('string'), //e.g. Seller1
	userReceiver : attr('string'),//Buyer1
	state		 : attr('string'), //Open, Accepted, Declined could also be represented by color (Yellow: offer sent, Red: offer rejected, etc)
	cssStatus	 : attr('string'), //active, success, danger 
	offer        : attr('string'), // number of tomatos, price
	tS           : attr('number', {defaultValue: Date.now()}), //timeStamp
	
	historyGame  : belongsTo('game')

});