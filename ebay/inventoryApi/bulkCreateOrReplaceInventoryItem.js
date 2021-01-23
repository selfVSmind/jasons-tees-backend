var request = require('request');

module.exports = function bulkCreateOrReplaceInventoryItem(authToken, detailsArray) {
    let body = {requests: detailsArray}

    let options = {
        method: 'POST',
        url: 'https://api.ebay.com/sell/inventory/v1/bulk_create_or_replace_inventory_item',
        headers: {
            'Authorization' : 'Bearer ' + authToken,
            'Content-Type' : 'application/json',
            'Content-Language' : 'en-US'
        },
        json: body
    };
    
    return new Promise((resolve, reject) => {
        performRequest(options, resolve, reject);
    })
}

//200 = success
//204 = no content
//400 = bad request
//404 = not found
//500 = internal server error

function performRequest(options, resolve, reject) {
    request(options, function(error, response, body) {
        if(error) console.log('error:', error); // Print the error if one occurred
        console.log('bulkCreateOrReplaceInventoryItem statusCode:', response && response.statusCode); // Print the response status code if a response was received
        if((response && response.statusCode) >= 200  && (response && response.statusCode) < 300) {
            resolve(body);
        }else if((response && response.statusCode) >= 400 && (response && response.statusCode) < 500) {
            console.log(JSON.stringify(body, null, 2));
            reject("Bad request to bulkCreateOrReplaceInventoryItem");
        }else if((response && response.statusCode) >= 500 && (response && response.statusCode) < 600) {
            console.log("Failed to bulkCreateOrReplaceInventoryItem due to server error, trying again...");
            setTimeout(function() {performRequest(options, resolve, reject);}, 1000);
        }else {
            reject("Failed to bulkCreateOrReplaceInventoryItem. I don't know why.");
        }
    });
}
