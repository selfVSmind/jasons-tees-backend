const contentful = require('contentful');
const generateCutFileImage = require('./generateCutFileImage.js');

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

let tShirtBlanks = [];
let tShirtModels = [];
let heatTransferVinyls = [];
let myShirtDesigns = [];

client.getEntries()
.then((entries) => {
	contentfulEntries = JSON.parse(JSON.stringify(entries));
	entries.items.forEach(function (entry) {
		switch(entry.sys.contentType.sys.id) {
		  case 'tShirtBlank':
			var x = JSON.parse(JSON.stringify(entry.fields));
			delete x.front;
			delete x.back;
			delete x.tShirtModel;
			x.modelId = entry.fields.tShirtModel.sys.id;
			x.frontPic = {"url": entry.fields.front.fields.file.url, "id": entry.fields.front.sys.id};
			x.backPic = {"url": entry.fields.back.fields.file.url, "id": entry.fields.back.sys.id};
			x.id = entry.sys.id;
			tShirtBlanks.push(x)
			break;
		  case 'tShirtModel':
			var sizeChart = {"url": 'https:'+entry.fields.sizeChart.fields.file.url, "id": entry.fields.sizeChart.sys.id};
			var x = entry.fields;
			delete x.sizeChart;
			x.sizeChart = sizeChart;
			x.id = entry.sys.id;
			tShirtModels.push(x);
			break;
		  case 'heatTransferVinyl':
			var x = entry.fields;
			x.id = entry.sys.id;
			heatTransferVinyls.push(x)
			break;
		  case 'tShirtDesign':
			var x = entry.fields;
			x.frontPic = {"url": entry.fields.frontMockupImage.fields.file.url, "id": entry.fields.frontMockupImage.sys.id};
			x.backPic = {"url": entry.fields.backMockupImage.fields.file.url, "id": entry.fields.backMockupImage.sys.id};
			x.designFile = {"url": entry.fields.projectFiles[0].fields.file.url, "id": entry.fields.projectFiles[0].sys.id};
			delete x.projectFiles;
			delete x.backMockupImage;
			delete x.frontMockupImage;
			x.id = entry.sys.id;
			myShirtDesigns.push(x)
			break;
		}
	  });
});

getModel = (modelId) => {
	// contentfulEntries.items.forEach
}

getHtvData = (req, res) => {
	let htvData = { data: [] };
	contentfulEntries.items.forEach(entry => {
		if(entry.sys.contentType.sys.id == "heatTransferVinyl") {
			htvData.data.push({
				id: entry.sys.id,
				brandName: entry.fields.brandName,
				color: entry.fields.color,
				pantoneEquivalentValue: entry.fields.pantoneEquivalentValue,
				htvType: entry.fields.htvType
			});
		}
	});
	res.json(htvData);
};

getTshirtBlankData = (req, res) => {
	let blankData = { data: [] };
	contentfulEntries.items.forEach(entry => {
		if(entry.sys.contentType.sys.id == "tShirtBlank") {
			blankData.data.push({
				id: entry.sys.id,
				name: entry.fields.humanReadableName,
				frontPic: {"url": 'https:' + entry.fields.front.fields.file.url, "id": entry.fields.front.sys.id},
				backPic: {"url": 'https:' + entry.fields.back.fields.file.url, "id": entry.fields.back.sys.id},
				color: entry.fields.color,
				countS: entry.fields.countS,
				countM: entry.fields.countM,
				countL: entry.fields.countL,
				countXL: entry.fields.countXL,
				count2XL: entry.fields.count2XL,
				count3XL: entry.fields.count3XL,
				count4XL: entry.fields.count4XL,
				count5XL: entry.fields.count5XL,
				count6XL: entry.fields.count6XL,
				count7XL: entry.fields.count7XL,
				mockupOverlayGeometry: entry.fields.mockupOverlayGeometry,
				modelId: entry.fields.tShirtModel.sys.id
			});
		}
	});
	res.json(blankData);
};

getCncCutFileImage = (cncCutFileId) => {
	let returnValue;
	contentfulEntries.items.forEach(entry => {
		if(entry.sys.id == cncCutFileId) {
			returnValue = generateCutFileImage(entry.sys.id, 'https:' + entry.fields.file.fields.file.url);
		}
	});
	return returnValue;
};

getCncCutFileData = (req, res) => {
	let cutFileData = { data: [] };
	contentfulEntries.items.forEach(entry => {
		if(entry.sys.contentType.sys.id == "cncCutFile") {
			console.log(JSON.stringify(entry, null, 2));
			cutFileData.data.push({
				id: entry.sys.id,
				name: entry.fields.designName,
				imgUrl: generateCutFileImage(entry.sys.id, 'https:' + entry.fields.file.fields.file.url)
			});
		}
	});
	res.json(cutFileData);
};

module.exports = {
	getCncCutFileImage: getCncCutFileImage,
	getTshirtBlankData: getTshirtBlankData,
	getCncCutFileData: getCncCutFileData,
	getHtvData: getHtvData,
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