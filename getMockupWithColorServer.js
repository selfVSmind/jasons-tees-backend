var exec = require('child_process').exec;
var crypto = require('crypto');
var downloadFile = require('./downloadAndScaleImageFile.js');
var fs = require('fs');
const contentful = require('contentful-management');

const getExtRegex = /(?:\.([^.]+))?$/;
const scaleToWidth = 208;

const FREDS_SCRIPT_PATH = process.env.FREDS_SCRIPT_PATH;
const PUBLIC_HTML_PATH = process.env.PUBLIC_HTML_PATH;

const KEY_GRAPHIC_LOCAL_PNG = PUBLIC_HTML_PATH + "/image/temp/workingdesign/keyGraphic.png"
const OUTPUT_DIRECTORY = PUBLIC_HTML_PATH + "/image/temp/workingdesign/theMockups/"
const PUBLIC_OUTPUT_DIRECTORY = "image/temp/workingdesign/theMockups/"
const blankShirtMockupDirectory = PUBLIC_HTML_PATH + "/image/blanks/"
const VARIATIONS_DIR = PUBLIC_HTML_PATH + "/image/temp/workingdesign/variations";

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_TOKEN
})
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;

module.exports = {
    ajax: function(req, res) {
    	var blankFileName = req.query.shirtBlankFrontPicUrl.split('/').pop()
        var blankFileNameExt = getExtRegex.exec(blankFileName)[1];   
        var blankHash = crypto.createHash('md5').update(blankFileName).digest('hex');
    	var blankFileNameHashed = blankHash + "." + blankFileNameExt
    	//and finally
    	var blankFileLocal = blankShirtMockupDirectory + blankFileNameHashed
    	
    	downloadFile(blankShirtMockupDirectory, blankFileNameHashed, req.query.shirtBlankFrontPicUrl, scaleToWidth, afterDownloadAjax(req, res, blankHash, blankFileNameHashed, '70x70+70+70'))
    },

    fullSizeMockup: function(shirtBlankFrontPicUrl, hexColor, geometry, variationName) {
    	var blankFileName = shirtBlankFrontPicUrl.split('/').pop()
        var blankFileNameExt = getExtRegex.exec(blankFileName)[1];   
        var blankHash = crypto.createHash('md5').update(blankFileName).digest('hex');
    	var blankFileNameHashed = blankHash + "." + blankFileNameExt
    	//and finally
    	var blankFileLocal = blankShirtMockupDirectory + blankFileNameHashed
    	
    	return new Promise((resolve) => downloadFile(blankShirtMockupDirectory, blankFileNameHashed, shirtBlankFrontPicUrl, scaleToWidth, afterDownloadFullScale(blankHash, blankFileNameHashed, geometry, hexColor, variationName, resolve)));
    }
}

function afterDownloadFullScale(blankHash, blankFileNameHashed, geometry, hexColor, variationName, callback) {
	var publicOutputFile = PUBLIC_OUTPUT_DIRECTORY + hexColor + blankHash + ".png"
    var cliCommand = "convert -colorspace rgb -fill '#" + hexColor + "' -fuzz 100% -opaque '#7F7F7F' " + KEY_GRAPHIC_LOCAL_PNG + " " + VARIATIONS_DIR + "/"+variationName+".png"
    exec(cliCommand, 
        function (error, stdout, stderr) {
            if(error) console.log("error: getMockupWithColor::afterDownloadFullScale")
            // This callback is invoked once the child terminates
            // You'd want to check err/stderr as well!

			makeTheFullScalePicYo(publicOutputFile, blankFileNameHashed, geometry, variationName, callback);
			

            if(stdout) console.log(stdout)
       } 
    );
};

function makeTheFullScalePicYo(publicOutputFile, blankFileNameHashed, geometry, variationName, callback) {
    var cliCommand = FREDS_SCRIPT_PATH + " -r " + geometry + " " + PUBLIC_HTML_PATH + "/image/temp/workingdesign/variations/"+variationName+".png " + PUBLIC_HTML_PATH + "/image/blanks/"+blankFileNameHashed+" " + PUBLIC_HTML_PATH + "/image/temp/workingdesign/variations/"+variationName+".png"
    exec(cliCommand, 
        function (error, stdout, stderr) {
            if(error) console.log(error)
            // This callback is invoked once the child terminates
            // You'd want to check err/stderr as well!
			nowUploadTheFullScalePicYoDawg(variationName, callback);
            if(stdout) console.log(stdout)
      } 
    );
};

function nowUploadTheFullScalePicYoDawg(variationName, callback) {
    client.getSpace(SPACE_ID)
    .then((space) => space.createAssetFromFiles({
      fields: {
        file: {
          'en-US': {
             contentType: 'image/png',
             fileName: crypto.createHash('md5').update(new Date().getTime().toString()).digest('hex') + ".png",
             file: fs.createReadStream(PUBLIC_HTML_PATH + "/image/temp/workingdesign/variations/"+variationName+".png")
          }
        }
      }
    }))
    .then((asset) => asset.processForLocale('en-US'))
    .then((asset) => asset.publish())
    .then((asset) => {
        console.log(asset);
        callback({variationName: variationName, variationMockup: {id: asset.sys.id, url: "https:" + asset.fields.file["en-US"].url}});
    })
    .catch((error) => {
        console.error(error);
        nowUploadTheFullScalePicYoDawg(variationName, callback);
    });
}

function afterDownloadAjax(req, res, blankHash, blankFileNameHashed, geometry) {
	var hexColor = req.query.hexColor
	var outputFile = OUTPUT_DIRECTORY + hexColor + blankHash + ".png"
	var publicOutputFile = PUBLIC_OUTPUT_DIRECTORY + hexColor + blankHash + ".png"
    var cliCommand = "convert -colorspace rgb -fill '#" + hexColor + "' -fuzz 100% -opaque '#7F7F7F' " + KEY_GRAPHIC_LOCAL_PNG + " " + PUBLIC_HTML_PATH + "/image/temp/workingdesign/mockup.png"
    exec(cliCommand, 
        function (error, stdout, stderr) {
            if(error) console.error("error: getMockupWithColorServer::afterDownloadAjax")
            // This callback is invoked once the child terminates
            // You'd want to check err/stderr as well!

			makeTheFinalPicYo(req, res, publicOutputFile, blankFileNameHashed, geometry);
			

            if(stdout) console.log(stdout)
       } 
    );
}

function makeTheFinalPicYo(req, res, publicOutputFile, blankFileNameHashed, geometry) {
    var cliCommand = process.env.FREDS_SCRIPT_PATH + " -r "+geometry+" " + PUBLIC_HTML_PATH + "/image/temp/workingdesign/mockup.png " + PUBLIC_HTML_PATH + "/image/blanks/scaled/208x"+blankFileNameHashed+" " + PUBLIC_HTML_PATH + "/image/temp/workingdesign/mockup.png"
    exec(cliCommand, 
        function (error, stdout, stderr) {
            if(error) console.log(error)
            // This callback is invoked once the child terminates
            // You'd want to check err/stderr as well!
			res.send("image/temp/workingdesign/mockup.png")
            if(stdout) console.log(stdout)
      } 
    );
};

// 1 get blank shirt image from contentful
// 2 shrink blank shirt image for local cache
// 3 make colored KEY_GRAPHIC_LOCAL_PNG
// 4 make the final pic yo