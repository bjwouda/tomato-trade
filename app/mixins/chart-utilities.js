import Ember from 'ember';

export default Ember.Mixin.create({
  i18n: Ember.inject.service(),
  
  createChartData(dataSets, options, labels) {
    return {
      labels: labels,
      datasets: dataSets,
      options: options
    }
  },
  
  createChartDataSet(key, data, colors, radii) {
    if(typeof colors === "undefined") {
      colors = "hsl(9,100%,64%)";
    }
    
    if(typeof radii === "undefined") {
      radii = 6;
    }
    
    let hoverRadii;
    
    if(radii instanceof Array) {
      hoverRadii = radii.map(function(radius) {
        return radius + 2;
      });
    }
    else {
      hoverRadii = radii + 2;
    }
    
    return {
      label: this.get("i18n").t(key),
      fill: false,
      lineTension: 0,
      backgroundColor: "hsl(9,100%,64%)",
      borderColor: "hsl(9,100%,64%)",
      pointBorderColor: "hsl(9,100%,44%)",
      pointBackgroundColor: colors,
      borderWidth: 2,
      pointRadius: radii,
      pointHoverRadius: hoverRadii,
      pointHitRadius: hoverRadii,
      data: data
    };
  }
});
