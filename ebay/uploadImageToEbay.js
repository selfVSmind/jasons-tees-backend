const APP_ID = process.env.EBAY_APP_ID;   // client id
const DEV_ID = process.env.DEV_ID;
const CERT_ID = process.env.CERT_ID;   // client secret


var xml2js = require("xml2js").parseString;
var request = require('request');

module.exports = function uploadImageToEbay(authToken, imagePublicUrl) {
    var xmlBody = `
        <?xml version="1.0" encoding="utf-8"?>
        <UploadSiteHostedPicturesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
          <ExternalPictureURL>${imagePublicUrl}</ExternalPictureURL>
          <PictureSet>Supersize</PictureSet>
        </UploadSiteHostedPicturesRequest>
    `

    var options = {
        method: "POST",
        url: 'https://api.ebay.com/ws/api.dll',
        headers: {
            'X-EBAY-API-IAF-TOKEN' : authToken,
            'X-EBAY-API-COMPATIBILITY-LEVEL':997,
            
            'X-EBAY-API-DEV-NAME' : DEV_ID,
            'X-EBAY-API-APP-NAME' : APP_ID,
            'X-EBAY-API-CERT-NAME' : CERT_ID,
            'X-EBAY-API-CALL-NAME' : 'UploadSiteHostedPictures',
            'X-EBAY-API-SITEID' : 0,
            // 'X-EBAY-SOA-RESPONSE-DATA-FORMAT' : 'JSON',
            'Content-Type' : 'application/xml'
        },
        body: xmlBody
    }

    return new Promise(function(resolve, reject) {
        request(options, function(error, response, body) {
            if(error) console.log('error:', error); // Print the error if one occurred
            console.log('uploadImageToEbay statusCode:', response && response.statusCode); // Print the response status code if a response was received
            // console.log(body);
            if(body) {
                xml2js(body, function (err, result) {
                    resolve(result.UploadSiteHostedPicturesResponse.SiteHostedPictureDetails[0].FullURL[0]);
                    if(err) console.log("Either problems uploading image to ebay or XML ERRORROROROR")
                });
            }else {
                reject("Problems uploading image to eBay.");
            }
        });
    });
}
