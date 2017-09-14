import _ from 'lodash';
import $ from 'jquery';
import 'jquery.flot';
import 'jquery.flot.pie';

export default function link(scope, elem, attrs, ctrl) {
  var data, panel, series;
  elem = elem.find('.sparktext-panel');
  function parseSparkText(data){
    var datadic = {};
    data.map(d => datadic[d.id] = d);
    for(var c in series){
      parseSparkTextSerie(series[c], datadic);
    }
  }
  function parseSparkTextSerie(serie, datadic){
    serie.serieIds.map(id => parseSparkElement(serie.el, serie.pattern, datadic[id], id));
  }
  function parseSparkElement(el, text, serie){
    if(!serie) return;
    el.innerHTML = text.replace(/#([A-Z])\.([a-zA-Z0-9]*)/gm, 
        function(match, id, property){ 
          return serie.hasOwnProperty(property) && serie.id === id ? serie[property]: match;
        });;
  }
  ctrl.events.on('render', function() {
    render(false);
  });

  function setElementHeight() {
    try {
      var height = ctrl.height || panel.height || ctrl.row.height;
      if (_.isString(height)) {
        height = parseInt(height.replace('px', ''), 10);
      }

      height -= 5; // padding
      height -= panel.title ? 24 : 9; // subtract panel title bar

      elem.css('height', height + 'px');

      return true;
    } catch(e) { // IE throws errors sometimes
      return false;
    }
  }

  function formatter(label, slice) {
    return "<div style='font-size:" + ctrl.panel.fontSize + ";text-align:center;padding:2px;color:" + slice.color + ";'>" + label + "<br/>" + Math.round(slice.percent) + "%</div>";
  }

  function addsparktext() {
    var width = elem.width();
    var height = elem.height();

    var size = Math.min(width, height);

    var plotCanvas = $('<div></div>');
    var plotCss = {
      top: '10px',
      margin: 'auto',
      position: 'relative',
      height: (size - 20) + 'px'
    };

    plotCanvas.css(plotCss);

    var $panelContainer = elem.parents('.panel-container');
    var backgroundColor = $panelContainer.css('background-color');

    var options = {
      legend: {
        show: false
      },
      series: {
        pie: {
          show: true,
          stroke: {
            color: backgroundColor,
            width: parseFloat(ctrl.panel.strokeWidth).toFixed(1)
          },
          label: {
            show: ctrl.panel.legend.show && ctrl.panel.legendType === 'On graph',
            formatter: formatter
          },
          highlight: {
            opacity: 0.0
          },
		  combine: {
		    threshold: ctrl.panel.combine.threshold,
			label: ctrl.panel.combine.label
		  }
        }
      },
      grid: {
        hoverable: true,
        clickable: false
      }
    };

    if (panel.pieType === 'donut') {
      options.series.pie.innerRadius = 0.5;
    }

    elem.html(plotCanvas);

    $.plot(plotCanvas, ctrl.data, options);
    plotCanvas.bind("plothover", function (event, pos, item) {
      if (!item) {
        $tooltip.detach();
        return;
      }

      var body;
      var percent = parseFloat(item.series.percent).toFixed(2);
      var formatted = ctrl.formatValue(item.series.data[0][1]);

      body = '<div class="graph-tooltip-small"><div class="graph-tooltip-time">';
      body += '<div class="graph-tooltip-value">' + item.series.label + ': ' + formatted;
      body += " (" + percent + "%)" + '</div>';
      body += "</div></div>";

      $tooltip.html(body).place_tt(pos.pageX + 20, pos.pageY);
    });
  }

  function render(incrementRenderCounter) {
    if (!ctrl.data) { return; }

    data = ctrl.data;
    panel = ctrl.panel;
    $(elem).html(panel.content);
    var seriesRe = /#([A-Z])\./g;
    series = elem.find('.series')
              .map((i, el) => {
                var serieIds = {}, m;
                while(m = seriesRe.exec(el.innerHTML))
                  serieIds[m[1]] = null;
                return {      
                    el:el, 
                    pattern: el.innerHTML,
                    serieIds: Object.keys(serieIds)
                };
              })
              .toArray();
  
    // UGLY: series refId is not set with the data so not 100% this is correct :(
    var A = 65;
    data.map(d => d.id = String.fromCharCode(A++));
    
    parseSparkText(data, panel);

    if (incrementRenderCounter) {
      ctrl.renderingCompleted();
    }
  }
}

