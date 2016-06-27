// JS
var d3 = window.d3 || require('d3');
var px = window.px || require('../javascripts/modules/caravel.js');

// CSS
require('./treemap.css');

/* Modified from http://bl.ocks.org/ganeshv/6a8e9ada3ab7f2d88022 */
function treemap(slice) {

  var div = d3.select(slice.selector);

  var _draw = function (data, eltWidth, eltHeight, formData) {

    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        navBarHeight = 36,
        navBarTitleSize = navBarHeight / 3,
        navBarBuffer = 10,
        width = eltWidth - margin.left - margin.right,
        height = eltHeight - navBarHeight - navBarBuffer -
                 margin.top - margin.bottom,
        transitioning,
        formatNumber = d3.format(formData.number_format);

    var x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);

    var treemap = d3.layout.treemap()
        .children(function (d, depth) { return depth ? null : d._children; })
        .sort(function (a, b) { return a.value - b.value; })
        .ratio(formData.treemap_ratio)
        .mode("squarify")
        .round(false);

    var svg = div.append("svg")
        .attr("width", eltWidth)
        .attr("height", eltHeight);

    var chartContainer = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," +
                           (margin.top + navBarHeight + navBarBuffer) + ")")
        .style("shape-rendering", "crispEdges");

    var grandparent = svg.append("g")
        .attr("class", "grandparent")
        .attr("transform", "translate(0," + (margin.top + navBarBuffer / 2) + ")");

    grandparent.append("rect")
        .attr("width", width)
        .attr("height", navBarHeight);

    grandparent.append("text")
        .attr("x", width / 2)
        .attr("y", navBarHeight / 2 + navBarTitleSize / 2)
        .style("font-size", navBarTitleSize + "px")
        .style("text-anchor", "middle");

    var initialize = function (root) {
      root.x = root.y = 0;
      root.dx = width;
      root.dy = height;
      root.depth = 0;
    };

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    // We also take a snapshot of the original children (_children) to avoid
    // the children being overwritten when when layout is computed.
    var accumulate = function (d) {
      d._children = d.children;
      if (d._children) {
        d.value = d.children.reduce(function (p, v) { return p + accumulate(v); }, 0);
      }
      return d.value;
    };

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1x1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parents dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1x1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    var layout = function (d) {
      if (d._children) {
        treemap.nodes({ _children: d._children });
        d._children.forEach(function (c) {
          c.x = d.x + c.x * d.dx;
          c.y = d.y + c.y * d.dy;
          c.dx *= d.dx;
          c.dy *= d.dy;
          c.parent = d;
          layout(c);
        });
      }
    };

    var display = function (d) {

      var transition = function (d) {
        if (transitioning || !d) { return; }
        transitioning = true;

        var g2 = display(d),
            t1 = g1.transition().duration(750),
            t2 = g2.transition().duration(750);

        // Update the domain only after entering new elements.
        x.domain([d.x, d.x + d.dx]);
        y.domain([d.y, d.y + d.dy]);

        // Enable anti-aliasing during the transition.
        chartContainer.style("shape-rendering", null);

        // Draw child nodes on top of parent nodes.
        chartContainer.selectAll(".depth").sort(function (a, b) { return a.depth - b.depth; });

        // Fade-in entering text.
        g2.selectAll("text").style("fill-opacity", 0);

        // Transition to the new view.
        t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
        t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
        t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
        t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
        t1.selectAll("rect").call(rect);
        t2.selectAll("rect").call(rect);

        // Remove the old node when the transition is finished.
        t1.remove().each("end", function () {
          chartContainer.style("shape-rendering", "crispEdges");
          transitioning = false;
        });
      };

      grandparent
          .datum(d.parent)
          .on("click", transition)
        .select("text")
          .text(name(d));

      var g1 = chartContainer.append("g")
          .datum(d)
          .attr("class", "depth");

      var g = g1.selectAll("g")
          .data(d._children)
        .enter().append("g");

      g.filter(function (d) { return d._children; })
          .classed("children", true)
          .on("click", transition);

      var children = g.selectAll(".child")
          .data(function (d) { return d._children || [d]; })
        .enter().append("g");

      children.append("rect")
          .attr("class", "child")
          .call(rect)
        .append("title")
          .text(function (d) { return d.name + " (" + formatNumber(d.value) + ")"; });

      children.append("text")
          .attr("class", "ctext")
          .text(function (d) { return d.name; })
          .call(text2);

      g.append("rect")
          .attr("class", "parent")
          .call(rect);

      var t = g.append("text")
          .attr("class", "ptext")
          .attr("dy", ".75em");

      t.append("tspan")
          .text(function (d) { return d.name; });
      t.append("tspan")
          .attr("dy", "1.0em")
          .text(function (d) { return formatNumber(d.value); });
      t.call(text);

      g.selectAll("rect")
          .style("fill", function (d) { return px.color.category21(d.name); });

      return g;
    };

    var text = function (selection) {
      selection.selectAll("tspan")
          .attr("x", function (d) { return x(d.x) + 6; });
      selection.attr("x", function (d) { return x(d.x) + 6; })
          .attr("y", function (d) { return y(d.y) + 6; })
          .style("opacity", function (d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; });
    };

    var text2 = function (selection) {
      selection.attr("x", function (d) { return x(d.x + d.dx) - this.getComputedTextLength() - 6; })
          .attr("y", function (d) { return y(d.y + d.dy) - 6; })
          .style("opacity", function (d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; });
    };

    var rect = function (selection) {
      selection.attr("x", function (d) { return x(d.x); })
               .attr("y", function (d) { return y(d.y); })
               .attr("width", function (d) { return x(d.x + d.dx) - x(d.x); })
               .attr("height", function (d) { return y(d.y + d.dy) - y(d.y); });
    };

    var name = function (d) {
      return d.parent
          ? name(d.parent) + " / " + d.name + " (" + formatNumber(d.value) + ")"
          : d.name + " (" + formatNumber(d.value) + ")";
    };

    initialize(data);
    accumulate(data);
    layout(data);
    display(data);

  };

  var render = function () {

    d3.json(slice.jsonEndpoint(), function (error, json) {

      if (error !== null) {
        slice.error(error.responseText, error);
        return '';
      }

      div.selectAll("*").remove();
      var width = slice.width();
      // facet muliple metrics (no sense in combining)
      var height = slice.height() / json.data.length;
      for (var i = 0, l = json.data.length; i < l; i ++) {
        _draw(json.data[i], width, height, json.form_data);
      }

      slice.done(json);

    });

  };

  return {
    render: render,
    resize: render
  };
}

module.exports = treemap;

