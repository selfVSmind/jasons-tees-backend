const exec = require('child_process').exec;
const crypto = require('crypto');
const downloadFile = require('./downloadAndScaleImageFile.js');
const getContentfulEntries = require('./getContentfulEntries');
const fs = require('fs');
const contentful = require('contentful-management');
const path = require('path');

const getExtRegex = /(?:\.([^.]+))?$/;
const scaleToWidth = 400;

const BLANK_SHIRT_IMAGE_DIRECTORY = path.join(__dirname, '.', 'public', 'image', 'blanks');

const FREDS_SCRIPT_PATH = process.env.FREDS_SCRIPT_PATH;
const PUBLIC_HTML_PATH = process.env.PUBLIC_HTML_PATH;

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_MAN_TOKEN
})
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;

setSessionKeyGraphic = (cncCutFileId, session, sessionID) => {
    session.keyGraphicId = cncCutFileId;
    let keyGraphicPath = path.join(__dirname, '.', 'public', getContentfulEntries.getCncCutFileImage(cncCutFileId));
    let sessionPathToKeyGraphicPng = path.join(__dirname, 'public', 'image', 'temp', sessionID, 'keyGraphic.png');

    fs.copyFileSync(keyGraphicPath, sessionPathToKeyGraphicPng);

};

module.exports = {

//     newAjax: function(req, res) {
//         let tShirtModelId = req.body.hasOwnProperty('tShirtModelId') ? req.body.tShirtModelId : req.query.tShirtModelId;
//         let vinylModelId = req.body.hasOwnProperty('vinylModelId') ? req.body.vinylModelId : req.query.vinylModelId;
//         let cncCutFileId;

// console.log(JSON.stringify(req.body, null, 2));

//         if(req.body.hasOwnProperty('cncCutFileId')) {
//             cncCutFileId = req.body.cncCutFileId;
//             if(req.session.keyGraphicId != cncCutFileId) {
//                 setSessionKeyGraphic(cncCutFileId, req.session, req.sessionID);
//             }
//         };

//         res.json(req.session);
//     },
    //the ajax function here is called when you use the color dropdowns on the site and you can see the picture update in real time
    ajax: function(req, res) {

        let tShirtModelId = req.body.hasOwnProperty('tShirtModelId') ? req.body.tShirtModelId : req.query.tShirtModelId;
        let vinylModelId = req.body.hasOwnProperty('vinylModelId') ? req.body.vinylModelId : req.query.vinylModelId;
        let cncCutFileId;

        if(req.body.hasOwnProperty('cncCutFileId')) {
            cncCutFileId = req.body.cncCutFileId;
            if(req.session.keyGraphicId != cncCutFileId) {
                setSessionKeyGraphic(cncCutFileId, req.session, req.sessionID);
            }
        };

        // let sessionDirectory = path.join(__dirname, '.', 'public', 'image', 'temp', req.sessionID);
        let sessionDirectory = req.session.tempPath;
        console.log(sessionDirectory);
        // let KEY_GRAPHIC_LOCAL_PNG = PUBLIC_HTML_PATH + "/image/temp/workingdesign/keyGraphic.png"
        // let OUTPUT_DIRECTORY = PUBLIC_HTML_PATH + "/image/temp/workingdesign/theMockups/"
        // let PUBLIC_OUTPUT_DIRECTORY = "image/temp/workingdesign/theMockups/"
        // let VARIATIONS_DIR = PUBLIC_HTML_PATH + "/image/temp/workingdesign/variations";

        try {
            // let blankFileName = req.query.shirtBlankFrontPicUrl.split('/').pop()
            let shirtBlankFrontPicUrl = getContentfulEntries.blankUrlFromId(tShirtModelId);
            let hexColor = getContentfulEntries.hexFromId(vinylModelId)
            let blankFileName = shirtBlankFrontPicUrl.split('/').pop()
            let blankFileNameExt = getExtRegex.exec(blankFileName)[1];   
            let blankHash = crypto.createHash('md5').update(blankFileName).digest('hex');
            let blankFileNameHashed = blankHash + "." + blankFileNameExt
            //and finally
            let blankFileLocal = path.join(BLANK_SHIRT_IMAGE_DIRECTORY, blankFileNameHashed);

            downloadFile(BLANK_SHIRT_IMAGE_DIRECTORY, blankFileNameHashed, shirtBlankFrontPicUrl, scaleToWidth, afterDownloadAjax(req.sessionID, hexColor, res, blankHash, blankFileNameHashed, '133x133+133+133', sessionDirectory))
        } catch(error) {
            console.log(error.message);
            res.json({msg: "you playing games with my heart? unknown id from either tshirtblank or vinyl."});
        }
    },
    //fullsizemockup is very similar to ajax, with the difference being it works on the full size image, so it takes quite a bit longer to perform
    fullSizeMockup: function(sessionID, shirtBlankFrontPicUrl, htvId, shirtBlankId, variationName) {
    	let blankFileName = shirtBlankFrontPicUrl.split('/').pop()
        let blankFileNameExt = getExtRegex.exec(blankFileName)[1];   
        let blankHash = crypto.createHash('md5').update(blankFileName).digest('hex');
    	let blankFileNameHashed = blankHash + "." + blankFileNameExt
    	//and finally
    	let blankFileLocal = BLANK_SHIRT_IMAGE_DIRECTORY + blankFileNameHashed
    	
    	return new Promise((resolve) => downloadFile(BLANK_SHIRT_IMAGE_DIRECTORY, blankFileNameHashed, shirtBlankFrontPicUrl, scaleToWidth, afterDownloadFullScale(sessionID, blankHash, blankFileNameHashed, shirtBlankId, htvId, variationName, resolve)));
    }
}

function afterDownloadFullScale(sessionID, blankHash, blankFileNameHashed, shirtBlankId, htvId, variationName, callback) {
    try {
        let hexColor = getContentfulEntries.hexFromId(htvId);
        let geometry = getContentfulEntries.geometryFromId(shirtBlankId);
    
        let sessionDirectory = path.join(__dirname, '.', 'public', 'image', 'temp', sessionID);
        let publicOutputFile = path.join(sessionDirectory, hexColor + blankHash + ".png");
        let keyGraphicLocalPng = path.join(sessionDirectory, "keyGraphic.png");
        let variationFileName = path.join(sessionDirectory, variationName + ".png");
        let cliCommand = "convert -colorspace rgb -fill '#" + hexColor + "' -fuzz 100% -opaque '#7F7F7F' " + keyGraphicLocalPng + " " + variationFileName;
        exec(cliCommand, 
            function (error, stdout, stderr) {
                if(error) console.log("error: getMockupWithColor::afterDownloadFullScale")
                // This callback is invoked once the child terminates
                // You'd want to check err/stderr as well!
    
                makeTheFullScalePicYo(variationName, variationFileName, blankFileNameHashed, geometry, variationName, callback);
                
    
                if(stdout) console.log(stdout)
           } 
        );
    } catch(error) {
        console.log("We had an issue with some data provide from the client. Maybe something malicious?");
        console.log(error.message);
    }
};

function makeTheFullScalePicYo(variationName, variationFileName, blankFileNameHashed, geometry, variationName, callback) {
    let cliCommand = FREDS_SCRIPT_PATH + " -r " + geometry + " " + variationFileName + " " + PUBLIC_HTML_PATH + "/image/blanks/"+blankFileNameHashed+" " + variationFileName;
    exec(cliCommand, 
        function (error, stdout, stderr) {
            if(error) console.log(error)
            // This callback is invoked once the child terminates
            // You'd want to check err/stderr as well!
			nowUploadTheFullScalePicYoDawg(variationName, variationFileName, callback);
            if(stdout) console.log(stdout)
      } 
    );
};

function nowUploadTheFullScalePicYoDawg(variationName, variationFileName, callback) {
    console.log(variationFileName);
    client.getSpace(SPACE_ID)
    .then((space) => space.createAssetFromFiles({
      fields: {
        file: {
          'en-US': {
             contentType: 'image/png',
             fileName: crypto.createHash('md5').update(new Date().getTime().toString()).digest('hex') + ".png",
             file: fs.createReadStream(variationFileName)
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
        nowUploadTheFullScalePicYoDawg(variationName, variationFileName, callback);
    });
}

function afterDownloadAjax(sessionID, hexColor, res, blankHash, blankFileNameHashed, geometry, sessionDirectory) {
    // if(!getContentfulEntries.assertKnownHexColor(hexColor)) throw new Error('Unknown Hex Color Value. Is something malicious happening?');
    // let outputFile = OUTPUT_DIRECTORY + hexColor + blankHash + ".png"
    let outputFile = path.join(sessionDirectory, hexColor + blankHash + ".png");
    // let publicOutputFile = PUBLIC_OUTPUT_DIRECTORY + hexColor + blankHash + ".png"
    let publicOutputFile = path.join(sessionDirectory, + hexColor + blankHash + ".png");
    let keyGraphicLocalPng = path.join(sessionDirectory, "keyGraphic.png");
    let colorizedGraphic = path.join(sessionDirectory, "keyGraphicWithColor.png");
    let cliCommand = "convert -colorspace rgb -fill '#" + hexColor + "' -fuzz 100% -opaque '#7F7F7F' " + keyGraphicLocalPng + " " + colorizedGraphic;
    exec(cliCommand, (error, stdout, stderr) => {
            if(error) console.error("error: getMockupWithColorServer::afterDownloadAjax")
            // This callback is invoked once the child terminates
            // You'd want to check err/stderr as well!

            makeTheFinalScaledDownPicYo(sessionID, res, publicOutputFile, blankFileNameHashed, geometry, sessionDirectory);
            

            if(stdout) console.log(stdout)
    });
};

function makeTheFinalScaledDownPicYo(sessionID, res, publicOutputFile, blankFileNameHashed, geometry, sessionDirectory) {
    let colorizedGraphic = path.join(sessionDirectory, "keyGraphicWithColor.png");
    let mockupPng = path.join(sessionDirectory, "mockup.png");
    let cliCommand = process.env.FREDS_SCRIPT_PATH + " -r "+geometry+" " + colorizedGraphic + " " + PUBLIC_HTML_PATH + "/image/blanks/scaled/"+scaleToWidth+"x"+blankFileNameHashed+" " + mockupPng;
    exec(cliCommand, 
        function (error, stdout, stderr) {
            if(error) console.log(error)
            // This callback is invoked once the child terminates
            // You'd want to check err/stderr as well!
			res.json({mockupUrl: "image/temp/"+sessionID+"/mockup.png?time="+Date.now()})
            if(stdout) console.log(stdout)
      } 
    );
};

// 1 get blank shirt image from contentful
// 2 shrink blank shirt image for local cache
// 3 make colored KEY_GRAPHIC_LOCAL_PNG
// 4 make the final pic yo