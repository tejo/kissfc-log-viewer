(function($) {
  var PLUGIN_NAME = 'kiss.log.settings', pluginData = function(obj) {
    return obj.data(PLUGIN_NAME);
  };

  var SETTINGS = {
    'chart1': {}, 
    'chart2': {}, 
    'chart3': {}
  };

  var privateMethods = {
    build : function(self) {
			var data = pluginData(self);
			var id = self.attr("id");
      var panel = document.createElement('div');
      panel.id = id + "_panel";
      self.after(panel);
      data.panel = panel;

      var closeButton = document.createElement('a');
      closeButton.style.cursor = 'pointer';
      closeButton.addEventListener('click', function(){
        data.panel.style.display = 'none';  
      })
      closeButton.appendChild(document.createTextNode('x'));
      panel.appendChild(closeButton)
      privateMethods.buildForm(self);
    },

    buildForm: function(self) {
			var data = pluginData(self);
      var addChartButton = document.createElement('button');
      addChartButton.id = "add_chart"
      addChartButton.appendChild(document.createTextNode('add chart'));
      addChartButton.addEventListener('click', function(){
        privateMethods.addChart(self);
      })
      data.panel.appendChild(addChartButton);
    },

    addChart: function(self){
			var data = pluginData(self);
      console.log(data);
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

          self.on('click', function(e){
            data.panel.style.display = 'block';  
          });

          $(document).on( "kiss:update_legend", function(event, charts, cursor, startFrame, scale, frames) { });
        });

    },
    destroy : function() {
      return this.each(function() {
        $(this).removeData(PLUGIN_NAME);
      });
    },

    checkboxChanged: function(e){
      $(document).trigger("kiss:toggle_values", [e]);
    },

    buildLegendItem: function(field, frame, checkboxId){
    },
  };

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
