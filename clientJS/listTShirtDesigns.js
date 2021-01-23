var newColor = require("./newColor.js")
const htmlIdForThisPage = "appDesignsPage"

var shirtBlankColorsArray
var htvColorsArray
var designsArray
var variantArray
var currentVariant = 0

function deleteNode (variantId) {
  var toDelete = document.getElementById(variantId)
  toDelete.parentNode.removeChild(toDelete)
  newColor.deleteVariant(variantId)
  variantArray.splice(variantArray.indexOf(variantId), 1)
}

module.exports = {
  show: function() {
    document.getElementById(htmlIdForThisPage).className = "section"
    // var newButtonHtml = '<p class="control"><a class="button is-info" onClick="app.showPage(\'createShirtPageId\')"><span class="icon"><i class="fas fa-plus"></i></span><strong>New</strong></a></p>'
    // document.getElementById("headerRight").innerHTML = newButtonHtml
  },
  
  hide: function() {
    document.getElementById(htmlIdForThisPage).className = "section is-hidden"
    // document.getElementById("headerRight").innerHTML = ""
  },
  
  reinitialize: function() {
    currentVariant = 0
    newColor.reinitialize()
    variantArray.forEach(function (variantId) {
      var toDelete = document.getElementById(variantId)
      toDelete.parentNode.removeChild(toDelete)
      newColor.deleteVariant(variantId)
    })
    variantArray = new Array()
    // makeVariant()
  },
  
  initializePage: function(shirt, htv, design) {
    shirtBlankColorsArray = JSON.parse(JSON.stringify(shirt))
    htvColorsArray = JSON.parse(JSON.stringify(htv))
    designsArray = JSON.parse(JSON.stringify(design))
    appendDesignsToDocument()
  },

  deleteNode: deleteNode
};

function getPicUrl(shirtBlankId, whichPic) {
  var url
  shirtBlankColorsArray.forEach(function(blank) {
    if (blank.id == shirtBlankId) {
      url = blank[whichPic]
    }
  })
  return url
}

function appendDesignsToDocument() {

  designsArray.forEach(function(design) {
    var frontPic
    var backPic
    if(!design.hasOwnProperty("frontMockupImage")) {
      frontPic = getPicUrl(design.shirtBlankId, "frontPic")
    } else frontPic = design.frontPic.url
    if(!design.hasOwnProperty("backMockupImage")) {
      backPic = getPicUrl(design.shirtBlankId, "backPic")
    } else backPic = design.backPic.url

    var newDesign = document.createElement('template');
    newDesign.innerHTML = `
            <div id="${design.id}" class="container is-widescreen notification is-info">
              <button onClick="app.deleteNode('${design.id}')" class="delete is-small"></button>
              <div class="tile is-ancestor is-block-tablet is-flex-desktop">
                <div class="tile is-parent">
                  <div class="tile is-child">
                    <p class="image">
                      <img class="rounded-picture" src="${design.frontPic.url}?fm=jpg&w=208">
                    </p>
                  </div>
                </div>
                <div class="tile is-parent">
                  <div class="tile is-child">
                    <p class="image">
                      <img class="rounded-picture" src="${design.backPic.url}?fm=jpg&w=208">
                    </p>
                  </div>
                </div>
                <div class="tile is-parent is-9">
                  <div class="tile is-child box">
                    <p class="title is-pulled-right">${design.designName}</p>
                    <div class="field">
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
    `;
  
    document.getElementById(htmlIdForThisPage).appendChild(newDesign.content.firstElementChild)
  
    // variantArray.push(variantName)
  })
}

function makeDropdown(selectorName) {

  var blankSelector = document.getElementById(selectorName).options;

  shirtBlankColorsArray.forEach(function(entry) {
    var option = document.createElement("option")
    
    option.text = entry.color
    option.value = entry.id
    option.frontPic = entry.frontPic
    option.backPic = entry.backPic
    option.brandName = entry.brandName

    blankSelector.add(option)
  })
}

function makeSecondDropdown(selectorName) {

  var blankSelector = document.getElementById(selectorName).options;

  htvColorsArray.forEach(function(entry) {
    var option = document.createElement("option")
    
    option.text = entry.color
    option.value = entry.id
    option.brandName = entry.brandName
    option.htvType = entry.htvType

    blankSelector.add(option)
  })
}
