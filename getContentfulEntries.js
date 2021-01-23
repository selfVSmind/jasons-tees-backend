const contentful = require('contentful');

const client = contentful.createClient({
	space: process.env.CONTENTFUL_SPACE_ID,
	accessToken: process.env.CONTENTFUL_TOKEN
});


module.exports = (req, res) => {
	client.getEntries()
	.then((entries) => {
		res.send(entries);
	});
};
