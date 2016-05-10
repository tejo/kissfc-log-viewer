(function($) {
	var PLUGIN_NAME = 'kiss.log.pager', pluginData = function(obj) {
		return obj.data(PLUGIN_NAME);
	};

	var privateMethods = {
		build : function(self) {
			var data = pluginData(self);
			var id = self.attr("id");
			var width = self.width();
			var height = self.height();
			var c = $('<canvas>').attr('id', id + "_canvas").attr("width",
					width).attr("height", height);
			c.appendTo(self);
			data.canvas = document.getElementById(id + "_canvas");
			data.context = data.canvas.getContext('2d');
		},
	};

	var publicMethods = {
		init : function(options) {
			return this.each(function() {
				var self = $(this), data = pluginData(self);
				if (!data) {
					self.data(PLUGIN_NAME, $.extend(true, {
						frames : [],
						canvas: null,
						context: null,
					}, options));
					data = pluginData(self);
				}
				
				privateMethods.build(self);
				
				self.on("click", function(event) {
					if (data.frames.length > event.clientX) {
						$(document).trigger("kiss:seek_to_frame", [ data.frames[event.clientX].frame ]);
					}
				});
				
				$(document).on("kiss:set_frames", function(event, frames) {
					data.frames = [];
					var xfactor = frames.length / self.width(); // how many frames in one pixel
					for (var x = 0; x<self.width(); x++ ) {
						var frame = Math.floor(x*xfactor);
						var value = {
								frame: frame,
								value: self.height() *  ((frames[frame].RXcommands[0] - 1000) / 1000)
						}
						data.frames.push(value);
					}
					publicMethods.refresh(self);
				});
			});
		},
		destroy : function() {
			return this.each(function() {
				$(this).removeData(PLUGIN_NAME);
			});
		},
		refresh : function(self) {
			var data = pluginData(self);
			var context = data.context;
			context.fillStyle = "rgb(0, 128, 0)";
			context.fillRect(0, 0, self.width(), self.height());
			context.strokeStyle = "rgb(200, 200, 200)";
			for (var x = 0; x<data.frames.length; x++ ) {
				context.beginPath();
	            context.moveTo(x, self.height());
	            context.lineTo(x, self.height() - data.frames[x].value);
	            context.stroke();
			}
		}
	};

	$.fn.kissLogPager = function(method) {
		if (publicMethods[method]) {
			return publicMethods[method].apply(this, Array.prototype.slice
					.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return publicMethods.init.apply(this, arguments);
		} else {
			$.error('Method [' + method + '] not available in $.kissLogPasger');
		}
	};
})(jQuery);