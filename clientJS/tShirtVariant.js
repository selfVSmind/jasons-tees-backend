var newColor = require("./newColor.js");
var uploadToServer = require("./uploadToServer.js");
const appCreateShirt = "createShirtPageId";

var shirtBlankColorsArray, tShirtModelsArray, htvColorsArray, variantArray;
var currentVariant = 0
var demographic = ""

function deleteVariant (variantId) {
  var toDelete = document.getElementById(variantId)
  toDelete.parentNode.removeChild(toDelete)
  newColor.deleteVariant(variantId)
  variantArray.splice(getVariantIndexByVariantId(variantId), 1);
};

function getVariantIndexByVariantId(variantId) {
  for(var i = 0; i < variantArray.length; ++i){
    if(variantArray[i].variantName == variantId) return i;
  };
};

module.exports = {
  newColor: {
    newBlankColor: function(variantId) {
      var response = newColor.newBlankColor(variantId);
      variantArray[getVariantIndexByVariantId(variantId)].blankId = response.blankId;
      variantArray[getVariantIndexByVariantId(variantId)].blankUrl = response.blankUrl;
      variantArray[getVariantIndexByVariantId(variantId)].descriptiveText = response.descriptiveText;
    },
    newHtvColor: function(variantId) {
      var response = newColor.newHtvColor(variantId);
      variantArray[getVariantIndexByVariantId(variantId)].htvId = response.htvId;
      variantArray[getVariantIndexByVariantId(variantId)].hexColor = response.hexColor;
      variantArray[getVariantIndexByVariantId(variantId)].descriptiveText = response.descriptiveText;
    }
  },

  uploadToServer: uploadToServer,

  getHtvArray: function() {return htvColorsArray;},
  getBlankShirtArray: function() {return shirtBlankColorsArray;},
  getModelsArray: function() {return tShirtModelsArray;},
  getVariantArray: function() {return variantArray;},
  
  show: function() {
    document.getElementById(appCreateShirt).className = ""
    // var saveButtonHtml = '<p class="control"><a class="button is-danger" onClick="document.getElementById(\'resetShirtVariantsModal\').className = \'modal is-active\'"><span class="icon"><i class="fas fa-sync-alt"></i></span><strong>Reset</strong></a></p><p class="control"><a class="button is-info" onClick="app.saveButtonWasPressed()"><span class="icon"><i class="fas fa-save"></i></span><strong>Save</strong></a></p>'
    // document.getElementById("designSaveResetButtons").innerHTML = saveButtonHtml
  },
  
  hide: function() {
    document.getElementById(appCreateShirt).className = "is-hidden"
    // document.getElementById("designSaveResetButtons").innerHTML = ""
  },
  
  setupNewShirtPage: function(globalDataObject) {
    document.getElementById("genderSelector").options.selectedIndex = 0;

    htvColorsArray = new Object();
    shirtBlankColorsArray = new Object();
    variantArray = new Array();
    this.setupBlankColorsArray(globalDataObject.tShirtBlanks);
    this.setupTShirtModelsArray(globalDataObject.tShirtModels);
    this.setupHtvColorsArray(globalDataObject.heatTransferVinyls);
    this.reinitialize();
  },
  
  reinitialize: function(skipGender) {
    currentVariant = 0
    newColor.reinitialize()
    variantArray.forEach(function (variant) {
      var toDelete = document.getElementById(variant.variantName)
      toDelete.parentNode.removeChild(toDelete)
      newColor.deleteVariant(variant.variantName)
    })
    variantArray = new Array();
    if(!skipGender)makeGenderDropdown("genderSelector");
  },
  
  setupBlankColorsArray: function (array) {
    shirtBlankColorsArray = JSON.parse(JSON.stringify(array));
  },
  
  setupTShirtModelsArray: function (array) {
    tShirtModelsArray = JSON.parse(JSON.stringify(array));
  },
  
  setupHtvColorsArray: function (array) {
    htvColorsArray = JSON.parse(JSON.stringify(array));
  },
  
  makeVariant: makeVariant,
  deleteNode: deleteVariant,

  genderChanged: function(element) {
    var selectedValue = element.options[element.options.selectedIndex].value;
    if(selectedValue == "sample") {
        element.parentElement.setAttribute("class", "select is-danger");
    }
    else {
        element.parentElement.setAttribute("class", "select");
        if(element.options[0].value == "sample") {
          element.remove(0);
        };
        switch(selectedValue) {
          case "female":
            demographic = "Ladies";
            break;
          case "male":
            demographic = "Men";
            break;
          case "youth":
            demographic = "Children";
            break;
          case "toddler":
            break;
          case "infant":
            break;
          default:
            demographic = "";
            break;
        };

        module.exports.reinitialize(true);
        makeVariant();
    };
  }
};

function makeVariant() {

  var appendBeforeNodeId = "addVariant"
  var parentNodeId = "parentNode"
  var variantName = ""
  
  if (currentVariant == 0) {
    variantName = "originalVariant"
    currentVariant++
  }
  else variantName = "variant" + currentVariant++
  
  var newVariant = document.createElement('template');
  newVariant.innerHTML = `
          <div id="${variantName}" class="container is-widescreen notification is-info">
            <button onClick="app.deleteNode('${variantName}')" class="delete is-small"></button>
            <div class="tile is-ancestor is-block-tablet is-flex-desktop">
              <div class="tile is-parent is-7">
                <div class="tile is-child box">
                  <p class="title">Specifics</p>
                  <div class="field">
                    <label class="label">Variant Name</label>
                    <p class="control is-expanded">
                      <input id="${variantName}VariantName" class="input" type="text" placeholder="Pikachu on Ice">
                    </p>
                  </div>
                  <div class="field">
                    <label class="label">Color</label>
                    <p class="control has-icons-left">
                      <span class="select is-danger">
                        <select id="${variantName}BlankSelector" onChange="app.newColor.newBlankColor('${variantName}');">
                          <option value="sample">Choose Blank</option>
                        </select>
                      </span>
                      <span class="icon is-small is-left">
                        <i class="fas fa-tshirt"></i>
                      </span>
                    </p>
                    <p class="control has-icons-left">
                      <span class="select">
                        <select id="${variantName}HtvSelector" onChange="app.newColor.newHtvColor('${variantName}');">
                          <option value="sample">Choose HTV</option>
                        </select>
                      </span>
                      <span class="icon is-small is-left">
                        <i class="fas fa-palette"></i>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div class="tile is-parent">
                <div class="tile is-child box">
                  <p class="title is-pulled-right">Front</p>
                  <p class="image">
                    <label for="${variantName}FileInputFrontPic">
                      <img id="${variantName}FrontPic" value="noperz" class="shirtPics" src="image/sampleShirtFrontSmall.jpg">
                    </label>
                    <input type="file" style="display:none;" id="${variantName}FileInputFrontPic" onChange="app.uploadz('${variantName}', 'FrontPic', this)" />
                    <img id="${variantName}FrontPicPlaceHolder" class="is-hidden" src="image/whiteBlank.jpg">
                  </p>
                </div>
              </div>
              <div class="tile is-parent is-hidden-touch">
                <div class="tile is-child box">
                  <p class="title is-pulled-right">Back</p>
                  <p class="image">
                    <label for="${variantName}FileInputBackPic">
                      <img id="${variantName}BackPic" value="noperz" class="shirtPics" src="image/sampleShirtBackSmall.jpg">
                    </label>
                    <input type="file" style="display:none;" id="${variantName}FileInputBackPic" onChange="app.uploadz('${variantName}', 'BackPic', this)" />
                    <img id="${variantName}BackPicPlaceHolder" class="is-hidden" src="image/whiteBlank.jpg">
                  </p>
                </div>
              </div>
            </div>
          </div>
  `;

  var appendBeforeNode = document.getElementById(appendBeforeNodeId);
  var theParentNode = document.getElementById(parentNodeId);

  theParentNode.insertBefore(newVariant.content.firstElementChild, appendBeforeNode);
  variantArray.push({"variantName":variantName})
  makeDropdown(variantName + "BlankSelector")
  makeSecondDropdown(variantName + "HtvSelector")
}

function makeDropdown(selectorName) {

  var blankSelector = document.getElementById(selectorName).options;

  shirtBlankColorsArray.forEach(function(shirtBlank) {
    var model = getModel(shirtBlank.modelId, tShirtModelsArray);

    if(model.demographic == demographic) {

      var shirtBlankOption = document.createElement("option")
      shirtBlankOption.text = shirtBlank.humanReadableName
      shirtBlankOption.value = shirtBlank.id
      shirtBlankOption.frontPic = shirtBlank.frontPic.url
      shirtBlankOption.backPic = shirtBlank.backPic.url
      shirtBlankOption.color = shirtBlank.color
      shirtBlankOption.brandName = model.brand
      shirtBlankOption.modelId = shirtBlank.id

      blankSelector.add(shirtBlankOption)
    }
  })
}

function makeSecondDropdown(selectorName) {

  var blankSelector = document.getElementById(selectorName).options;

  htvColorsArray.forEach(function(entry) {
    var htvColorOption = document.createElement("option")
    
    htvColorOption.text = entry.color
    htvColorOption.value = entry.id
    htvColorOption.hexColor = entry.pantoneEquivalentValue
    htvColorOption.brandName = entry.brandName
    htvColorOption.htvType = entry.htvType
    htvColorOption.modelId = entry.id

    blankSelector.add(htvColorOption)
  })
}

function makeGenderDropdown(selectorName) {

  var genderSelector = document.getElementById(selectorName);
  
  // remove all options!
  genderSelector.options.length = 0;

  // here are the new options  
  var demoOptions = {sample: "Choose Demographic", male: "Male", female: "Female"}
  
  Object.keys(demoOptions).forEach(function(key) {
    var option = document.createElement("option");
    option.text = demoOptions[key];
    option.value = key;
    genderSelector.options.add(option);
  });

  module.exports.genderChanged(genderSelector);
}

function getModel(id, modelsArray) {
  for(let model in modelsArray) {
    if(modelsArray[model].id == id) return modelsArray[model];
  }
}