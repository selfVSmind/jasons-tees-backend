var getMockupWithColor = require("./getMockupWithColor.js");

var tShirtWidthInPixels = 208

var shirtSampleRemoved = new Object()
var variantBlankSelections = new Object()
var variantHtvSelections = new Object()

module.exports = {
    
    reinitialize: function() {
        shirtSampleRemoved = new Object()
        variantBlankSelections = new Object()
        variantHtvSelections = new Object()
    },
    
    newBlankColor : function(variantId) {
    
        var frontPic = document.getElementById(variantId + "FrontPic")
        var backPic = document.getElementById(variantId + "BackPic")
        
        var blankSelector = document.getElementById(variantId + "BlankSelector").options;
        var blankSelectorSelection = blankSelector[blankSelector.selectedIndex]
        var blankSelectorParent = document.getElementById(variantId + "BlankSelector").parentElement
    
        if ((frontPic.getAttribute("value") == "noperz") && (frontPic.className != "is-hidden")) {
            if(blankSelectorSelection.value == "sample") {
                frontPic.src = "/image/sampleShirtFrontSmall.jpg";
            }
            else {
                frontPic.src = blankSelectorSelection.frontPic + "?fm=jpg&w=" + tShirtWidthInPixels;
            }
        }
    
        if ((backPic.getAttribute("value") == "noperz") && (backPic.className != "is-hidden")) {
            if(blankSelectorSelection.value == "sample") {
                backPic.src = "/image/sampleShirtBackSmall.jpg";
            }
            else {
                backPic.src = blankSelectorSelection.backPic + "?fm=jpg&w=" + tShirtWidthInPixels;
            }
        }
        
        if(blankSelectorSelection.value == "sample") {
            blankSelectorParent.setAttribute("class", "select is-danger")
        }
        else {
            blankSelectorParent.setAttribute("class", "select")
            if(!shirtSampleRemoved[variantId]) {
                blankSelector.remove(0)
                Object.assign(shirtSampleRemoved, {[variantId]: "beleted"})
            }
        }
        // console.log(JSON.stringify(blankSelectorSelection, null, 2));
        Object.assign(variantBlankSelections, {[variantId]: {color: blankSelectorSelection.color, modelId: blankSelectorSelection.modelId}})
        checkArraysForMatch(variantId)
        return {"blankId": blankSelectorSelection.value, "blankUrl": blankSelectorSelection.frontPic, "descriptiveText": getVariantDescriptiveText(variantId)};
    },
    
    newHtvColor: function(variantId) {
        var htvSelector = document.getElementById(variantId + "HtvSelector").options;
        var htvSelectorSelection = htvSelector[htvSelector.selectedIndex]
        if(htvSelectorSelection.value == "sample") {
            delete variantHtvSelections[variantId]
            setInputText(variantId, "")
        } else {
            Object.assign(variantHtvSelections, {[variantId]: {modelId: htvSelectorSelection.modelId, color: htvSelectorSelection.innerText, hexColor: htvSelectorSelection.hexColor}})
            checkArraysForMatch(variantId)
        }
        return {"htvId": htvSelectorSelection.value, "hexColor": htvSelectorSelection.hexColor, "descriptiveText": getVariantDescriptiveText(variantId)};
    },
    
    deleteVariant: function(variantId) {
        delete variantBlankSelections[variantId]
        delete variantHtvSelections[variantId]
    }
}

function checkArraysForMatch(variantId) {
    if((variantHtvSelections[variantId]) && (variantBlankSelections[variantId])){
        setInputText(variantId, variantHtvSelections[variantId].color + " on " + variantBlankSelections[variantId].color);
        getMockupWithColor(variantId, variantHtvSelections[variantId].modelId, variantBlankSelections[variantId].modelId);
        // console.log(JSON.stringify(variantBlankSelections[variantId], null, 2));
    }
}

function setInputText(variantId, text) {
    document.getElementById(variantId + "VariantName").value = text
}

function getVariantDescriptiveText(variantId) {
    return document.getElementById(variantId + "VariantName").value
}