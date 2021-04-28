const fs = require('fs');
const wget = require('wget-improved');
const exec = require('child_process').exec;
const path = require('path');

makingMagick = (localImgPath, localCutFilePath) => {
    let cliCommand = "convert -colorspace rgb -fill '#000000' -fuzz 100% -opaque '#7F7F7F' " + `"${localCutFilePath}" "${localImgPath}"`;
    exec(cliCommand, (error, stdout, stderr) => {
                            if(error) console.log("generateCutFileImage.js:makingMagick: " + error)
                            // This callback is invoked once the child terminates
                            // You'd want to check err/stderr as well!
                            if(stdout) console.log("generateCutFileImage.js:makingMagick: " + stdout)
                        });
};

module.exports = function(cutFileId, cutFileUrl) {
    // first check to see if we already have the image available
    let localImgPath = path.join(__dirname, 'public', 'image', 'cutfile', cutFileId + '.png');
    let localCutFilePath = path.join(__dirname, 'public', 'image', 'cutfile', cutFileUrl.substring(cutFileUrl.lastIndexOf('/') + 1));
    
    if(!fs.existsSync(localImgPath)) {
        // since we don't have the image available to serve, use Image Magick to creat one
		let download = wget.download(cutFileUrl, localCutFilePath, {});
		download.on('error', function(err) {
		    console.log(err);
		});
		download.on('start', function(fileSize) {
		    console.log(fileSize);
		});
		download.on('end', function(output) {
		    console.log(output);
            makingMagick(localImgPath, localCutFilePath);
		});
    };

    return 'image/cutfile/' + cutFileId + '.png';
};
