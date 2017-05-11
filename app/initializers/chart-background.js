export function initialize(/* application */) {
  // http://stackoverflow.com/questions/37144031/background-colour-of-line-charts-in-chart-js
  Chart.pluginService.register({
    beforeDraw: function(chart, easing) {
      let helpers = Chart.helpers;
      let ctx = chart.chart.ctx;
      let chartArea = chart.chartArea;

      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
      ctx.restore();
    }
  });
}

export default {
  name: 'chart-background',
  initialize
};
