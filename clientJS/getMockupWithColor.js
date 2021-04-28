var request = require('request');

// upload the design graphic
module.exports = function requestMockupImage(variantId, vinylModelId, tShirtModelId) {
    // I'm thinking I can still use this somehow
    var assetId = "we don't know the assetID because this hasnt been uploaded to contentful"
    
	var postUrl = "https://t-shirts.jasonlambert.io/getMockupWithColor?vinylModelId="+vinylModelId+"&tShirtModelId="+tShirtModelId;
	console.log("Posting This: " + postUrl);
	post(postUrl, mockupImageIsReady, variantId+"FrontPic", assetId, variantId+"FrontPicPlaceHolder");
}

function mockupImageIsReady(url, pictureToUpdate, assetId, hiddenElement) {
    var element = document.getElementById(pictureToUpdate)
    element.src = url
    element.setAttribute("value", assetId)
    element.className = "shirtPics"
    hiddenElement.className = "is-hidden"
}

function post(url, callback, pictureToUpdate, assetId, hiddenElement) {
    var options = {
        method: "POST",
        url: url,
    }
    
    request(options, function(error, response, body) {
        if(error) console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // callback(body + "?time=" + new Date().getTime(), pictureToUpdate, assetId, hiddenElement)
        callback(JSON.parse(body).mockupUrl, pictureToUpdate, assetId, hiddenElement);
    });
}

// upload premade mockup image
function updateMockShirtImage(pictureToUpdate, assetUrl, assetId) {
	doTheUpdate(pictureToUpdate, assetUrl, assetId);
}

function doTheUpdate(pictureToUpdate, hiddenElement, assetUrl, assetId) {
    var element = document.getElementById(pictureToUpdate)
    element.src = assetUrl + "?fm=jpg&w=208"
    element.setAttribute("value", assetId)
    element.className = "shirtPics"
    hiddenElement.className = "is-hidden"
}
