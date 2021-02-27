var exec = require('child_process').exec;
var crypto = require('crypto');
var downloadFile = require('./downloadAndScaleImageFile.js');
const getContentfulEntries = require('./getContentfulEntries');
var fs = require('fs');
const contentful = require('contentful-management');
const path = require('path');

const getExtRegex = /(?:\.([^.]+))?$/;
const scaleToWidth = 208;

const blankShirtMockupDirectory = path.join(__dirname, '.', 'public', 'image', 'blanks');

const FREDS_SCRIPT_PATH = process.env.FREDS_SCRIPT_PATH;
const PUBLIC_HTML_PATH = process.env.PUBLIC_HTML_PATH;

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_TOKEN
})
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;

module.exports = {
    ajax: function(req, res) {

        // let sessionDirectory = path.join(__dirname, '.', 'public', 'image', 'temp', req.sessionID);
        let sessionDirectory = req.session.tempPath;
        // let KEY_GRAPHIC_LOCAL_PNG = PUBLIC_HTML_PATH + "/image/temp/workingdesign/keyGraphic.png"
        // let OUTPUT_DIRECTORY = PUBLIC_HTML_PATH + "/image/temp/workingdesign/theMockups/"
        // let PUBLIC_OUTPUT_DIRECTORY = "image/temp/workingdesign/theMockups/"
        // let blankShirtMockupDirectory = PUBLIC_HTML_PATH + "/image/blanks/"
        // let VARIATIONS_DIR = PUBLIC_HTML_PATH + "/image/temp/workingdesign/variations";

    	var blankFileName = req.query.shirtBlankFrontPicUrl.split('/').pop()
        var blankFileNameExt = getExtRegex.exec(blankFileName)[1];   
        var blankHash = crypto.createHash('md5').update(blankFileName).digest('hex');
    	var blankFileNameHashed = blankHash + "." + blankFileNameExt
    	//and finally
    	var blankFileLocal = path.join(blankShirtMockupDirectory, blankFileNameHashed);
    	
    	downloadFile(blankShirtMockupDirectory, blankFileNameHashed, req.query.shirtBlankFrontPicUrl, scaleToWidth, afterDownloadAjax(req, res, blankHash, blankFileNameHashed, '70x70+70+70', sessionDirectory))
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
    var cliCommand = "convert -colorspace rgb -fill '#" + hexColor + "' -fuzz 100% -opaque '#7F7F7F' " + KEY_GRAPHIC_LOCAL_PNG + " " + VARIATIONS_DIR + "/" +variationName+".png"
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

function assertKnownHexColor(hexColor) {
    // make sure no one is trying to inject nasty text before we execute our CLI command
    let colors = [];
    for(let i = 0; i < colors.length; ++i) {
        if(hexColor == colors[i]) return true;
    }
    return false;
}

function afterDownloadAjax(req, res, blankHash, blankFileNameHashed, geometry, sessionDirectory) {
    var hexColor = req.query.hexColor;
    // if(!getContentfulEntries.assertKnownHexColor(hexColor)) throw new Error('Unknown Hex Color Value. Is something malicious happening?');
    try {
        getContentfulEntries.assertKnownHexColor(hexColor);
        // var outputFile = OUTPUT_DIRECTORY + hexColor + blankHash + ".png"
        var outputFile = path.join(sessionDirectory, hexColor + blankHash + ".png");
        // var publicOutputFile = PUBLIC_OUTPUT_DIRECTORY + hexColor + blankHash + ".png"
        var publicOutputFile = path.join(sessionDirectory, + hexColor + blankHash + ".png");
        var keyGraphicLocalPng = path.join(sessionDirectory, "keyGraphic.png");
        var colorizedGraphic = path.join(sessionDirectory, "keyGraphicWithColor.png");
        var cliCommand = "convert -colorspace rgb -fill '#" + hexColor + "' -fuzz 100% -opaque '#7F7F7F' " + keyGraphicLocalPng + " " + colorizedGraphic;
        exec(cliCommand, (error, stdout, stderr) => {
                if(error) console.error("error: getMockupWithColorServer::afterDownloadAjax")
                // This callback is invoked once the child terminates
                // You'd want to check err/stderr as well!

                makeTheFinalPicYo(req, res, publicOutputFile, blankFileNameHashed, geometry, sessionDirectory);
                

                if(stdout) console.log(stdout)
        });
    } catch(error) {
        console.log(error);
        res.json({msg: "bad input: hex color not known"});
    };
};

function makeTheFinalPicYo(req, res, publicOutputFile, blankFileNameHashed, geometry, sessionDirectory) {
    var colorizedGraphic = path.join(sessionDirectory, "keyGraphicWithColor.png");
    var mockupPng = path.join(sessionDirectory, "mockup.png");
    var cliCommand = process.env.FREDS_SCRIPT_PATH + " -r "+geometry+" " + colorizedGraphic + " " + PUBLIC_HTML_PATH + "/image/blanks/scaled/208x"+blankFileNameHashed+" " + mockupPng;
    exec(cliCommand, 
        function (error, stdout, stderr) {
            if(error) console.log(error)
            // This callback is invoked once the child terminates
            // You'd want to check err/stderr as well!
			res.send("image/temp/"+req.sessionID+"/mockup.png")
            if(stdout) console.log(stdout)
      } 
    );
};

// 1 get blank shirt image from contentful
// 2 shrink blank shirt image for local cache
// 3 make colored KEY_GRAPHIC_LOCAL_PNG
// 4 make the final pic yo