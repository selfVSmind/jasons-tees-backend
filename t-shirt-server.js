const bodyParser = require('body-parser')
const express = require("express");
const session = require('express-session');
const app = express();
const path = require('path');

const downloadKeyGraphicFile = require('./downloadKeyGraphicFile');
const getMockupWithColor = require('./getMockupWithColorServer').ajax;
const saveDesign = require('./saveDesignServer.js');

const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;

const fs = require('fs');
const http = require('http');
const https = require('https');


// Certificate stuffs
const credentials = {
	key: fs.readFileSync(process.env.SSL_PRIVKEY, 'utf8'),
	cert: fs.readFileSync(process.env.SSL_CERT, 'utf8'),
	ca: fs.readFileSync(process.env.SSL_CHAIN, 'utf8')
  };
  
// Redirect to a secure connection if needed
app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301));

require('body-parser-xml')(bodyParser);

app.use(bodyParser.json());
app.use(bodyParser.xml());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/http'));

app.get('/ebay/accepted', function(req, res) {
	res.send(req.query);
});
app.get('/okta/login', function(req, res) {
	res.send(req.query);
});
  app.get('/okta/logout', function(req, res) {
	res.send(req.query);
});
	  
app.post('/downloadKeyGraphicFile', downloadKeyGraphicFile);
app.post('/getMockupWithColor', getMockupWithColor);
app.post('/saveDesign', saveDesign);

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

// The HTTP server needs to be live to redirect to the HTTPS server
httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});

