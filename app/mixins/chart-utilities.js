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
  
  createChartDataSet(key, data, colors, borders, radii, color, dash) {
    if(typeof colors === "undefined") {
      colors = "hsl(9,100%,64%)";
    }
    
    if(typeof borders === "undefined") {
      borders = "hsl(9,100%,44%)";
    }
    
    if(typeof radii === "undefined") {
      radii = 6;
    }
    
    if(typeof color === "undefined") {
      color = "hsl(9,100%,64%)";
    }
    
    if(typeof dash === "undefined") {
      dash = [];
    }
    
    return {
      label: this.get("i18n").t(key),
      fill: false,
      lineTension: 0,
      backgroundColor: "rgb(0,0,0,0)",
      borderColor: color,
      pointBorderColor: borders,
      pointBackgroundColor: colors,
      pointHoverBorderColor: borders,
      pointHoverBackgroundColor: colors,
      borderWidth: 2,
      pointRadius: radii,
      pointHoverRadius: radii,
      pointHitRadius: radii,
      borderDash: dash,
      data: data
    };
  }
});
