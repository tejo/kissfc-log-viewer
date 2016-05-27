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

			var b = $('<div>').attr('id', id + "_bookmark")
        .css({height:height, width:"1px", position: "absolute", backgroundColor: "rgba(188, 188, 188, 0.5)"}).hide();
			b.appendTo(self);

      data.bookmark = $("#" + id + "_bookmark") 
			data.canvas = document.getElementById(id + "_canvas");
			data.context = data.canvas.getContext('2d');
		},

    drawBookmark: function(self, cursor){
      var scale = $("#log").data()['kiss.log.viewer'].scale 
			var data = pluginData(self);
      var xfactor = data.totalFrames.length / self.width();
      var w = (self.width() * scale) / xfactor
      data.bookmark.css({left:(cursor - w/2) + "px", top: 0, width:w + "px"}).show()
    }
    
	};

	var publicMethods = {
		init : function(options) {
			return this.each(function() {
				var self = $(this), data = pluginData(self);
				if (!data) {
					self.data(PLUGIN_NAME, $.extend(true, {
						frames : [],
						canvas: null,
            bookmark: null,
						context: null,
					}, options));
					data = pluginData(self);
				}
				
				privateMethods.build(self);
				
				self.on("click", function(event) {
					if (data.frames.length > event.offsetX ) {
            data.currentCursor =  event.offsetX
            privateMethods.drawBookmark(self, event.offsetX);
						$(document).trigger("kiss:seek_to_frame", [ data.frames[event.offsetX].frame ]);
					}
				});

        $(window).on('resize', function(event){
          var pager = $('#' + self.attr("id") + "_canvas")
          pager[0].width = window.innerWidth;
          pager[0].height = window.innerHeight;
          var data = pluginData(self);
          if (data.frames.length == 0) return
          publicMethods.setFrames(self, data.totalFrames)
					publicMethods.refresh(self);
        });
				
				$(document).on("kiss:set_frames", function(event, frames) {
          data.totalFrames = frames;
          publicMethods.setFrames(self, frames)
					publicMethods.refresh(self);
				});

        //handle arrow keys
        $(document).keydown(function(e) {
          if (data.frames.length == 0) return

            var scale = $("#log").data()['kiss.log.viewer'].scale 

          if(typeof(data.currentCursor) == "undefined"){
            var xfactor = data.totalFrames.length / self.width();
            data.currentCursor = Math.floor(((self.width() * scale) / xfactor)/2)
          }
            switch(e.which) {
              case 37: // left
                data.currentCursor = data.currentCursor - (10*scale)
                  $(document).trigger("kiss:seek_to_frame", [ data.frames[data.currentCursor].frame ]);
                privateMethods.drawBookmark(self, data.currentCursor);
                console.log('left');
                break;
              case 39: // right
                data.currentCursor = data.currentCursor + (10*scale)
                  $(document).trigger("kiss:seek_to_frame", [ data.frames[data.currentCursor].frame ]);
                privateMethods.drawBookmark(self, data.currentCursor);
                console.log('right');
                break;
              default: return; 
            }
          e.preventDefault(); // prevent the default action (scroll / move caret)
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

      var scale = $("#log").data()['kiss.log.viewer'].scale 
      var xfactor = data.totalFrames.length / self.width();
      data.currentCursor = Math.floor(((self.width() * scale) / xfactor)/2)
      privateMethods.drawBookmark(self, data.currentCursor);
		},
    setFrames: function(self, frames){
      var data = pluginData(self);
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
