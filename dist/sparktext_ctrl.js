'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', 'app/core/time_series', './rendering', './legend'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, kbn, TimeSeries, rendering, legend, _createClass, SparkTextCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_rendering) {
      rendering = _rendering.default;
    }, function (_legend) {
      legend = _legend.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('SparkTextCtrl', SparkTextCtrl = function (_MetricsPanelCtrl) {
        _inherits(SparkTextCtrl, _MetricsPanelCtrl);

        function SparkTextCtrl($scope, $injector, $rootScope) {
          _classCallCheck(this, SparkTextCtrl);

          var _this = _possibleConstructorReturn(this, (SparkTextCtrl.__proto__ || Object.getPrototypeOf(SparkTextCtrl)).call(this, $scope, $injector));

          _this.$rootScope = $rootScope;
          var content = '<div class="sparktext-panel">' + '<h3>Stats A</h3>' + '<b>Min:&nbsp;</b><span class="series">#A.min</span>' + '&nbsp;<b>Max:&nbsp;</b><span class="series">#A.max</span>' + '&nbsp;<b>Avg:&nbsp;</b><span class="series">#A.avg</span>' + '<span class="spark-bar-medium series">' + '<span class="orange-red-text">#A.min{#A.data}#A.max</span>' + '</span>' + '<h3>Usage</h3>' + '<span class="spark-bar-medium series"><span class="green-text">{#A.data}</span></span>&nbsp;' + '<span class="spark-bar-narrow series"><span class="orange-red-text">{#A.data}</span></span>&nbsp;' + '<span class="spark-bar-thin series"><span class="purple-text">{#A.data}</span></span>&nbsp;' + '<span class="spark-dot-line-medium series"><span class="grey-text-1">{#A.data}</span></span>&nbsp;' + '<span class="spark-dot-medium series"><span class="blue-text">{#A.data}</span></span>&nbsp;' + '<span class="spark-dot-small series"><span style="color:#A.color">{#A.data}</span></span>&nbsp;' + '<p>Plugin works with html.</p>' + '<p><i>Syntax:</i></p> ' + '<div style="' + '    padding: 4px;' + '    background-color: gainsboro;' + '    color: black;' + '    margin-bottom: 10px;' + '  ">' + '&lt;b&gt;Min: &lt;/b&gt;&lt;span class=&quot;series&quot;&gt;#A.min&lt;/span&gt;<br/>' + '</div>' + 'Where <b>class="series"</b> defines an element with data replacemnets and <b>#A.max</b> will be replaced by the metric <i>max</i>' + 'from series <i>A</i>.<br>' + '<i>#A.data</i> becomes all values in csv format scaled to 0 - 100. ex: <i>{#A.data}</i> results in <i>{10,23,45,67}</i>' + 'If you need raw data use <i>datapoints</i> instead.' + '</div>';
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

          _.defaults(_this.panel, panelDefaults);
          _.defaults(_this.panel.legend, panelDefaults.legend);

          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceivedSnapshot.bind(_this));
          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          return _this;
        }

        _createClass(SparkTextCtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Template', 'public/plugins/grafana-spark-font-panel/editor.html', 2);
            this.unitFormats = kbn.getUnitFormats();
          }
        }, {
          key: 'setUnitFormat',
          value: function setUnitFormat(subItem) {
            this.panel.format = subItem.value;
            this.render();
          }
        }, {
          key: 'onDataError',
          value: function onDataError() {
            this.series = [];
            this.render();
          }
        }, {
          key: 'changeSeriesColor',
          value: function changeSeriesColor(series, color) {
            series.color = color;
            this.panel.aliasColors[series.alias] = series.color;
            this.render();
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            this.data = this.parseSeries(this.series);
          }
        }, {
          key: 'parseSeries',
          value: function parseSeries(series) {
            var _this2 = this;

            return _.map(this.series, function (serie, i) {
              var pv = 100 / serie.stats.max;
              return _.merge({
                id: serie.alias.split("-")[0],
                label: serie.alias,
                datapoints: serie.datapoints,
                // Scale to 0 - 100 as seems not been working with decimals
                data: serie.datapoints.map(function (p) {
                  return p[0];
                }).map(function (p) {
                  return parseInt(p * pv);
                }).join(","),
                color: _this2.panel.aliasColors[serie.alias] || _this2.$rootScope.colors[i]
              }, serie.stats);
            });
          }
        }, {
          key: 'onDataReceivedSnapshot',
          value: function onDataReceivedSnapshot(dataList) {}
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            this.series = dataList.map(this.seriesHandler.bind(this));
            this.data = this.parseSeries(this.series);
            this.render(this.data);
          }
        }, {
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {
            var series = new TimeSeries({
              datapoints: seriesData.datapoints,
              alias: seriesData.target
            });

            series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
            return series;
          }
        }, {
          key: 'getDecimalsForValue',
          value: function getDecimalsForValue(value) {
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
            if (Math.floor(value) === value) {
              dec = 0;
            }

            var result = {};
            result.decimals = Math.max(0, dec);
            result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

            return result;
          }
        }, {
          key: 'formatValue',
          value: function formatValue(value) {
            var decimalInfo = this.getDecimalsForValue(value);
            var formatFunc = kbn.valueFormats[this.panel.format];
            if (formatFunc) {
              return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
            }
            return value;
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            rendering(scope, elem, attrs, ctrl);
          }
        }]);

        return SparkTextCtrl;
      }(MetricsPanelCtrl));

      _export('SparkTextCtrl', SparkTextCtrl);

      SparkTextCtrl.templateUrl = 'module.html';
    }
  };
});
