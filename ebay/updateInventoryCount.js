var inventoryApi = require("./inventoryApi/inventoryApi.js");
var bulkGetInventoryItem = inventoryApi.bulkGetInventoryItem;
var bulkCreateOrReplaceInventoryItem = inventoryApi.bulkCreateOrReplaceInventoryItem;

module.exports = function updateInventoryCount(authToken, designs, blankId, size, newCount) {
    var skuArrays = {
        skuCounter: 0,
        arrays: []
    };
    
    for(var i = 0; i < designs.length; ++i) {
        for(var j = 0; j < designs[i].variations.length; ++j) {
            let variation = designs[i].variations[j];
            if(blankId == variation.blankId) {
                //update contentful
                
                //update ebay skus
                addSkuToEbayUpdateList(variation.skus[size].ebay.inventoryItemSku, skuArrays);
            }
        }
    }
    
    let promiseToBulkGetInventoryItems = [];
        
    for(let thisArray of skuArrays.arrays) {
        promiseToBulkGetInventoryItems.push(bulkGetInventoryItem(authToken, thisArray));
    }
    
    Promise.all(promiseToBulkGetInventoryItems)
    .then((bulkResponses) => {
        
        let promiseToBulkUpdateItems = [];
        for(var k = 0; k < bulkResponses.length; ++k) {
            let detailsArray = [];

            for(var i = 0; i < bulkResponses[k].responses.length; ++i) {
                detailsArray.push(bulkResponses[k].responses[i].inventoryItem);
                detailsArray[i].availability.shipToLocationAvailability.quantity = newCount;
            }
            
            promiseToBulkUpdateItems.push(bulkCreateOrReplaceInventoryItem(authToken, detailsArray));
        }
        
        return Promise.all(promiseToBulkUpdateItems);
    })
    .then((bulkUpdateResponses) => {
        for(var i = 0; i < bulkUpdateResponses.length; ++i) {
            console.log("################################\n"+JSON.stringify(bulkUpdateResponses[i], null, 2));
        }
    })
    .catch((error) => {
        console.log(error);
    })
};

function addSkuToEbayUpdateList(sku, skuArrays) {
    if(((skuArrays.skuCounter++) % 25) == 0) skuArrays.arrays.push([]);
    skuArrays.arrays[skuArrays.arrays.length-1].push(sku);
}

