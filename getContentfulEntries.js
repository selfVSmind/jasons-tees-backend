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
	assertKnownHexColor: function(hexColor) {
		// make sure no one is trying to inject nasty text before we execute our CLI command
		let found = false;
		contentfulEntries.items.forEach(function (entry) {
			if(entry.sys.contentType.sys.id == 'heatTransferVinyl') {
				if(hexColor == entry.fields.pantoneEquivalentValue) {
					console.log("confirmed known HEX value: ", hexColor, " = ", entry.fields.pantoneEquivalentValue);
					found = true;
				}
			}
		});
		if(!found) throw new Error('Unknown Hex Color Value. Is something malicious happening?');
	},
	sendToClient: function(req, res) {
		res.json(contentfulEntries);
	}
};