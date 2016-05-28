'use strict';

$(document).ready(function() {
	$('#log').kissLogViewer();
	$('#pager').kissLogPager();
	$('#legend').kissLogLegend();

	$('#openFile').on('click', function() {
		var accepts = [ {
			extensions : [ 'txt' ]
		} ];

		chrome.fileSystem.chooseEntry({
			type : 'openFile',
			accepts : accepts
		}, function(fileEntry) {
			console.log(fileEntry);
			
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError.message);
				return;
			}
		
			if (!fileEntry) {
				console.log('No file selected, load aborted.');
				return;
			}

			var chosenFileEntry = fileEntry;

			chrome.fileSystem.getDisplayPath(chosenFileEntry, function(path) {
				console.log('Loading log from: ' + path);
			});

			chosenFileEntry.file(function(file) {
				var reader = new FileReader();

				reader.onprogress = function(e) {
					if (e.total > 10000000) {
						console.log('File limit (xx KB) exceeded, aborting');
						reader.abort();
					}
				};

				reader.onloadend = function(e) {
					if (e.total != 0 && e.total == e.loaded) {
						console.log('Read OK');
						try {
							var blob = e.target.result;
							$('#log').kissLogViewer('loadData', blob);
						} catch (e) {
							console.log('Wrong file');
							console.log(e);
							return;
						}
					}
				};
				reader.readAsArrayBuffer(file);
			});
		});
	});

});
