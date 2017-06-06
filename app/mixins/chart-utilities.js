import Ember from 'ember';

export default Ember.Mixin.create({
  createChartData(dataSets, labels, options) {
    return {
      labels: labels,
      datasets: dataSets,
      options: options
    };
  },
  
  createLineChartDataSet(label, data, colors, borders, radii, color, dash) {
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
      label: label,
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
  },
  
  createBarChartDataSet(label, data, colors, borders) {
    if(typeof colors === "undefined") {
      colors = "hsl(9,100%,64%)";
    }
    
    if(typeof borders === "undefined") {
      borders = "hsl(9,100%,44%)";
    }
    
    return {
      label: label,
      backgroundColor: colors,
      borderColor: borders,
      borderWidth: 2,
      hoverBackgroundColor: colors,
      hoverBorderColor: borders,
      hoverBorderWidth: 2,
      data: data
    };
  }
});
