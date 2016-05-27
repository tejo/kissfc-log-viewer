(function($) {
	var PLUGIN_NAME = 'kiss.log.legend', pluginData = function(obj) {
		return obj.data(PLUGIN_NAME);
	};

	var privateMethods = {
		build : function(self) {
			var data = pluginData(self);
			var id = self.attr("id");
      self.html("&nbsp;")
		}
	};

	var publicMethods = {
		init : function(options) {
			return this.each(function() {
				var self = $(this), data = pluginData(self);
				if (!data) {
					self.data(PLUGIN_NAME, $.extend(true, {
					}, options));
					data = pluginData(self);
				}
				privateMethods.build(self);

        $(document).on("kiss:update_legend", function(event, fields, cursor, startFrame, scale, frames) {
          console.log(fields, cursor, startFrame, scale, frames);

          var label = '<br>';
          for (var i = 0; i < fields['RXcommands'].name.length; i++ ) {
            label = label + fields['RXcommands'].name[i] + " :" +frames[Math.floor(startFrame + (cursor * scale))].RXcommands[i] + "<br>";
          }

          label = label+'<br>';

          for (var i = 0; i < fields['PWMOutVals'].name.length; i++ ) {
            label = label + fields['PWMOutVals'].name[i] + " :" +frames[Math.floor(startFrame + (cursor * scale))].PWMOutVals[i] + "<br>";
          }

          label = label+'<br>';

          for (var i = 0; i < fields['GyroRaw'].name.length; i++ ) {
            label = label + fields['GyroRaw'].name[i] + " :" +frames[Math.floor(startFrame + (cursor * scale))].GyroRaw[i] + "<br>";
          }
          self.html(label);
        });
      });

		},
		destroy : function() {
			return this.each(function() {
				$(this).removeData(PLUGIN_NAME);
			});
		},
	};

	$.fn.kissLogLegend = function(method) {
		if (publicMethods[method]) {
			return publicMethods[method].apply(this, Array.prototype.slice
					.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return publicMethods.init.apply(this, arguments);
		} else {
			$.error('Method [' + method + '] not available in $.kissLogDetail');
		}
	};
})(jQuery);
