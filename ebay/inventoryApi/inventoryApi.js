var createOrReplaceInventoryItem = require("./createOrReplaceInventoryItem.js");
var bulkCreateOrReplaceInventoryItem = require("./bulkCreateOrReplaceInventoryItem.js");
var createOffer = require("./createOffer.js");
var createOrReplaceInventoryItemGroup = require("./createOrReplaceInventoryItemGroup.js");
var getInventoryItem = require("./getInventoryItem.js");
var bulkGetInventoryItem = require("./bulkGetInventoryItem.js");
var publishOfferByInventoryItemGroup = require("./publishOfferByInventoryItemGroup.js");

module.exports = {
    createOrReplaceInventoryItem: createOrReplaceInventoryItem,
    bulkCreateOrReplaceInventoryItem: bulkCreateOrReplaceInventoryItem,
    createOrReplaceInventoryItemGroup: createOrReplaceInventoryItemGroup,
    createOffer: createOffer,
    getInventoryItem: getInventoryItem,
    bulkGetInventoryItem: bulkGetInventoryItem,
    publishOfferByInventoryItemGroup: publishOfferByInventoryItemGroup,
};