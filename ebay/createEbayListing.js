// for each variation {
//     for each size available {
//         upload mockup to ebay
//         remember url
//         create inventory item
//         remember sku
//         create offer
//         remember offer id
//     }
// }
// create inventory item group (id = design id)
// publish offer by inventory item group
// remember offer id





var updateShirtDesignContentfulEntryWithEbayDataAndSku = require("../updateContentfulEntry.js").addEbayItemGroupKey;
var prettyConsoleJson = require("../convenienceFunctions.js").prettyConsoleJson;

var generateSkus = require("../serialized/generateSkuNumbers.js");

var getToken = require('./refreshEbayAuthToken.js');
var uploadImageToEbay = require("./uploadImageToEbay.js");
var inventoryApi = require("./inventoryApi/inventoryApi.js");

var eBayAuthToken = "";

module.exports = function(ebayRefreshToken, contentfulEntry, reqBody) {
    return new Promise((resolve, reject) => {
        createListing(ebayRefreshToken, contentfulEntry, reqBody, resolve, reject);
    });
};

function getModel(id, modelsArray) {
  for(let modelIndex in modelsArray) {
    if(modelsArray[modelIndex].id == id) return modelsArray[modelIndex];
  }
}

function getBlank(id, shirtBlanksArray) {
  for(let blankIndex in shirtBlanksArray) {
    if(shirtBlanksArray[blankIndex].id == id) return shirtBlanksArray[blankIndex];
  }
}

function calculatePrice(blankPrice, weight, ebayShippingFees, markup, htvId) {
    const whiteVinylId = '4S01C76iJO2uQoesMcemkm'; // $1.9 per shirt using 12'' of vinyl
    const blackVinylId = '2tGH0K4gUsm2ImOMMYKqEM'; // $1.9 per shirt using 12'' of vinyl
    const goldVinylId = '3r8MGh332US0ss0EUG6gcY'; // $3.66
    
    let vinylCost = 3.2;
    if(htvId == whiteVinylId || htvId == blackVinylId) vinylCost = 2;
    if(htvId == goldVinylId) vinylCost = 3.66;
    
    let cost = blankPrice + ebayShippingFees[weight+'oz'] + vinylCost + markup;
    let askingPrice = (cost + .3)/.871;
    let roundedPrice = (Math.ceil(askingPrice * 100))/100;

    return roundedPrice;
}

function createListing(ebayRefreshToken, contentfulEntry, reqBody, resolveCreateListing, rejectCreateListing) {
    let shirtBlankArray = reqBody.blankShirtArray;
    let modelsArray = reqBody.modelsArray;
    let ebayShippingFees = reqBody.ebayShippingFees;
    
    let variations = contentfulEntry.fields.variations['en-US'];

    let priceAndCategoryIdForSkuArray = new Array();
    let masterImageUrl = "";
    let sizeChartUrl = "";
    let masterTShirtModel = {};
    let itemSkuArray = new Array();
    let variationsColorsArray = new Array();

    let sizesAvailable = new Object();

    let numberOfSkus = 0;
    for(let variationIndex in variations) {
        numberOfSkus += getModel(getBlank(variations[variationIndex].blankId, shirtBlankArray).modelId, modelsArray).sizesAvailable.length;
    }

    generateSkus(numberOfSkus + 1) // plus one is for the inventoryItemGroupSku
    .then((skus) => {
        itemSkuArray = skus;
        return getToken(ebayRefreshToken);
    })
    .then(function(token) {
        
        var promiseToUploadImagesToEbayArray = new Array();
        
        eBayAuthToken = token;

        // loop through the variations
        for(let i = 0; i < variations.length; ++i) {

            variationsColorsArray.push(variations[i].descriptiveText);
            
            promiseToUploadImagesToEbayArray.push(uploadImageToEbay(eBayAuthToken, variations[i].variationMockup.url));
        }
        promiseToUploadImagesToEbayArray.push(uploadImageToEbay(eBayAuthToken, getModel(getBlank(variations[0].blankId, shirtBlankArray).modelId, modelsArray).sizeChart.url));

        return Promise.all(promiseToUploadImagesToEbayArray);
    })
    .then((imageUrls) => {
        sizeChartUrl = imageUrls[imageUrls.length-1];
        
        var promiseToCreateInventoryItemArray = new Array();

        console.log("\n###############\nNow that images have been uploaded, lets create inventory items on eBay.");
        console.log(prettyConsoleJson(imageUrls));
        for(let z = 0; z < imageUrls.length-1; ++z) { //the minus one here is because the size chart is at the end

            let blankShirtIndex = -1;
            let tShirtModel = new Object();

            for(var m = 0; m < shirtBlankArray.length; ++m) {
                if(shirtBlankArray[m].id == variations[z].blankId) {
                    blankShirtIndex = m;
                    tShirtModel = getModel(shirtBlankArray[m].modelId, modelsArray);
                    sizesAvailable[z] = tShirtModel.sizesAvailable;
                    break;
                }
            }

            variations[z].skus = {};
    
            if(z == 0) {
                masterImageUrl = imageUrls[z];
                masterTShirtModel = tShirtModel;
            }
            
            for(let j = 0; j < sizesAvailable[z].length; ++j) {
                
                // for each size available in the variation do this
                let quantityAvailable = shirtBlankArray[blankShirtIndex]['count'+sizesAvailable[z][j]];
                let size = sizesAvailable[z][j];
                let colorDescription = variations[z].descriptiveText;
                let imageUrl = [imageUrls[z]];
                let demographic = tShirtModel.demographic;

                let skuCategoryId = getEbayCategoryId(tShirtModel.demographic);
                let skuPrice = calculatePrice(
                                                shirtBlankArray[blankShirtIndex].prices['price'+sizesAvailable[z][j]],
                                                tShirtModel.weight[size],
                                                ebayShippingFees,
                                                3.5,
                                                variations[z].htvId
                                            );

                priceAndCategoryIdForSkuArray.push({skuPrice: skuPrice, skuCategoryId: skuCategoryId});

                variations[z].skus[size] = {"ebay": {"inventoryItemSku": itemSkuArray[j + z]}};

                promiseToCreateInventoryItemArray.push(createEbaySku(eBayAuthToken, quantityAvailable, size, demographic, colorDescription, imageUrl, itemSkuArray[j + z*sizesAvailable[z].length]));
            }
        }
        return Promise.all(promiseToCreateInventoryItemArray);
    })
    .then((ebayResponses) => {
        
        var promiseToCreateOfferArray = new Array();
        
        console.log("\n###############\n\nNow that we have our inventory items set up, lets create offers for each of them on eBay.");
        console.log("\n###############################################################\n");
        console.log(prettyConsoleJson(ebayResponses));
        console.log("\n###############################################################\n");
        for(let k = 0; k < itemSkuArray.length-1; ++k) {
            let inventoryItemSku = itemSkuArray[k];
            let skuPrice = priceAndCategoryIdForSkuArray[k].skuPrice;
            let skuCategoryId = priceAndCategoryIdForSkuArray[k].skuCategoryId;
            promiseToCreateOfferArray.push(setupOfferForSku(eBayAuthToken, inventoryItemSku, skuPrice, skuCategoryId));
        }
        
        return Promise.all(promiseToCreateOfferArray);
    })
    .then((ebayResponses) => {
        variations.forEach(function(variation) {
            for(var size in variation.skus) {
                ebayResponses.forEach(function(ebayResponse) {
                    if(variation.skus[size].ebay.inventoryItemSku == ebayResponse.inventoryItemSku) {
                        variation.skus[size].ebay.ebayOfferId = ebayResponse.ebayOfferId;
                    }
                });
            }
        });

        console.log("\n###############\n\nNow that we have our offers set up, lets create an inventory item group on eBay.");
        
        var variantSkus = [];
        for(var i = 0; i < ebayResponses.length; ++i) {
            variantSkus.push(ebayResponses[i].inventoryItemSku);
        }
        
        var inventoryItemGroupSku = 'itemGroupKey'+itemSkuArray[itemSkuArray.length - 1];    

        return createEbayItemGroup(eBayAuthToken, inventoryItemGroupSku, variantSkus, variationsColorsArray, masterTShirtModel, contentfulEntry.fields, masterImageUrl, sizeChartUrl);
    })
    .then((inventoryItemGroupSku) => {
            return inventoryApi.publishOfferByInventoryItemGroup(eBayAuthToken, inventoryItemGroupSku);
    })
    .then((response) => {
        console.info("\n###############\n\nEverything went well. Here's the offer id: "+response.ebayListingId);
        updateShirtDesignContentfulEntryWithEbayDataAndSku(contentfulEntry.sys.id, response.inventoryItemGroupSku, response.ebayListingId, variations);
        resolveCreateListing(contentfulEntry);
    })
    .catch(function(fromReject) {
        console.error(fromReject);
        rejectCreateListing(fromReject);
    });
}

function createEbaySku(authToken, quantityAvailable, size, demographic, colorDescription, imageUrls, itemSku) {
    let itemDetails = {
        "availability": {
            "shipToLocationAvailability": {
                "quantity": quantityAvailable
            }
        },
        "condition": "NEW",
    	"packageWeightAndSize": {
    		"dimensions": {
    			"length": 12,
    			"width": 8,
    			"height": 2,
    			"unit": "INCH"
    		},
//    		"packageType": "TOUGH_BAGS",
    		"weight": {
    			"value": 13,
    			"unit": "OUNCE"
    		}
    	},
        "product": {
            "aspects": {
                [getEbaySizeDescription(demographic)]: [
                    size
                ],
                "Color": [
                    colorDescription
                ]
            },
            "imageUrls": imageUrls
        }
    };

    return inventoryApi.createOrReplaceInventoryItem(authToken, itemSku, itemDetails);
}

function setupOfferForSku(authToken, inventoryItemSku, skuPrice, ebayCategoryId) {

    let itemDetails = {
        "sku": inventoryItemSku,
        "marketplaceId": "EBAY_US",
        "format": "FIXED_PRICE",
        "categoryId": ebayCategoryId,
        "listingPolicies": {
            "fulfillmentPolicyId": "146401099013",
            "paymentPolicyId": "46379857013",
            "returnPolicyId": "131140326013"
        },
    	"merchantLocationKey": "apartment",
        "pricingSummary": {
            "price": {
                "currency": "USD",
                "value": skuPrice
            }
        }
    };
    
    return inventoryApi.createOffer(authToken, inventoryItemSku, itemDetails);
}

function getEbaySizeDescription(demo) {
        switch (demo) {
        case 'Men':
            return "Size (Men's)";
        case 'Ladies':
            return "Size (Women's)";
        default:
            console.log("tShirtModel Demographic has problem.");
            return "Size";
    }

}

function getEbayCategoryId(demo) {
        switch (demo) {
        case 'Men':
            return "15687";
        case 'Ladies':
            return "53159";
        default:
            console.log("tShirtModel Demographic has problem.");
            return "we have a problem getting category id here!!!";
    }

}

function createEbayItemGroup(authToken, inventoryItemGroupSku, variantSkuArray, variationsColorsArray, tShirtModel, theDesign, masterImageUrl, sizeChartUrl) {
    let itemGroupDetails = {
        "aspects": {
    		"Brand": [
    			tShirtModel.brand
    		],
    		"Style": [
    			"Graphic Tee"
    		],
    		"MPN": [
    			tShirtModel.mpn
    		],
    		"Size Type": [
    			tShirtModel.sizeType
    		],
    		"Material": [
    			tShirtModel.fabricComposition
    		],
    		"Sleeve Length": [
    			tShirtModel.sleeveLength+" Sleeve"
    		],
    		"Theme": [
    			theDesign.theme['en-US']
    		],
    		"Fit": [
    			tShirtModel.sizeType + " Fit"
    		],
    		"Neckline": [
    			tShirtModel.collarType+" Neck"
            ],
            "Type": [
                "T-Shirt"
            ],
            "Department": [
                tShirtModel.demographic == "Ladies" ? "Women" : tShirtModel.demographic
            ]
        },
        "title": theDesign.ebayListingTitle['en-US'],
        "description": "These quality garments are proudly made with Gildan Heavyweight t-shirts.",
        "imageUrls": [
            masterImageUrl,
            sizeChartUrl
        ],
        "variantSKUs": variantSkuArray,
        "variesBy": {
            "aspectsImageVariesBy": [
                "Color"
            ],
            "specifications": [
                {
                    "name": "Color",
                    "values": variationsColorsArray
                },
                {
                    "name": getEbaySizeDescription(tShirtModel.demographic),
                    "values": tShirtModel.sizesAvailable
                }
            ]
        }
    };
    
    return inventoryApi.createOrReplaceInventoryItemGroup(authToken, inventoryItemGroupSku, itemGroupDetails);
}