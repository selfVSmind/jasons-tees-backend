var request = require('request');
var querystring = require('querystring');

const AUTH_BASE_64 = process.env.EBAY_AUTH_BASE_64;
const REDIRECT_URI = process.env.EBAY_REDIRECT_URI;

function exchangeCodeForRefreshToken(ebayAuthCode) {

    let form = {
        grant_type: 'authorization_code',
        code: ebayAuthCode,
        redirect_uri: REDIRECT_URI
    };
    
    let formData = querystring.stringify(form);
    
    let apiPath = "https://api.ebay.com"
    
    let options = {
        method: "POST",
        url: apiPath+"/identity/v1/oauth2/token",
        headers: {
            "Authorization" : AUTH_BASE_64,
            "Content-Type" : "application/x-www-form-urlencoded",
        },
        body: formData
    }
    
    return new Promise((resolve, reject) => {
        request(options, function(error, response, body) {
            if(error) console.log('error:', error); // Print the error if one occurred
            console.log('getEbayAccessToken statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log(JSON.parse(body).access_token);
            if(body) {
                resolve(JSON.parse(body).refresh_token);
            }else {
                reject();
            }
        });
    })    
}

module.exports = exchangeCodeForRefreshToken;