var request = require('request');

module.exports = function publishOfferByInventoryItemGroup(eBayAuthToken, inventoryItemGroupSku) {
    let jsonBody = {
        "inventoryItemGroupKey": inventoryItemGroupSku,
        "marketplaceId": "EBAY_US"
    }
    
    let options = {
        method: 'POST',
        url: 'https://api.ebay.com/sell/inventory/v1/offer/publish_by_inventory_item_group',
        headers: {
            'Authorization' : 'Bearer ' + eBayAuthToken,
            'Content-Type' : 'application/json',
            'Content-Language' : 'en-US'
        },
        json: jsonBody
    };

    return new Promise((resolve, reject) => {
        performRequest(options, inventoryItemGroupSku, resolve, reject)
    })
}

//200 = success
//2xx = success
//3xx = redirection
//400 = bad request
//404 = not found
//4xx = client error
//500 = internal server error
//5xx = internal server error

function performRequest(options, inventoryItemGroupSku, resolve, reject) {
    request(options, function(error, response, body) {
        if(error) console.log('error:', error); // Print the error if one occurred
        console.log('publishOfferByInventoryItemGroup statusCode:', response && response.statusCode); // Print the response status code if a response was received
        if((response && response.statusCode) >= 200  && (response && response.statusCode) < 300) {
            let response = {
                inventoryItemGroupSku: inventoryItemGroupSku,
                ebayListingId: body.listingId
            };
            resolve(response);
        }else if((response && response.statusCode) >= 400 && (response && response.statusCode) < 500) {
            console.log(JSON.stringify(body, null, 2))
            reject("Bad request to publish inventoryItemGroup: "+inventoryItemGroupSku);
        }else if((response && response.statusCode) >= 500 && (response && response.statusCode) < 600) {
            console.log("Failed to publish the inventoryItemGroup due to server error, trying again...")
            setTimeout(function() {performRequest(options, inventoryItemGroupSku, resolve, reject);}, 1000)
        }else {
            console.log(JSON.stringify(body, null, 2))
            reject("Failed to publish inventoryItemGroup: "+inventoryItemGroupSku+". I don't know why.");
        }
    });
}
