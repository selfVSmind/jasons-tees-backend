var request = require('request');

module.exports = {
	updateMockShirtImage: updateMockShirtImage,
	updateKeyGraphicImage:updateKeyGraphicImage
}


// upload the design graphic
function updateKeyGraphicImage(pictureToUpdate, hiddenElement, assetUrl, assetId, fileExtension) {
	var postUrl = "https://t-shirts.jasonlambert.io/downloadKeyGraphicFile?keyGraphicUrl=" + assetUrl + "&fileExtension=" + fileExtension
	console.log("Posting This: " + postUrl);
	post(postUrl, keyGraphicIsReady, pictureToUpdate, assetId, assetUrl, hiddenElement);
}

function post(url, callback, pictureToUpdate, assetId, assetUrl, hiddenElement) {
    var options = {
        method: "POST",
        url: url,
    }
    
    request(options, function(error, response, body) {
        if(error) console.log('error:', error); // Print the error if one occurred
        if(response.statusCode != 200) console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log(body);
        callback(pictureToUpdate, assetId, assetUrl, hiddenElement)
    });
}

// callback function
function keyGraphicIsReady(pictureToUpdate, assetId, assetUrl, hiddenElement) {
    var element = document.getElementById(pictureToUpdate)
    element.src = "image/temp/workingdesign/keyGraphic.png?time="+ new Date().getTime()
    element.setAttribute("value", assetId)
    element.url = assetUrl
    element.className = "shirtPics"
    hiddenElement.className = "is-hidden"
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
