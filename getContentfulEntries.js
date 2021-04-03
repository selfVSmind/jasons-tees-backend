const contentful = require('contentful');

const client = contentful.createClient({
	space: process.env.CONTENTFUL_SPACE_ID,
	accessToken: process.env.CONTENTFUL_TOKEN
});

// module.exports = (req, res) => {
// 	client.getEntries()
// 	.then((entries) => {
// 		res.send(entries);
// 	});
// };

let contentfulEntries;

client.getEntries()
.then((entries) => {
	contentfulEntries = JSON.parse(JSON.stringify(entries));
});

module.exports = {
	hexFromId: function(vinylModelId) {
		console.log(vinylModelId);		// make sure no one is trying to inject nasty text before we execute our CLI command
		let found = false;
		let hexColor;
		contentfulEntries.items.forEach(function (entry) {
			if(vinylModelId == entry.sys.id) {
				console.log("confirmed known vinyl ID: ", vinylModelId);
				found = true;
				hexColor = entry.fields.pantoneEquivalentValue;
			}
		});
		if(!found) throw new Error('Unknown Hex Color Value. Is something malicious happening?');
		else return hexColor;
	},
	geometryFromId: function(shirtBlankId) {
		console.log(shirtBlankId);		// make sure no one is trying to inject nasty text before we execute our CLI command
		let found = false;
		let geometry;
		contentfulEntries.items.forEach(function (entry) {
			if(shirtBlankId == entry.sys.id) {
				console.log("confirmed known vinyl ID: ", shirtBlankId);
				found = true;
				geometry = entry.fields.mockupOverlayGeometry.width+"x"+entry.fields.mockupOverlayGeometry.height+"+"+entry.fields.mockupOverlayGeometry.x+"+"+entry.fields.mockupOverlayGeometry.y;
			}
		});
		if(!found) throw new Error('Unknown Shirt Blank Geometry Value. Is something malicious happening?');
		else return geometry;
	},
	blankUrlFromId: function(modelId) {
		// make sure no one is trying to inject nasty text before we execute our CLI command
        let found = false;
        let url = "";
		contentfulEntries.items.forEach(function (entry) {
			if(entry.sys.contentType.sys.id == 'tShirtBlank') {
				if(modelId == entry.sys.id) {
					console.log("confirmed known tshirt model ID: ", modelId);
                    found = true;
                    url = entry.fields.front.fields.file.url;
				}
			}
		});
        if(!found) throw new Error('Unknown Blank T-Shirt ID. Is something malicious happening?');
        else return url;
	},
	sendToClient: function(req, res) {
		res.json(contentfulEntries);
	}
};