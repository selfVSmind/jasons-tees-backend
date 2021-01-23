var request = require('request');

module.exports = function createOffer(authToken, inventoryItemSku, itemDetails) {
    let options = {
        method: 'POST',
        url: 'https://api.ebay.com/sell/inventory/v1/offer',
        headers: {
            'Authorization' : 'Bearer ' + authToken,
            'Content-Type' : 'application/json',
            'Content-Language' : 'en-US'
        },
        json: itemDetails,
        timeout: 10000 // give it 10 whole seconds
    };
    
    return new Promise((resolve, reject) => {
        performRequest(options, inventoryItemSku, resolve, reject);
    });
};

//200 = success
//201 = created
//400 = bad request
//4xx = client error
//500 = internal server error

function performRequest(options, inventoryItemSku, resolve, reject) {
    request(options, function(error, response, body) {
        if(error) {
            console.log('createOffer error:', JSON.stringify(error, null, 2)); // Print the error if one occurred
            console.log("Failed to createOffer for inventoryItem: "+inventoryItemSku+". Trying again...");
            performRequest(options, inventoryItemSku, resolve, reject);
        }else {
            console.log('createOffer statusCode:', response && response.statusCode); // Print the response status code if a response was received
            if((response && response.statusCode) >= 200  && (response && response.statusCode) < 300) {
                // console.log(JSON.stringify(body, null, 2));
                let response = {
                    message: "Successfully createdOffer for inventoryItem: "+inventoryItemSku,
                    inventoryItemSku: inventoryItemSku,
                    ebayOfferId: body.offerId
                };
                resolve(response);
            }else if((response && response.statusCode) >= 400 && (response && response.statusCode) < 500) {
                // console.log(JSON.stringify(body, null, 2));
                reject("Bad request to createOffer for inventoryItem: "+inventoryItemSku);
            }else if((response && response.statusCode) >= 500 && (response && response.statusCode) < 600) {
                console.log("Failed to createOffer for inventoryItem:"+inventoryItemSku+" due to server error, trying again...");
                setTimeout(function() {performRequest(options, inventoryItemSku, resolve, reject);}, 1000);
            }else {
                reject("Failed to createOffer for inventoryItem: "+inventoryItemSku+". I don't know why.");
            }
        }
    });
}
