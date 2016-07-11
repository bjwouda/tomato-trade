import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    exportCSV() {
      var data = [];
      var titles = ["userSender", "userReceiver", "state", "offer", "tS"];

      data.push(titles);
      this.get("model").map((historyElement) => {
        // historyElement => 1x historical element
        // now go through each element in titles and get it from historyElement
        var resolvedTitles = titles.map((titleElement) => {
          return historyElement.get(titleElement); });
        data.push(resolvedTitles);
      });
      this.get('csv').export(data, 'test.csv');
    }
  }
});
