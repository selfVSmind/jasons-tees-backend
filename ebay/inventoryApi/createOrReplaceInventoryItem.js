var request = require('request');

module.exports = function(authToken, itemSku, itemDetails) {
    let options = {
        method: 'PUT',
        url: 'https://api.ebay.com/sell/inventory/v1/inventory_item/' + itemSku,
        headers: {
            'Authorization' : 'Bearer ' + authToken,
            'Content-Type' : 'application/json',
            'Content-Language' : 'en-US'
        },
        json: itemDetails,
        timeout: 10000 // give it 10 whole seconds
    };
    
    return new Promise((resolve, reject) => {
        performRequest(options, itemSku, resolve, reject);
    })
}

//200 = success
//201 = created
//204 = no content
//400 = bad request
//401 = ?
//500 = internal server error

function performRequest(options, itemSku, resolve, reject) {
    request(options, function(error, response, body) {
        if(error) {
            console.log('error:', JSON.stringify(error, null, 2)); // Print the error if one occurred
            console.log("Failed to create (or replace) inventoryItem: "+itemSku+". Trying again...");
            performRequest(options, itemSku, resolve, reject);
        }else {
            console.log('createOrReplaceInventoryItem statusCode:', response && response.statusCode); // Print the response status code if a response was received
            if((response && response.statusCode) >= 200  && (response && response.statusCode) < 300) {
                resolve("Successfully created (or replaced) inventoryItem: "+itemSku);
            }else if((response && response.statusCode) >= 400 && (response && response.statusCode) < 500) {
                console.log(JSON.stringify(body, null, 2));
                reject("Bad request to create (or replace) inventoryItem: "+itemSku);
            }else if((response && response.statusCode) == 500) {
                console.log("Failed to create (or replace) the inventoryItem due to server error, trying again...");
                setTimeout(function() {performRequest(options, itemSku, resolve, reject);}, 1000);
            }else {
                reject("Failed to create (or replace) inventoryItem: "+itemSku+". I don't know why.");
            }
        }
    });
}
