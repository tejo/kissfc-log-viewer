(function($) {
	var PLUGIN_NAME = 'kiss.log.viewer', pluginData = function(obj) {
		return obj.data(PLUGIN_NAME);
	};

  var FREQUENCY = 0.02

  var BOUNDARIES = {
    'defaults' : {min : 1000, max  : 2000},
    'RXcommands' : {min : 1000, max  : 2000},
    'PWMOutVals' : {min : 1000, max  : 2000},
    'GyroXYZ'    : {min : -2000, max : 2000}
  }
  var COLORS = [
    "rgb(255, 255, 0)",
    "rgb(0, 0, 255)",
    "rgb(255,102,51)",
    "rgb(0, 255, 0)",
    "rgb(204,255,51)",
    "rgb(128, 40, 255)",
    "rgb(102,255,51)",
    "rgb(128, 0, 255)",
    "rgb(51,204,255)",
    "rgb(46,184,0)",
    "rgb(40, 30, 255)",
    "rgb(204,51,255)",
    "rgb(255, 0, 0)",
    "rgb(255, 128, 0)",
    "rgb(255, 255, 0)",
    "rgb(255, 0, 0)",
    "rgb(255, 128, 0)"
  ];

  var colorIndex = 0;

  var CHARTS = {
    'Sticks': {
      'RXcommands.0' : {name:'Throttle' ,visible: true,  color: COLORS[colorIndex++]},
      'RXcommands.1' : {name:'Roll'     ,visible: true,  color: COLORS[colorIndex++]},
      'RXcommands.2' : {name:'Pitch'    ,visible: true,  color: COLORS[colorIndex++]},
      'RXcommands.3' : {name:'Yaw'      ,visible: true,  color: COLORS[colorIndex++]},
      'RXcommands.4' : {name:'Aux1'     ,visible: false, color: COLORS[colorIndex++]},
      'RXcommands.5' : {name:'Aux2'     ,visible: false, color: COLORS[colorIndex++]},
      'RXcommands.6' : {name:'Aux3'     ,visible: false, color: COLORS[colorIndex++]},
      'RXcommands.7' : {name:'Aux4'     ,visible: false, color: COLORS[colorIndex++]}
    },
    'Motors':{
      'PWMOutVals.0':{name:'Motor 1', visible: true,  color: COLORS[colorIndex++]},
      'PWMOutVals.1':{name:'Motor 2', visible: true,  color: COLORS[colorIndex++]},
      'PWMOutVals.2':{name:'Motor 3', visible: true,  color: COLORS[colorIndex++]},
      'PWMOutVals.3':{name:'Motor 4', visible: true,  color: COLORS[colorIndex++]},
      'PWMOutVals.4':{name:'Motor 5', visible: false, color: COLORS[colorIndex++]},
      'PWMOutVals.5':{name:'Motor 6', visible: false, color: COLORS[colorIndex++]}
    },
    'Gyros':{
      'GyroXYZ.0':{name:'Gyro Roll', visible: true,   color: COLORS[colorIndex++]},
      'GyroXYZ.1':{name:'Gyro Pitch',  visible: true, color: COLORS[colorIndex++]},
      'GyroXYZ.2':{name:'Gyro Yaw',   visible: true,  color: COLORS[colorIndex++]}
    }
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

			var b = $('<div>').attr('id', id + "_visual_cursor")
        .css({height:height, width:"1px", 
              pointerEvents:'none',
              position: "absolute", 
              backgroundColor: "rgba(255, 255, 255, 1)"}).hide();
			b.appendTo(self);


      data.visual_cursor = $("#" + id + "_visual_cursor") 
			data.canvas = document.getElementById(id + "_canvas");
			data.context = data.canvas.getContext('2d');
		},
		seekToFrame : function(self, frame) {
			console.log("Seeking to frame: " + frame);
			var data = pluginData(self);
			data.currentFrame = frame;
			privateMethods.refresh(self);
		},
		dataDetails : function(self, cursor) {
      var data = pluginData(self);
      if (data.frames.length == 0) return

      data.visual_cursor.css({left:cursor + "px", top: 0}).show();
      $(document).trigger("kiss:update_legend", [ CHARTS, cursor, data.startFrame, data.scale, data.frames ]);
		},
    handleZoom : function(self, event) {
      var data = pluginData(self);
      if (data.frames.length == 0) return
        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
          if (data.scale < 1) data.scale = data.scale + 0.1
        }
        else {
          if (data.scale > 0.2) data.scale = data.scale - 0.1
        }
      privateMethods.refresh(self);
    },
		drawChart: function(self, field, index, x1, y1, x2, y2, color, startFrame) {
			var data = pluginData(self);
			var context = data.context;
			
			context.strokeStyle = color;
			var frame = startFrame, x = x1;
			context.beginPath();
			while (x < x2 && Math.floor(frame) < data.frames.length) {

				var boundaries = {};
				if (typeof(BOUNDARIES[field]) == 'undefined'){
					boundaries = BOUNDARIES['defaults'];
				} else {
					boundaries = BOUNDARIES[field];
				}

				var value=0;
				var c1 = (boundaries.max+boundaries.min)/2;
				var c2 = (boundaries.max-boundaries.min)/2;
				var c3 = (y2-y1)/2;
				if (index!=-1) {
					value =  (data.frames[Math.floor(frame)][field][index] - c1) / c2;
				} else {
					value =  (data.frames[Math.floor(frame)][field] - c1) / c2;
				}
				if (x == x1) {
					context.moveTo(x, y1+c3-value*c3*0.9);
				} else {
					context.lineTo(x, y1+c3-value*c3*0.9);
				}
				
				if (data.scale < 1) {
					x+=1/data.scale;
					frame++;
				} else {
					x++;
					frame += data.scale;
				}
			}
			context.stroke();
		},
    drawTimeline: function(self, startFrame, scale){
      var data = pluginData(self);
      var framesVisible = self.width() * scale;
      // var totalDuration = data.frames.length * FREQUENCY;
      var startTime = Math.floor(startFrame * FREQUENCY);
      var secondsVisible = framesVisible*FREQUENCY;
      var context = data.context;
      context.font = '10px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = "rgb(250, 255, 255)";
      for(var i = 0; i < Math.round(secondsVisible); i++){
         var x = i*Math.round(self.width()/secondsVisible);
         context.fillRect(x, self.height()-4, 1, 4);
         context.fillText(privateMethods.prettyTime(startTime + i), x, self.height()-8)
      }
    },
    prettyTime: function(seconds){
      function pad(string,pad,length) {
        return (new Array(length+1).join(pad)+string).slice(-length);
      }
      var mins = Math.floor(seconds / 60);
      return pad(mins,'0',1)+':'+pad(seconds - mins * 60,'0',2); 
    },
		refresh : function(self) {
			var data = pluginData(self);
			// here we will render the graph. Current frame in the middle.
			var width = self.width(), height=self.height(), framesVisible = width * data.scale, startFrame = data.currentFrame
					- framesVisible / 2;
			if (startFrame < 0) startFrame = 0;
			console.log("Center: " + data.currentFrame);
			console.log("Start: " + startFrame);
			console.log("Visible: " + framesVisible);


			var context = data.context;
			context.fillStyle = "rgb(0, 0, 0)";
			context.fillRect(0, 0, self.width(), self.height());
      var chartNames = Object.keys(CHARTS);
			var chartHeight = height / chartNames.length; // one chart
			var k=0;
			
      for (var i = 0; i<chartNames.length; i++) {
        var chart = CHARTS[chartNames[i]];
        console.log("Drawing chart " + i);
        var graphs = Object.keys(chart);
        for (var f = 0; f<graphs.length; f++) {
          var field = graphs[f];
          console.log("Indexed property " + field);
          var v = field.split('.');
          if(chart[field].visible){
            privateMethods.drawChart(self, v[0], +v[1], 0, i*chartHeight, width, (i+1)*chartHeight, chart[field].color, startFrame);
          }
          if (k>7) k=0;
        }
      }

      privateMethods.drawTimeline(self, startFrame, data.scale);

      data.startFrame = startFrame;
		},
		decodeFrame : function(i, data) {
			var obj = {};
			obj.RXcommands = [];
			obj.GyroXYZ = [];
			obj.ACCXYZ = [];
			obj.angle = [];
			obj.GyroRaw = [];
			obj.ACCRaw = [];
			obj.ACCtrim = [];
			obj.ACCAng = [];
			obj.PWMOutVals = [];
			obj.ESC_Telemetrie0 = [];
			obj.ESC_Telemetrie1 = [];
			obj.ESC_Telemetrie2 = [];
			obj.ESC_Telemetrie3 = [];
			obj.ESC_Telemetrie4 = [];
			obj.ESC_Telemetrie5 = [];
			obj.ESC_TelemetrieStats = [];

			obj.RXcommands[0] = 1000 + ((data.getInt16(i + 0, 0) / 1000) * 1000);
			obj.RXcommands[1] = 1500 + ((data.getInt16(i + 2, 0) / 1000) * 500);
			obj.RXcommands[2] = 1500 + ((data.getInt16(i + 4, 0) / 1000) * 500);
			obj.RXcommands[3] = 1500 + ((data.getInt16(i + 6, 0) / 1000) * 500);
			obj.RXcommands[4] = 1500 + ((data.getInt16(i + 8, 0) / 1000) * 500);
			obj.RXcommands[5] = 1500 + ((data.getInt16(i + 10, 0) / 1000) * 500);
			obj.RXcommands[6] = 1500 + ((data.getInt16(i + 12, 0) / 1000) * 500);
			obj.RXcommands[7] = 1500 + ((data.getInt16(i + 14, 0) / 1000) * 500);
			obj.Armed = data.getUint8(i + 16);
			obj.LiPoVolt = data.getInt16(i + 17, 0) / 1000;
			obj.GyroXYZ[0] = data.getInt16(i + 19, 0);
			obj.GyroXYZ[1] = data.getInt16(i + 21, 0);
			obj.GyroXYZ[2] = data.getInt16(i + 23, 0);
			obj.ACCXYZ[0] = data.getInt16(i + 25, 0);
			obj.ACCXYZ[1] = data.getInt16(i + 27, 0);
			obj.ACCXYZ[2] = data.getInt16(i + 29, 0);
			obj.angle[0] = data.getInt16(i + 31, 0) / 1000;
			obj.angle[1] = data.getInt16(i + 33, 0) / 1000;
			obj.angle[2] = data.getInt16(i + 35, 0) / 1000;
			obj.I2C_Errors = data.getInt16(i + 37, 0);
			obj.calibGyroDone = data.getInt16(i + 39, 0);
			obj.failsave = data.getUint8(i + 41);
			obj.debug = data.getUint16(i + 42, 0) / 1000;
			obj.foundRX = data.getUint8(i + 44);

			obj.GyroRaw[0] = data.getInt16(i + 45, 0) / 1000;
			obj.GyroRaw[1] = data.getInt16(i + 47, 0) / 1000;
			obj.GyroRaw[2] = data.getInt16(i + 49, 0) / 1000;
			obj.ACCRaw[0] = data.getInt16(i + 51, 0) / 1000;
			obj.ACCRaw[1] = data.getInt16(i + 53, 0) / 1000;
			obj.ACCRaw[2] = data.getInt16(i + 55, 0) / 1000;
			obj.ACCtrim[0] = data.getInt16(i + 57, 0) / 1000;
			obj.ACCtrim[1] = data.getInt16(i + 59, 0) / 1000;
			obj.ACCAng[0] = data.getInt16(i + 61, 0) / 1000;
			obj.ACCAng[1] = data.getInt16(i + 63, 0) / 1000;
			obj.mode = data.getUint8(i + 65);
			obj.debug = data.getUint16(i + 66, 0) / 1000;
			obj.PWMOutVals[0] = data.getInt16(i + 68, 0);
			obj.PWMOutVals[1] = data.getInt16(i + 70, 0);
			obj.PWMOutVals[2] = data.getInt16(i + 72, 0);
			obj.PWMOutVals[3] = data.getInt16(i + 74, 0);
			obj.PWMOutVals[4] = data.getInt16(i + 76, 0);
			obj.PWMOutVals[5] = data.getInt16(i + 78, 0);
			obj.debug2 = data.getUint16(i + 80, 0) / 1000;
			obj.idleTime = data.getUint8(i + 82);

			obj.ESC_Telemetrie0[0] = data.getInt16(i + 83, 0);
			obj.ESC_Telemetrie0[1] = data.getInt16(i + 85, 0);
			obj.ESC_Telemetrie0[2] = data.getInt16(i + 87, 0);
			obj.ESC_Telemetrie0[3] = data.getInt16(i + 89, 0);
			obj.ESC_Telemetrie0[4] = data.getInt16(i + 91, 0);

			obj.ESC_Telemetrie1[0] = data.getInt16(i + 93, 0);
			obj.ESC_Telemetrie1[1] = data.getInt16(i + 95, 0);
			obj.ESC_Telemetrie1[2] = data.getInt16(i + 97, 0);
			obj.ESC_Telemetrie1[3] = data.getInt16(i + 99, 0);
			obj.ESC_Telemetrie1[4] = data.getInt16(i + 101, 0);

			obj.ESC_Telemetrie2[0] = data.getInt16(i + 103, 0);
			obj.ESC_Telemetrie2[1] = data.getInt16(i + 105, 0);
			obj.ESC_Telemetrie2[2] = data.getInt16(i + 107, 0);
			obj.ESC_Telemetrie2[3] = data.getInt16(i + 109, 0);
			obj.ESC_Telemetrie2[4] = data.getInt16(i + 111, 0);

			obj.ESC_Telemetrie3[0] = data.getInt16(i + 113, 0);
			obj.ESC_Telemetrie3[1] = data.getInt16(i + 115, 0);
			obj.ESC_Telemetrie3[2] = data.getInt16(i + 117, 0);
			obj.ESC_Telemetrie3[3] = data.getInt16(i + 119, 0);
			obj.ESC_Telemetrie3[4] = data.getInt16(i + 121, 0);

			obj.ESC_Telemetrie4[0] = data.getInt16(i + 123, 0);
			obj.ESC_Telemetrie4[1] = data.getInt16(i + 125, 0);
			obj.ESC_Telemetrie4[2] = data.getInt16(i + 127, 0);
			obj.ESC_Telemetrie4[3] = data.getInt16(i + 129, 0);
			obj.ESC_Telemetrie4[4] = data.getInt16(i + 131, 0);

			obj.ESC_Telemetrie5[0] = data.getInt16(i + 133, 0);
			obj.ESC_Telemetrie5[1] = data.getInt16(i + 135, 0);
			obj.ESC_Telemetrie5[2] = data.getInt16(i + 137, 0);
			obj.ESC_Telemetrie5[3] = data.getInt16(i + 139, 0);
			obj.ESC_Telemetrie5[4] = data.getInt16(i + 141, 0);

			obj.ESC_TelemetrieStats[0] = data.getInt16(i + 142, 0);
			obj.ESC_TelemetrieStats[1] = data.getInt16(i + 144, 0);
			obj.ESC_TelemetrieStats[2] = data.getInt16(i + 146, 0);
			obj.ESC_TelemetrieStats[3] = data.getInt16(i + 148, 0);
			obj.ESC_TelemetrieStats[4] = data.getInt16(i + 150, 0);
			obj.ESC_TelemetrieStats[5] = data.getInt16(i + 152, 0);
			return obj;
		},
    toggleValues: function(self, checkbox){
      var field = checkbox.target.id.split(':')[0];
      var index = checkbox.target.id.split(':')[1];
      CHARTS[index][field].visible = checkbox.target.checked;
      privateMethods.refresh(self);
    },

    applySettings: function(self, settings, friendlyNames){
      CHARTS = {};
      var colorIndex = 0;
      for(var i in settings){
        CHARTS[settings[i].name] = {}
        for(var f in settings[i].fields){
          var fieldName = settings[i].fields[f];
          //search for a pretty name
          var friendlyFieldname = typeof(friendlyNames[fieldName]) == 'undefined' ? fieldName : friendlyNames[fieldName];
          CHARTS[settings[i].name][fieldName] = {name:friendlyFieldname, visible: true,  color: COLORS[colorIndex]}
          colorIndex = colorIndex > COLORS.length ? 0 : colorIndex + 1;
        }
      }
      privateMethods.refresh(self);
    }
	};

	var publicMethods = {
		init : function(options) {
			return this.each(function() {
				var self = $(this), data = pluginData(self);
				if (!data) {
					self.data(PLUGIN_NAME, $.extend(true, {
						data : undefined,
						currentFrame : 0,
						scale : 0.5,
						frames : [],
						canvas : null,
						visual_cursor : null,
						context : null
					}, options));
					data = pluginData(self);
				}
				privateMethods.build(self);
        
				self.on("mousemove", function(event) {
					privateMethods.dataDetails(self, event.offsetX);
				});

        self.on("mouseout", function() {
          data.visual_cursor.hide()
        });

        $(self).bind('mousewheel DOMMouseScroll', function(event){
          privateMethods.handleZoom(self, event)
        });

        $(window).on('resize', function(){
          var viewer = $('#' + self.attr("id") + "_canvas")
          viewer[0].width = window.innerWidth;
          viewer[0].height = window.innerHeight;
          var data = pluginData(self);
          if (data.frames.length == 0) return
          privateMethods.refresh(self);
        });

				$(document).on("kiss:seek_to_frame", function(event, frame) {
					console.log("Seeking to frame: " + frame);
					privateMethods.seekToFrame(self, frame);
				});

				$(document).on("kiss:toggle_values", function(event, checkbox) {
          privateMethods.toggleValues(self, checkbox);
				});

				$(document).on("kiss:apply_settings", function(event, settings, friendlyNames) {
          privateMethods.applySettings(self, settings, friendlyNames);
				});
			});
		},
		destroy : function() {
			return this.each(function() {
				$(this).removeData(PLUGIN_NAME);
			});
		},
		loadData : function(blob) {
			var self = $(this);
			var data = pluginData(self);
			var tmp = new DataView(blob, 0);
			data.frames = [];

			var i = 0;
			var f = 0;

			while (true) {
				while (i < tmp.byteLength && tmp.getInt8(i) != 5)
					i++;
				if ((i + 1) < tmp.byteLength) {
					var len = tmp.getUint8(i + 1);
					if ((i + 3 + len) < tmp.byteLength
							&& tmp.getInt8(i + 3 + len) == 5) {
						var frameData = privateMethods.decodeFrame(i + 2, tmp);
						if (data.frames.length==0) console.log(frameData);
						data.frames.push(frameData);
						i += len + 2;
						f++;
					} else {
						i++;
					}
				} else {
					break;
				}
			}
			$(document).trigger("kiss:set_frames", [ data.frames ]); // set
			privateMethods.refresh(self);
		},

	};

	$.fn.kissLogViewer = function(method) {
		if (publicMethods[method]) {
			return publicMethods[method].apply(this, Array.prototype.slice
					.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return publicMethods.init.apply(this, arguments);
		} else {
			$.error('Method [' + method + '] not available in $.kissLogViewer');
		}
	};
})(jQuery);
