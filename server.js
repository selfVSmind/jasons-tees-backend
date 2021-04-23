const express = require('express');
const compression = require('compression');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
const cors = require('cors');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const path = require('path');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const multer = require('multer');
const uuid = require('uuid').v4;
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');
const bodyParser = require('body-parser')
require('body-parser-xml')(bodyParser);

const downloadKeyGraphicFile = require('./downloadKeyGraphicFile');
const getMockupWithColor = require('./getMockupWithColorServer').ajax;
const saveDesign = require('./saveDesignServer.js');
const getContentfulEntries = require('./getContentfulEntries');
const exchangeEbayCodeForRefreshToken = require('./ebay/exchangeCodeForEbayRefreshToken.js');

// let contentfulEntries;

// const contentful = require('contentful');
// const client = contentful.createClient({
// 	space: process.env.CONTENTFUL_SPACE_ID,
// 	accessToken: process.env.CONTENTFUL_TOKEN
// });

// client.getEntries()
// .then((entries) => {
//   contentfulEntries = JSON.parse(JSON.stringify(entries));
// });

const templateDir = path.join(__dirname, '.', 'views');

// Static PUBLICLY AVAILABLE directories
const newVersionDir = path.join(__dirname, '.', 'new-version', 'dist', 'new-version');
const cssDir = path.join(__dirname, '.', 'public', 'css');
const jsDir = path.join(__dirname, '.', 'public', 'js');
const imageDir = path.join(__dirname, '.', 'public', 'image');
const publicUploadsDir = path.join(__dirname, '.', 'uploads');
const wellKnownDir = path.join(__dirname, '.', 'public', '.well-known', 'acme-challenge');

// HTTPS Certificate stuffs
const credentials = {
  key: fs.readFileSync(process.env.SSL_PRIVKEY, 'utf8'),
  cert: fs.readFileSync(process.env.SSL_CERT, 'utf8'),
  ca: fs.readFileSync(process.env.SSL_CHAIN, 'utf8')
};

// I'm testing out the new Angular build at the moment, remove CORS after moving to production
const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, `${uuid()}-${originalname}`);
    // cb(null, "keyGraphic.ai");
  }
});
const upload = multer({ storage });

var ISSUER = process.env.OKTA_ISSUER;

// const oidc = new ExpressOIDC(Object.assign({
//   issuer: process.env.OKTA_ISSUER,
//   client_id: process.env.OKTA_CLIENT_ID,
//   client_secret: process.env.OKTA_CLIENT_SECRET,
//   appBaseUrl: process.env.OKTA_APP_BASE_URL,
//   scope: 'openid profile email',
//   routes: {
//     login: {
//       viewHandler: (req, res) => {
//         const baseUrl = url.parse(ISSUER).protocol + '//' + url.parse(ISSUER).host;
//         // Render your custom login page, you must create this view for your application and use the Okta Sign-In Widget
//         res.render('login', {
//           csrfToken: req.csrfToken(),
//           baseUrl: baseUrl
//         });
//       }
//     }
//   }
// }));

const app = express();

app.use(compression());

// Redirect to a secure connection if needed
app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301));


cookieAndSessionTimeToLive = 1000*60*60*24*10; // ten days

var FileStore = require('session-file-store')(session);
var fileStoreOptions = {
  path: process.env.SESSION_STORAGE_DIR,
  ttl: cookieAndSessionTimeToLive * 2 //just to be safe
};

app.use(session({
  cookie: {
    secure: true,
    sameSite: "none",
    maxAge: cookieAndSessionTimeToLive
  },
  store: new FileStore(fileStoreOptions),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false
}));

app.use('/', express.static(newVersionDir));
app.use('/css', express.static(cssDir));
app.use('/js', express.static(jsDir));
app.use('/image', express.static(imageDir));
app.use('/uploads', express.static(publicUploadsDir));
app.use('/.well-known/acme-challenge', express.static(wellKnownDir));

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', templateDir);

// app.use(oidc.router);

app.get('/old-version', (req, res) => {
  let tempPath = path.join(__dirname, '.', 'public', 'image', 'temp', req.sessionID);
  if(!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
  req.session.tempPath = tempPath;
  
  const template = 't-shirt-one-page';
  const userinfo = req.userContext && req.userContext.userinfo;
  res.render(template, {
    isLoggedIn: !!userinfo,
    isEbayAuthenticated: !!req.session.ebayRefreshToken,
    userinfo: userinfo
  });
});

app.get('/', (req, res) => {
  let tempPath = path.join(__dirname, '.', 'public', 'image', 'temp', req.sessionID);
  if(!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
  req.session.tempPath = tempPath;
});

// app.get('/profile', oidc.ensureAuthenticated(), (req, res) => {
//   // Convert the userinfo object into an attribute array, for rendering with mustache
//   const userinfo = req.userContext && req.userContext.userinfo;
//   const attributes = Object.entries(userinfo);
//   res.render('profile', {
//     isLoggedIn: !!userinfo,
//     userinfo: userinfo,
//     attributes
//   });
// });

app.use(bodyParser.json());
app.use(bodyParser.xml());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/downloadKeyGraphicFile', downloadKeyGraphicFile);
app.post('/getMockupWithColor', getMockupWithColor);
app.get('/getContentfulEntries', cors(corsOptions), getContentfulEntries.sendToClient);
app.get('/getTshirtBlankData', cors(corsOptions), getContentfulEntries.getTshirtBlankData);
// app.post('/saveDesign', oidc.ensureAuthenticated(), saveDesign);

// app.get('/ebay/accepted', oidc.ensureAuthenticated(), function(req, res) {
//   let ebayAuthCode;
//   if(req.query.code) ebayAuthCode = req.query.code;
//   exchangeEbayCodeForRefreshToken(ebayAuthCode)
//   .then((refreshToken) => {
//     req.session.ebayRefreshToken = refreshToken;
//     res.redirect('/');
//   });
// });

app.get('/checkKeyGraphic', (req, res) => {
  if(fs.existsSync(path.join(__dirname, 'public', 'image', 'temp', req.sessionID, "keyGraphic.png"))) res.json({haveGraphic: true, assetUrl: "image/temp/"+req.sessionID+"/keyGraphic.png"});
  else res.json({haveGraphic: false});
});

app.post('/upload', upload.single('photo'), (req, res) => {
  // req.session.file = req.file.path;
  // let oldFileName = path.join(process.env.UPLOADS_DIR, "keyGraphic.ai");
  let oldFileName = req.file.path;
  let newFileName = path.join(req.session.tempPath, "keyGraphic.ai");
  fs.renameSync(oldFileName, newFileName);
  downloadKeyGraphicFile(req, res, req.file);
  // return res.json(req.file.path);
});

// The next one need to stay at the bottom of the list
// This lets Angular handle the routing client side
app.get('/*', function(req, res) { 
  res.sendFile(path.join(__dirname, '.', 'new-version', 'dist', 'new-version', 'index.html'));
});

// oidc.on('ready', () => {
  // Starting both http & https servers
  const httpServer = http.createServer(app);
  const httpsServer = https.createServer(credentials, app);

  const HTTP_PORT = process.env.HTTP_PORT;
  const HTTPS_PORT = process.env.HTTPS_PORT;

  // The HTTP server needs to be live to redirect to the HTTPS server
  httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server running on port ${HTTP_PORT}`);
  });

  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTP Server running on port ${HTTPS_PORT}`);
  });
// });

// oidc.on('error', err => {
//   // An error occurred with OIDC
//   // eslint-disable-next-line no-console
//   console.error('OIDC ERROR: ', err);

//   // Throwing an error will terminate the server process
//   // throw err;
// });
