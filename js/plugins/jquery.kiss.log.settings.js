(function($) {
  var PLUGIN_NAME = 'kiss.log.settings', pluginData = function(obj) {
    return obj.data(PLUGIN_NAME);
  };

  var SETTINGS = [
  {
    name:'Sticks',
    fields:[ 
      'RXcommands.0',
      'RXcommands.1',
      'RXcommands.2',
      'RXcommands.3',
      'RXcommands.4', 
      'RXcommands.5',
      'RXcommands.6',
      'RXcommands.7'
    ],
  }, 
  {
    name:'Motors',
    fields:[ 
      'PWMOutVals.0',
      'PWMOutVals.1',
      'PWMOutVals.2',
      'PWMOutVals.3',
      'PWMOutVals.4',
      'PWMOutVals.5'
    ],
  }, 
  {
    name:'Gyros',
    fields:[ 
      'GyroXYZ.0',
      'GyroXYZ.1',
      'GyroXYZ.2'
    ],
  }
  ];

  var privateMethods = {
    build : function(self) {
			var data = pluginData(self);
      data.panel = $("#settings_panel");
      data.chart_tpl = $('#chart_tpl').html();
      data.field_tpl = privateMethods.templateAssing($('#field_tpl').html(), 'options', privateMethods.buildSelectOptions());

      $('#settings_close_button').on('click', function(){
        data.panel.hide();
      })

      $('#settings_save').on('click', function(){
        data.panel.hide();
        privateMethods.saveSettings(self);
      })

      $('#settings_add_chart').on('click', function(){
        privateMethods.addChart(self);
      })

      privateMethods.loadSettings(self);
      privateMethods.bindEvents(self);
    },


    addChart: function(self){
			var data = pluginData(self);
      data.panel.append(privateMethods.templateAssing(data.chart_tpl, 'chart_name', 'chart'+($('.chart_name').size()+1)));
      privateMethods.bindEvents(self);
    },

    addField: function(self, chartFields){
			var data = pluginData(self);
      var field = privateMethods.templateAssing(data.field_tpl, 'selected', 'select one')
      chartFields.append(field);
    },

    loadSettings: function(self){
			var data = pluginData(self);
      for(var i in SETTINGS) {
        var chart = $(privateMethods.templateAssing(data.chart_tpl, 'chart_name', SETTINGS[i].name));
        for(var f in SETTINGS[i].fields){
          var field = privateMethods.templateAssing(data.field_tpl, 'selected', SETTINGS[i].fields[f])
          chart.find('.fields').append(field);
        }
        data.panel.append(chart);
      } 
    },
    templateAssing: function(tpl, propName, propValue){
      return tpl.replace( "{{"+propName+"}}", propValue);
    },

    bindEvents: function(self){
      $('.delete_chart').on('click', function(){
        $(this).parent().remove();
      });
      $('.delete_field').on('click', function(){
        $(this).parent().remove();
      });
      $('.add_field').on('click', function(){
        privateMethods.addField(self,$(this).first().prev());
      });
    },

    buildSelectOptions: function() {
      return SELECT_OPTIONS.map(function(value){
        if(value == '-'){
          return '<option disabled>_________ </option>'
        }else{
          return '<option>'+value+'</option>'
        }
      });
    },

    saveSettings: function(self){
      SETTINGS = []
      $('.chart').each(function(){
        var chart = $(this), chartSettings = {fields:[]};
        chartSettings.name = chart.find('.chart_name').val(); 
        chart.find('.fields').find('select option:selected').each(function(){
          chartSettings.fields.push($(this).text()); 
        });
        SETTINGS.push(chartSettings)
      });
      $(document).trigger("kiss:apply_settings", [SETTINGS]);
    }
  };

  var publicMethods = {
    init : function(options) {
      return this.each(function() {
          var self = $(this), data = pluginData(self);
          if (!data) {
            self.data(PLUGIN_NAME, $.extend(true, {}, options));
            data = pluginData(self);
          }
          privateMethods.build(self);

          self.on('click', function(){
            data.panel.show();
          });
        });

    },
    destroy : function() {
      return this.each(function() {
        $(this).removeData(PLUGIN_NAME);
      });
    }
  };

  var SELECT_OPTIONS = [
      '-',
      'RXcommands.0',
      'RXcommands.1',
      'RXcommands.2',
      'RXcommands.3',
      'RXcommands.4', 
      'RXcommands.5',
      'RXcommands.6',
      'RXcommands.7',
      '-',
      'PWMOutVals.0',
      'PWMOutVals.1',
      'PWMOutVals.2',
      'PWMOutVals.3',
      'PWMOutVals.4',
      'PWMOutVals.5',
      '-',
      'GyroXYZ.0',
      'GyroXYZ.1',
      'GyroXYZ.2',
      '-',
			'mode',
			'debug',
			'debug2',
			'idleTime',
			'Armed',
			'LiPoVolt', 
			'I2C_Errors', 
			'calibGyroDone',
			'failsave',
			'debug',
			'foundRX', 
      '-',
			'ACCXYZ.0',
			'ACCXYZ.1',
			'ACCXYZ.2',
      '-',
			'angle.0',
			'angle.1',
			'angle.2',
      '-',
			'GyroRaw.0',
			'GyroRaw.1',
			'GyroRaw.2',
      '-',
			'ACCRaw.0',
			'ACCRaw.1', 
			'ACCRaw.2',
      '-',
			'ACCtrim.0', 
			'ACCtrim.1', 
      '-',
			'ACCAng.0', 
			'ACCAng.1', 
      '-',
			'ESC_Telemetrie0.0',  
			'ESC_Telemetrie0.1',  
			'ESC_Telemetrie0.2',  
			'ESC_Telemetrie0.3',  
			'ESC_Telemetrie0.4',  
      '-',
			'ESC_Telemetrie1.0',  
			'ESC_Telemetrie1.1',  
			'ESC_Telemetrie1.2',  
			'ESC_Telemetrie1.3',  
			'ESC_Telemetrie1.4',  
      '-',
			'ESC_Telemetrie2.0',  
			'ESC_Telemetrie2.1',  
			'ESC_Telemetrie2.2',  
			'ESC_Telemetrie2.3',  
			'ESC_Telemetrie2.4',  
      '-',
			'ESC_Telemetrie3.0',  
			'ESC_Telemetrie3.1',  
			'ESC_Telemetrie3.2',  
			'ESC_Telemetrie3.3',  
			'ESC_Telemetrie3.4',  
      '-',
			'ESC_Telemetrie4.0',  
			'ESC_Telemetrie4.1',  
			'ESC_Telemetrie4.2',  
			'ESC_Telemetrie4.3',  
			'ESC_Telemetrie4.4',  
      '-',
			'ESC_Telemetrie5.0',  
			'ESC_Telemetrie5.1',  
			'ESC_Telemetrie5.2',  
			'ESC_Telemetrie5.3',  
			'ESC_Telemetrie5.4',  
      '-',
			'ESC_TelemetrieStats.0', 
			'ESC_TelemetrieStats.1', 
			'ESC_TelemetrieStats.2', 
			'ESC_TelemetrieStats.3', 
			'ESC_TelemetrieStats.4', 
			'ESC_TelemetrieStats.5' 
    ];

  $.fn.kissLogSettings = function(method) {
    if (publicMethods[method]) {
      return publicMethods[method].apply(this, Array.prototype.slice
          .call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return publicMethods.init.apply(this, arguments);
    } else {
      $.error('Method [' + method + '] not available in $.kissLogSettings');
    }
  };
})(jQuery);
