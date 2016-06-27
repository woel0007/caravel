// JS
var d3 = window.d3 || require('d3');
var px = window.px || require('../javascripts/modules/caravel.js');
var nv = require('nvd3');

// CSS
require('../node_modules/nvd3/build/nv.d3.min.css');
require('./nvd3_vis.css');

const minBarWidth = 15;

function nvd3Vis(slice) {
  var chart;
  var colorKey = 'key';

  var render = function () {
    d3.json(slice.jsonEndpoint(), function (error, payload) {
      slice.container.html('');
      // Check error first, otherwise payload can be null
      if (error) {
        slice.error(error.responseText, error);
        return '';
      }

      var width = slice.width();
      var fd = payload.form_data;
      var barchartWidth = function () {
        var bars;
        if (fd.bar_stacked) {
          bars = d3.max(payload.data, function (d) { return d.values.length; });
        } else {
          bars = d3.sum(payload.data, function (d) { return d.values.length; });
        }
        if (bars * minBarWidth > width) {
          return bars * minBarWidth;
        } else {
          return width;
        }
      };
      var viz_type = fd.viz_type;
      var f = d3.format('.3s');
      var reduceXTicks = fd.reduce_x_ticks || false;

      nv.addGraph(function () {
        switch (viz_type) {
          case 'line':
            if (fd.show_brush) {
              chart = nv.models.lineWithFocusChart();
              chart.lines2.xScale(d3.time.scale.utc());
              chart.x2Axis
              .showMaxMin(fd.x_axis_showminmax)
              .staggerLabels(false);
            } else {
              chart = nv.models.lineChart();
            }
            // To alter the tooltip header
            // chart.interactiveLayer.tooltip.headerFormatter(function(){return '';});
            chart.xScale(d3.time.scale.utc());
            chart.interpolate(fd.line_interpolation);
            chart.xAxis
            .showMaxMin(fd.x_axis_showminmax)
            .staggerLabels(false);
            break;

          case 'bar':
            chart = nv.models.multiBarChart()
            .showControls(fd.show_controls)
            .groupSpacing(0.1);

            if (!reduceXTicks) {
              width = barchartWidth();
            }
            chart.width(width);
            chart.xAxis
            .showMaxMin(false)
            .staggerLabels(true);

            chart.stacked(fd.bar_stacked);
            break;

          case 'dist_bar':
            chart = nv.models.multiBarChart()
            .showControls(fd.show_controls)
            .reduceXTicks(reduceXTicks)
            .rotateLabels(45)
            .groupSpacing(0.1); //Distance between each group of bars.

            chart.xAxis
            .showMaxMin(false);

            chart.stacked(fd.bar_stacked);
            if (!reduceXTicks) {
              width = barchartWidth();
            }
            chart.width(width);
            break;

          case 'pie':
            chart = nv.models.pieChart();
            colorKey = 'x';
            chart.valueFormat(f);
            if (fd.donut) {
              chart.donut(true);
              chart.labelsOutside(true);
            }
            chart.labelsOutside(true);
            chart.cornerRadius(true);
            break;

          case 'column':
            chart = nv.models.multiBarChart()
            .reduceXTicks(false)
            .rotateLabels(45);
            break;

          case 'compare':
            chart = nv.models.cumulativeLineChart();
            chart.xScale(d3.time.scale.utc());
            chart.xAxis
            .showMaxMin(false)
            .staggerLabels(true);
            break;

          case 'bubble':
            var row = function (col1, col2) {
              return "<tr><td>" + col1 + "</td><td>" + col2 + "</td></tr>";
            };
            chart = nv.models.scatterChart();
            chart.showDistX(true);
            chart.showDistY(true);
            chart.tooltip.contentGenerator(function (obj) {
              var p = obj.point;
              var s = "<table>";
              s += '<tr><td style="color:' + p.color + ';"><strong>' + p[fd.entity] + '</strong> (' + p.group + ')</td></tr>';
              s += row(fd.x, f(p.x));
              s += row(fd.y, f(p.y));
              s += row(fd.size, f(p.size));
              s += "</table>";
              return s;
            });
            chart.pointRange([5, fd.max_bubble_size * fd.max_bubble_size]);
            break;

          case 'area':
            chart = nv.models.stackedAreaChart();
            chart.showControls(fd.show_controls);
            chart.style(fd.stacked_style);
            chart.xScale(d3.time.scale.utc());
            chart.xAxis
            .showMaxMin(false)
            .staggerLabels(true);
            break;

          case 'box_plot':
            colorKey = 'label';
            chart = nv.models.boxPlotChart();
            chart.x(function (d) {
              return d.label;
            });
            chart.staggerLabels(true);
            chart.maxBoxWidth(75); // prevent boxes from being incredibly wide
            break;

          default:
            throw new Error("Unrecognized visualization for nvd3" + viz_type);
        }

        if ("showLegend" in chart && typeof fd.show_legend !== 'undefined') {
          chart.showLegend(fd.show_legend);
        }

        var height = slice.height();
        height -= 15;  // accounting for the staggered xAxis

        chart.height(height);
        slice.container.css('height', height + 'px');

        if ((viz_type === "line" || viz_type === "area") && fd.rich_tooltip) {
          chart.useInteractiveGuideline(true);
        }
        if (fd.y_axis_zero) {
          chart.forceY([0]);
        } else if (fd.y_log_scale) {
          chart.yScale(d3.scale.log());
        }
        if (fd.x_log_scale) {
          chart.xScale(d3.scale.log());
        }
        var xAxisFormatter = null;
        if (viz_type === 'bubble') {
          xAxisFormatter = d3.format('.3s');
        } else if (fd.x_axis_format === 'smart_date') {
          xAxisFormatter = px.formatDate;
          chart.xAxis.tickFormat(xAxisFormatter);
        } else if (fd.x_axis_format !== undefined) {
          xAxisFormatter = px.timeFormatFactory(fd.x_axis_format);
          chart.xAxis.tickFormat(xAxisFormatter);
        }

        if (chart.hasOwnProperty("x2Axis")) {
          chart.x2Axis.tickFormat(xAxisFormatter);
          height += 30;
        }

        if (viz_type === 'bubble') {
          chart.xAxis.tickFormat(d3.format('.3s'));
        } else if (fd.x_axis_format === 'smart_date') {
          chart.xAxis.tickFormat(px.formatDate);
        } else if (fd.x_axis_format !== undefined) {
          chart.xAxis.tickFormat(px.timeFormatFactory(fd.x_axis_format));
        }
        if (chart.yAxis !== undefined) {
          chart.yAxis.tickFormat(d3.format('.3s'));
        }

        if (fd.y_axis_format) {
          chart.yAxis.tickFormat(d3.format(fd.y_axis_format));

          if (chart.y2Axis !== undefined) {
            chart.y2Axis.tickFormat(d3.format(fd.y_axis_format));
          }
        }
        chart.color(function (d, i) {
          return px.color.category21(d[colorKey]);
        });

        if (fd.x_axis_label && fd.x_axis_label !== '' && chart.xAxis) {
          var distance = 0;
          if (fd.bottom_margin) {
            distance = fd.bottom_margin - 50;
          }
          chart.xAxis.axisLabel(fd.x_axis_label).axisLabelDistance(distance);
        }

        if (fd.y_axis_label && fd.y_axis_label !== '' && chart.yAxis) {
          chart.yAxis.axisLabel(fd.y_axis_label);
          chart.margin({ left: 90 });
        }

        if (fd.bottom_margin) {
          chart.margin({ bottom: fd.bottom_margin });
        }
        var svg = d3.select(slice.selector).select("svg");
        if (svg.empty()) {
          svg = d3.select(slice.selector).append("svg");
        }

        svg
        .datum(payload.data)
        .transition().duration(500)
        .attr('height', height)
        .attr('width', width)
        .call(chart);

        return chart;
      });

      slice.done(payload);
    });
  };

  var update = function () {
    if (chart && chart.update) {
      chart.update();
    }
  };

  return {
    render: render,
    resize: update
  };
}

module.exports = nvd3Vis;
