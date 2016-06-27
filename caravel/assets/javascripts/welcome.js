var $ = window.$ = require('jquery');
var jQuery = window.jQuery = $;

require('../stylesheets/welcome.css');
require('bootstrap');
require('datatables.net-bs');
require('../node_modules/datatables-bootstrap3-plugin/media/css/datatables-bootstrap3.css');
require('../node_modules/cal-heatmap/cal-heatmap.css');
var d3 = require('d3');

var CalHeatMap = require('cal-heatmap');

function modelViewTable(selector, modelView, orderCol, order) {
  // Builds a dataTable from a flask appbuilder api endpoint
  var url = '/' + modelView.toLowerCase() + '/api/read';
  url += '?_oc_' + modelView + '=' + orderCol;
  url += '&_od_' + modelView +'=' + order;
  $.getJSON(url, function (data) {
    var tableData = jQuery.map(data.result, function (el, i) {
        var row = $.map(data.list_columns, function (col, i) {
          return el[col];
        });
        return [row];
    });
    var cols = jQuery.map(data.list_columns, function (col, i) {
      return { sTitle: data.label_columns[col] };
    });
    var panel = $(selector).parents('.panel');
    panel.find("img.loading").remove();
    $(selector).DataTable({
      aaData: tableData,
      aoColumns: cols,
      bPaginate: true,
      pageLength: 10,
      bLengthChange: false,
      aaSorting: [],
      searching: true,
      bInfo: false
    });

    // Hack to move the searchbox in the right spot
    var search = panel.find(".dataTables_filter input");
    search.addClass('form-control').detach();
    search.appendTo(panel.find(".search"));
    panel.find('.dataTables_filter').remove();

    // Hack to display the page navigator properly
    panel.find('.col-sm-5').remove();
    var nav = panel.find('.col-sm-7');
    nav.removeClass('col-sm-7');
    nav.addClass('col-sm-12');

    $(selector).slideDown();
    $('[data-toggle="tooltip"]').tooltip({ container: 'body' });
  });
}

$(document).ready(function () {
  d3.json('/caravel/activity_per_day', function (json) {
    var ext = d3.extent(d3.values(json));
    var cal = new CalHeatMap();
    var range = 10;
    var legendBounds = [];
    var step = (ext[1] - ext[0]) / (range - 1);
    for (var i = 0; i< range; i++) {
      legendBounds.push(i * step + ext[0]);
    }
    cal.init({
      start: new Date().setFullYear(new Date().getFullYear() - 1),
      range: 13,
      data: json,
      legend: legendBounds,
      legendColors: ['#D6E685', '#1E6823'],  // Based on github's colors
      domain: "month",
      subDomain: "day",
      itemName: "action",
      tooltip: true
    });
  });
  modelViewTable('#dash_table', 'DashboardModelViewAsync', 'changed_on', 'desc');
});
