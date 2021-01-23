var inventoryApi = require("./inventoryApi/inventoryApi.js");

var getInventoryItem = inventoryApi.getInventoryItem;
var createOrReplaceInventoryItem = inventoryApi.createOrReplaceInventoryItem;

module.exports = function(authToken, inventoryItemSku, newCount) {
    return new Promise((resolve, reject) => {
        getInventoryItem(authToken, inventoryItemSku)
        .then((item) => {
            var quantityAvailable = item.availability.shipToLocationAvailability.quantity;
            if(quantityAvailable == newCount) resolve("Count is already accurate for sku "+inventoryItemSku+".");
            else {
                item.availability.shipToLocationAvailability.quantity = newCount;
                return createOrReplaceInventoryItem(authToken, item.sku, item);
            }
        })
        .catch((error) => {
            console.log(error);
        });
    });
};
