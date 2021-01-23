var wget = require('wget-improved');
var exec = require('child_process').exec;


module.exports = function(req, res) {
	let keyGraphicFile = req.session.file;
	console.log("HERE ", keyGraphicFile)
	if(!keyGraphicFile) return;

	var whereToSave = process.env.PUBLIC_HTML_PATH + "/image/temp/workingdesign/keyGraphic.png"

	// const options = {};
	// let download = wget.download(req.query.keyGraphicUrl, whereToSave, options);
	// download.on('error', function(err) {
	//     console.log("Download keyGraphicFile error: "+err);
	// });
	// download.on('start', function(fileSize) {
	//     // console.log(fileSize);
	// });
	// download.on('end', function(output) {
	//     console.log("Download keyGraphicFile: "+output);

	var cliCommand = "convert -colorspace rgb -fill '#000000' -fuzz 100% -opaque '#7F7F7F' " + `"${keyGraphicFile}" ${whereToSave}`;
	exec(cliCommand, 
	        function (error, stdout, stderr) {
	            if(error) console.log("Convert keyGraphicFile error: "+error)
	            // This callback is invoked once the child terminates
	            // You'd want to check err/stderr as well!

				res.send("keyGraphicFile appears to be ready to send to client.")

	            if(stdout) console.log("Convert keyGraphicFile: "+stdout)
	       } 
	    );

	// });
	// download.on('progress', function(progress) {
	//     typeof progress === 'number'
	//     // code to show progress bar
	// });
};