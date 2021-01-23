var request = require('request');
var querystring = require('querystring');

const refreshToken = process.env.EBAY_MY_PERSONAL_USER_REFRESH_TOKEN;
const AUTH_BASE_64 = process.env.EBAY_AUTH_BASE_64;
const AUTH_SCOPE = "https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope";

function getAccessToken(scope) {
    let myScope = AUTH_SCOPE;
    if(scope) myScope = scope;

    let form = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        scope: myScope
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
                resolve(JSON.parse(body).access_token);
            }else {
                reject();
            }
        });
    })    
}

module.exports = getAccessToken;