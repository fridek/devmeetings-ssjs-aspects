var logs = ["begin", "testStart", "testDone", "log", "moduleStart", "moduleDone", "done"];
for (var i = 0; i < logs.length; i++) {
	(function() {
		var log = logs[i],
			logger = QUnit[log];
		QUnit[log] = function() {
		  
		  var result = arguments;
      if (log === "testDone") {
  		  $.ajax({
          url: 'http://10.1.1.10/scores/save?nickname=' + runner + '&' + $.param(result[0]),
          dataType : "jsonp",
          type: "POST",
          success: function(data) {
      			console.log(log, result);
          }
        });
      }
			logger.apply(this, arguments);
		};
	})();
}