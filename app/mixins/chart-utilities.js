import Ember from 'ember';

export default Ember.Mixin.create({
  i18n: Ember.inject.service(),
  
  createChartData(key, labels, data) {
    return {
      labels: labels,
      datasets: [
        {
          label: this.get("i18n").t(key),
          fill: false,
          lineTension: 0,
          backgroundColor: "hsl(9,100%,64%)",
          borderColor: "hsl(9,100%,64%)",
          pointBorderColor: "hsl(9,100%,44%)",
          pointBackgroundColor: "hsl(9,100%,64%)",
          borderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHitRadius: 16,
          data: data
        }
      ]
    };
  }
});
