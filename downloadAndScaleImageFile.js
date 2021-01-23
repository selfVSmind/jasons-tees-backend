var fs = require('fs');
var wget = require('wget-improved');
var exec = require('child_process').exec;

module.exports = function(blankShirtMockupDirectory, blankFileNameHashed, remoteFile, width, callbackFunction) {
    var localFile = blankShirtMockupDirectory + blankFileNameHashed
    try {
        if(fs.statSync(localFile).isFile()) {
            scale(blankShirtMockupDirectory, blankFileNameHashed, width, callbackFunction);
        }
    } catch(e) {
        console.log("We don't have it yet so we're downloading ", remoteFile)
		const options = {};
		let download = wget.download(remoteFile, localFile, options);
		download.on('error', function(err) {
		    console.log(err);
		});
		download.on('start', function(fileSize) {
		    console.log(fileSize);
		});
		download.on('end', function(output) {
		    console.log(output);
            scale(blankShirtMockupDirectory, blankFileNameHashed, width, callbackFunction);
		});
		download.on('progress', function(progress) {
		    typeof progress === 'number'
		    // code to show progress bar
		});
    }
    
};

function scale(blankShirtMockupDirectory, blankFileNameHashed, width, callbackFunction) {
    var scaledFileName = blankShirtMockupDirectory + "scaled/" + width + "x" + blankFileNameHashed
    try {
        if(fs.statSync(scaledFileName).isFile()) {
            callbackFunction
        }
    } catch(e) {
        var cliCommand = "convert -resize " + width + "x " + blankShirtMockupDirectory + blankFileNameHashed + " " + scaledFileName
        exec(cliCommand, 
            function (error, stdout, stderr) {
        	console.log(cliCommand)
                if(error) console.log("there isn't really an error with scaling the image down so.... idk.... ERROR")
                // This callback is invoked once the child terminates
                // You'd want to check err/stderr as well!
    
    			callbackFunction
    
                console.log(stdout)
           } 
        );
    }
}