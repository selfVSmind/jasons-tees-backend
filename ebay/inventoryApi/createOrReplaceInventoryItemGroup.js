var request = require('request');

module.exports = function createOrReplaceInventoryItemGroup(authToken, inventoryItemGroupSku, itemGroupDetails) {
    
    var options = {
        method: 'PUT',
        url: 'https://api.ebay.com/sell/inventory/v1/inventory_item_group/'+inventoryItemGroupSku,
        headers: {
            'Authorization' : 'Bearer ' + authToken,
            'Content-Type' : 'application/json',
            'Content-Language' : 'en-US'
        },
        json: itemGroupDetails
    };

   return new Promise((resolve, reject) => {
        performRequest(options, inventoryItemGroupSku, resolve, reject);
    });
};

//200 = success
//201 = created
//204 = no content
//2xx = success
//400 = bad request
//4xx = client error
//500 = internal server error
//5xx = internal server error

function performRequest(options, inventoryItemGroupSku, resolve, reject) {
    request(options, function(error, response, body) {
        if(error) console.log('error:', error); // Print the error if one occurred
        console.log('createOrReplaceInventoryItemGroup statusCode:', response && response.statusCode); // Print the response status code if a response was received
        if((response && response.statusCode) >= 200  && (response && response.statusCode) < 300) {
            resolve(inventoryItemGroupSku);
        }else if((response && response.statusCode) >= 400 && (response && response.statusCode) < 500) {
            console.log(JSON.stringify(body, null, 2))
            reject("Bad request to create (or replace) inventoryItemGroup: "+inventoryItemGroupSku);
        }else if((response && response.statusCode) >= 500 && (response && response.statusCode) < 600) {
            console.log("Failed to create (or replace) the inventoryItemGroup due to server error, trying again...");
            setTimeout(function() {performRequest(options, inventoryItemGroupSku, resolve, reject);}, 1000);
        }else {
            reject("Failed to create (or replace) inventoryItemGroup: "+inventoryItemGroupSku+". I don't know why.");
        }
    });
}
