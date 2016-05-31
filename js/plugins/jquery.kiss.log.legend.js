(function($) {
  var PLUGIN_NAME = 'kiss.log.legend', pluginData = function(obj) {
    return obj.data(PLUGIN_NAME);
  };

  var privateMethods = {
    build : function(self) {
      self.html("&nbsp;")
    }
  };

  var publicMethods = {
    init : function(options) {
      return this
        .each(function() {
          var self = $(this), data = pluginData(self);
          if (!data) {
            self.data(PLUGIN_NAME, $.extend(true, {}, options));
            data = pluginData(self);
          }
          privateMethods.build(self);

          $('input[type=checkbox]').on('change', function(event){
            console.log(event);
          });

          $(document)
            .on(
                "kiss:update_legend",
                function(event, charts, cursor,
                  startFrame, scale, frames) {
                  console.log(charts, cursor,
                      startFrame, scale, frames);

                  var frame = frames[Math
                    .floor(startFrame
                        + (cursor * scale))];
                  var label = '<br>';

                  if (frame !== undefined) {
                    self.html("");
                    
                    for (var i = 0; i<charts.length; i++) {
                      var chart = charts[i];
                      var graphs = Object.keys(chart);
                      for (var f = 0; f<graphs.length; f++) {
                        var field = graphs[f];
                        var v = field.split('.');
                        var checkboxId = field + ':' + String(i);
                        var checkbox, label = publicMethods.buildLegendItem(chart[field], frame[v[0]][v[1]], checkboxId);
                        self.append(checkbox);
                        self.append(label);
                        self.append(document.createElement('br'));
                      }
                      self.append(document.createElement('br'));
                    }
                  }
                });
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
      var checkbox = document.createElement('input');
      checkbox.type = "checkbox";
      checkbox.name = field.name;
      checkbox.value = 1;
      checkbox.checked = field.visible;
      checkbox.id = checkboxId;
      checkbox.addEventListener("click", publicMethods.checkboxChanged)

      var label = document.createElement('label');
      label.htmlFor = checkboxId;
      label.style.color = field.color;
      label.appendChild(document.createTextNode(field.name + ':' + frame));
      
      return [checkbox, label]
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
