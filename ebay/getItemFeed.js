var request = require('request');

module.exports = function createOrReplaceInventoryItem(authToken, categoryId) {

    let options = {
        method: 'GET',
        gzip: true,
        url: 'https://api.ebay.com/buy/feed/v1_beta/item?' + categoryId,
        headers: {
            'Authorization' : 'Bearer ' + authToken,
            'Content-Type' : 'application/json',
            'Content-Language' : 'en-US'
        },
    };
    
    return new Promise((resolve, reject) => {
        performRequest(options, categoryId, resolve, reject);
    })
}

//200 = success
//204 = no content
//400 = bad request
//404 = not found
//500 = internal server error

function performRequest(options, categoryId, resolve, reject) {
    request(options, function(error, response, body) {
        if(error) console.log('error:', error); // Print the error if one occurred
        console.log('getItemFeed statusCode:', response && response.statusCode); // Print the response status code if a response was received
        if((response && response.statusCode) >= 200  && (response && response.statusCode) < 300) {
            resolve(body);
        }else if((response && response.statusCode) == 404) {
            console.log(JSON.stringify(body, null, 2));
            reject("Failed to getInventoryItem: "+categoryId+". eBay says it doesn't exist.");
        }else if((response && response.statusCode) >= 400 && (response && response.statusCode) < 500) {
            console.log(JSON.stringify(body, null, 2));
            reject("Bad request to getInventoryItem: "+categoryId);
        }else if((response && response.statusCode) == 500) {
            console.log("Failed to get the inventoryItem due to server error, trying again...");
            setTimeout(function() {performRequest(options, categoryId, resolve, reject);}, 1000);
        }else {
            reject("Failed to retrieve inventoryItem: "+categoryId+". I don't know why.");
        }
    });
}
