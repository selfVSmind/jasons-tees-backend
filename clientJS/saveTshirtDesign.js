var request = require('request');
var tShirtVariant = require("./tShirtVariant.js");

const keyGraphicHtmlId = "keyGraphic";
const titleHtmlId = "mainDesignNameId";
const ebayTitleHtmlId = "mainDesignNameEbayId";
// const etsyTitleHtmlId = "mainDesignNameEtsyId";
const themeHtmlId = "mainDesignThemeId";

// var tShirtModelArray = new Array();

module.exports = {
    saveTheDesign: function() {
        var body = composeSaveDesignBody();
        var postUrl = "https://t-shirts.jasonlambert.io/saveDesign"
        post(postUrl, body);
    },
    
    // setupTShirtModelArray: function(array) {tShirtModelArray = JSON.parse(JSON.stringify(array))}
}

function post(url, body) {
    var options = {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        url: url,
        json: body
    }
    
    request(options, function(error, response, body) {
        if(error) console.log('error:', error); // Print the error if one occurred
        if(response.statusCode != 200) {
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log(body);
        }else console.log(body);
    });
}

function composeSaveDesignBody() {
    var variantArray = tShirtVariant.getVariantArray();
    var mainDesignTitle = document.getElementById(titleHtmlId).value;
    var ebayTitle = document.getElementById(ebayTitleHtmlId).value;
    // var etsyTitle = document.getElementById(etsyTitleHtmlId).value;
    var mainDesignTheme = document.getElementById(themeHtmlId).value;
 
    var keyGraphicId = document.getElementById(keyGraphicHtmlId).getAttribute("value");
    var keyGraphicUrl = "https:"+document.getElementById(keyGraphicHtmlId).url;
    var designFile = {"designFileId": keyGraphicId, "designFileUrl": keyGraphicUrl};
 
    var genderSelector = document.getElementById("genderSelector");
    var selectedGenderValue = genderSelector.options[genderSelector.options.selectedIndex].value;
    
    var designSpecs = {};
    designSpecs.designFile = designFile;
    designSpecs.title = mainDesignTitle;
    designSpecs.ebayTitle = ebayTitle;
    // designSpecs.etsyTitle = etsyTitle;
    designSpecs.theme = mainDesignTheme;
    designSpecs.demographic = selectedGenderValue;
    designSpecs.variations = variantArray;
    
    var jsonBody = {};
    jsonBody.designSpecs = designSpecs;
    jsonBody.htvArray = tShirtVariant.getHtvArray();
    jsonBody.blankShirtArray = tShirtVariant.getBlankShirtArray();
    jsonBody.modelsArray = tShirtVariant.getModelsArray();
    // jsonBody.shirtModelsArray = tShirtModelArray
    jsonBody.ebayShippingFees = {'13oz': 5.50, '12oz': 4.10,	'11oz': 4.10, '10oz': 4.10,	'9oz': 4.10, '8oz': 3.50, '7oz': 3.50, '6oz': 3.50};

    return jsonBody
}