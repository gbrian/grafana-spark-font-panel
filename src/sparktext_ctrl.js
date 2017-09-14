import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import TimeSeries from 'app/core/time_series';
import rendering from './rendering';
import legend from './legend';

export class SparkTextCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    this.$rootScope = $rootScope;
    var content = '<div class="sparktext-panel">' +
    '<h3>Stats A</h3>' +
    '<b>Min:&nbsp;</b><span class="series">#A.min</span>' +
    '&nbsp;<b>Max:&nbsp;</b><span class="series">#A.max</span>' +
    '&nbsp;<b>Avg:&nbsp;</b><span class="series">#A.avg</span>' +
    '<span class="spark-bar-medium series">' +
    '<span class="orange-red-text">#A.min{#A.data}#A.max</span>' +
    '</span>' +
    '<h3>Usage</h3>' +
    '<span class="spark-bar-medium series"><span class="green-text">{#A.data}</span></span>&nbsp;' +
    '<span class="spark-bar-narrow series"><span class="orange-red-text">{#A.data}</span></span>&nbsp;' +
    '<span class="spark-bar-thin series"><span class="purple-text">{#A.data}</span></span>&nbsp;' +
    '<span class="spark-dot-line-medium series"><span class="grey-text-1">{#A.data}</span></span>&nbsp;' +
    '<span class="spark-dot-medium series"><span class="blue-text">{#A.data}</span></span>&nbsp;' +
    '<span class="spark-dot-small series"><span style="color:#A.color">{#A.data}</span></span>&nbsp;' +
    '<p>Plugin works with html.</p>' +
    '<p><i>Syntax:</i></p> ' +
    '<div style="' +
    '    padding: 4px;' +
    '    background-color: gainsboro;' +
    '    color: black;' +
    '    margin-bottom: 10px;' +
    '  ">' +
    '&lt;b&gt;Min: &lt;/b&gt;&lt;span class=&quot;series&quot;&gt;#A.min&lt;/span&gt;<br/>' +
    '</div>' +
    'Where <b>class="series"</b> defines an element with data replacemnets and <b>#A.max</b> will be replaced by the metric <i>max</i>' +
    'from series <i>A</i>.<br>' +
    '<i>#A.data</i> becomes all values in csv format scaled to 0 - 100. ex: <i>{#A.data}</i> results in <i>{10,23,45,67}</i>' +
    'If you need raw data use <i>datapoints</i> instead.' +
    '</div>';
    var panelDefaults = {
      pieType: 'pie',
      legend: {
        show: true, // disable/enable legend
        values: true
      },
      links: [],
      datasource: null,
      interval: '1m',
      targets: [{}],
      cacheTimeout: null,
      nullPointMode: 'connected',
      legendType: 'Under graph',
      aliasColors: {},
      format: 'short',
      valueName: 'current',
      strokeWidth: 1,
      fontSize: '80%',
      content: content,
	  combine: {
	    threshold: 0.0,
	    label: 'Others'
	  }
    };

    _.defaults(this.panel, panelDefaults);
    _.defaults(this.panel.legend, panelDefaults.legend);

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceivedSnapshot.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
  }

  onInitEditMode() {
    this.addEditorTab('Template', 'public/plugins/grafana-spark-font-panel/editor.html', 2);
    this.unitFormats = kbn.getUnitFormats();
  }

  setUnitFormat(subItem) {
    this.panel.format = subItem.value;
    this.render();
  }

  onDataError() {
    this.series = [];
    this.render();
  }

  changeSeriesColor(series, color) {
    series.color = color;
    this.panel.aliasColors[series.alias] = series.color;
    this.render();
  }

  onRender() {
    this.data = this.parseSeries(this.series);
  }

  parseSeries(series) {
    return _.map(this.series, (serie, i) => {
      var pv = 100 / serie.stats.max; 
      return _.merge({
        id: serie.alias.split("-")[0],
        label: serie.alias,
        datapoints: serie.datapoints,
        // Scale to 0 - 100 as seems not been working with decimals
        data: serie.datapoints.map(p => p[0])
          .map(p => parseInt(p * pv)).join(","),
        color: this.panel.aliasColors[serie.alias] || this.$rootScope.colors[i]
      }, serie.stats);
    });
  }

  onDataReceivedSnapshot(dataList) {
    
  }
  onDataReceived(dataList) {
    this.series = dataList.map(this.seriesHandler.bind(this));
    this.data = this.parseSeries(this.series);
    this.render(this.data);
  }

  seriesHandler(seriesData) {
    var series = new TimeSeries({
      datapoints: seriesData.datapoints,
      alias: seriesData.target
    });

    series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
    return series;
  }

  getDecimalsForValue(value) {
    if (_.isNumber(this.panel.decimals)) {
      return { decimals: this.panel.decimals, scaledDecimals: null };
    }

    var delta = value / 2;
    var dec = -Math.floor(Math.log(delta) / Math.LN10);

    var magn = Math.pow(10, -dec);
    var norm = delta / magn; // norm is between 1.0 and 10.0
    var size;

    if (norm < 1.5) {
      size = 1;
    } else if (norm < 3) {
      size = 2;
      // special case for 2.5, requires an extra decimal
      if (norm > 2.25) {
        size = 2.5;
        ++dec;
      }
    } else if (norm < 7.5) {
      size = 5;
    } else {
      size = 10;
    }

    size *= magn;

    // reduce starting decimals if not needed
    if (Math.floor(value) === value) { dec = 0; }

    var result = {};
    result.decimals = Math.max(0, dec);
    result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

    return result;
  }

  formatValue(value) {
    var decimalInfo = this.getDecimalsForValue(value);
    var formatFunc = kbn.valueFormats[this.panel.format];
    if (formatFunc) {
      return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
    }
    return value;
  }

  link(scope, elem, attrs, ctrl) {
    rendering(scope, elem, attrs, ctrl);
  }
}

SparkTextCtrl.templateUrl = 'module.html';
