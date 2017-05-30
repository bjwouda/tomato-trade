import Ember from 'ember';

export default Ember.Component.extend({
	m: 0.0, // min (0-60)
	h: 9.0, // hour (0-24) e.g. 9h - 17h = 8h

	timeStartTs: null,
	timeEndTs: null,

	killTimer: Ember.on("willDestroyElement", function() {
		clearInterval(this.get("timerHandle"));
	}),

	test: Ember.on("didInsertElement", function() {
		var self = this;

		let timerHandle = setInterval(function() {

			if(!self.get("timeStartTs") && !self.get("timeEndTs")) {
				return;
			}

			let nowMoment = moment();
			let endMoment = moment(self.get("timeEndTs"));
			self.set("timeMissingMin", endMoment.diff(nowMoment, 'minutes'));
			self.set("timeMissingSec", endMoment.diff(nowMoment, 'seconds'));

			var currDiff = moment() - self.get("timeStartTs");
			var totalDiff = (self.get("timeEndTs") - self.get("timeStartTs")); // turn ms into min

			var ratio = (currDiff / totalDiff);
			ratio = Math.min(ratio, 1.0);

			self.set("isOver", ratio === 1.0);

			var ratioMinutes = ratio * 8 * 60;

			var mAdd = (ratioMinutes);
			var hAdd = (ratioMinutes / 60);

			self.set("m", mAdd);
			self.set("h", 9 + hAdd);
				

		}, 1000);

		this.set("timerHandle", timerHandle);
	}),

	timeMissingAlert: Ember.computed("timeMissingSec", function() {
		return +this.get("timeMissingSec") < 60;
	}),


	hDeg: Ember.computed("h", "m", function() {
		return 360.0 * this.get("h") * (1.0 / 12.0);
	}),

	mDeg: Ember.computed("m", function() {
		return 360.0 * this.get("m") * (1.0 / 60.0);
	}),
});
