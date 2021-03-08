var wget = require('wget-improved');
var exec = require('child_process').exec;
const sdk = require('contentful-management');
const path = require('path');

const client = sdk.createClient({
  spaceId: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_MAN_TOKEN
});


module.exports = function(req, res) {
	let keyGraphicFile = path.join(__dirname, 'public', 'image', 'temp', req.sessionID, 'keyGraphic.ai');
	if(!keyGraphicFile) return;

	var whereToSave = path.join(__dirname, 'public', 'image', 'temp', req.sessionID, 'keyGraphic.png');

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
	uploadToContentful(req.sessionID, req.session.tempPath)
	.then((asset) => {
		req.session.keyGraphicId = asset.sys.id;
		console.log(JSON.stringify(req.session, null, 2));
		var cliCommand = "convert -colorspace rgb -fill '#000000' -fuzz 100% -opaque '#7F7F7F' " + `"${keyGraphicFile}" "${whereToSave}"`;
		exec(cliCommand, 
				function (error, stdout, stderr) {
					if(error) console.log("Convert keyGraphicFile error: "+error)
					// This callback is invoked once the child terminates
					// You'd want to check err/stderr as well!

					res.json({
						assetId: asset.sys.id,
						filePath: "https://t-shirts.jasonlambert.io/image/temp/"+req.sessionID+"/keyGraphic.png"
					});

					if(stdout) console.log("Convert keyGraphicFile: "+stdout)
			} 
			);
	});

	// });
	// download.on('progress', function(progress) {
	//     typeof progress === 'number'
	//     // code to show progress bar
	// });
};

function uploadToContentful(sessionID, tempPath) {
	return new Promise((resolve, reject) => {
		client.getSpace(process.env.CONTENTFUL_SPACE_ID)
		.then((space) => space.createAssetFromFiles({
		  fields: {
			title: {
			  'en-US': `"${'keyGraphic_'+sessionID}"`
			},
			description: {
			  'en-US': `"${'keyGraphic_'+sessionID}"`
			},
			file: {
			  'en-US': {
				contentType: "application/postscript",
				fileName: `"${sessionID+'_keyGraphic.ai'}"`,
				file: `"${tempPath+"/keyGraphic.ai"}"`
			  }
			}
		  }
		}))
		.then((asset) => asset.processForLocale('en-US'))
		.then((asset) => asset.publish())
		.then((asset) => {
		  resolve(asset);
		})
	});
};