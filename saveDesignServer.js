const contentful = require('contentful-management')
const crypto = require('crypto');
const fullSizeMockup = require("./getMockupWithColorServer.js").fullSizeMockup
const createEbayListing = require("./ebay/createEbayListing.js");

const client = contentful.createClient({
	accessToken: process.env.CONTENTFUL_MAN_TOKEN
})

module.exports = function(req, res) {
  // req.body.designSpecs.variations.splice(1) //faster testing
    res.send("Processing request.");
    // uploadToContentful(req.sessionID, req.body.designSpecs.title, req.body.designSpecs.ebayTitle, "", req.body.designSpecs.theme, req.body.designSpecs.designFile.designFileId, req.body.designSpecs.variations, req.body.blankShirtArray)
    uploadToContentful(req.sessionID, req.body.designSpecs.title, req.body.designSpecs.ebayTitle, "", req.body.designSpecs.theme, req.session.keyGraphicId, req.body.designSpecs.variations, req.body.blankShirtArray)
    .then(value => {
      return createEbayListing(req.session.ebayRefreshToken, value, req.body);
    })
    .then((designEntry) => {
      // res.send(designEntry);
    })
    .catch((error) => {
      console.log(error);
      // res.send(error);
    });
};

function uploadToContentful(sessionID, designName, ebayTitle, descriptiveTitle, theme, designFileId, variations, shirtBlankArray) {
  return new Promise((uploadedToContentful) => {
    let variationsPromiseArray = createAndUploadVariations(sessionID, variations, shirtBlankArray);
    let myVariationsArray = JSON.parse(JSON.stringify(variations))
    Promise.all(variationsPromiseArray).then((value) => {
      for(var i = 0; i < myVariationsArray.length; ++i) {
        if(value[i].variationName == myVariationsArray[i].variantName) myVariationsArray[i].variationMockup = value[i].variationMockup;
      }
    }).then(function() {
      for(var i = 0; i < myVariationsArray.length; ++i) {
        delete myVariationsArray[i].variantName
        delete myVariationsArray[i].blankUrl
        delete myVariationsArray[i].hexColor
      }
      
      var backMockupImage
      shirtBlankArray.forEach(function(blank) {
        if(myVariationsArray[0].blankId == blank.id) backMockupImage = blank.backPic.id;
      })
      
      // Create entry
      client.getSpace(process.env.CONTENTFUL_SPACE_ID)
      .then((space) => space.createEntryWithId('tShirtDesign', crypto.createHash('md5').update(new Date().getTime().toString()).digest('hex'), {
        fields: {
          designName: {
            'en-US': designName
          },
          descriptiveTitle: {
            'en-US': descriptiveTitle
          },
          ebayListingTitle: {
            'en-US': ebayTitle
          },
          mediaType: {
            'en-US': 'htv'
          },
          theme: {
            'en-US': theme
          },
          projectFiles: {
            'en-US': [
              {
                "sys": {
                  "id": designFileId,
                  "linkType": "Asset",
                  "type": "Link"
                }
              }
            ]
          },
          frontMockupImage: {
            'en-US': {
                "sys": {
                  "id": myVariationsArray[0].variationMockup.id,
                  "linkType": "Asset",
                  "type": "Link"
                }
              }
          },
          backMockupImage: {
            'en-US': {
                "sys": {
                  "id": backMockupImage,
                  "linkType": "Asset",
                  "type": "Link"
                }
              }
          },
          variations: {
            'en-US': myVariationsArray
          }
        }
      }))
      .then((entry) => entry.publish())
      .then((entry) => {
        // console.log(entry)
        uploadedToContentful(entry)
      })
      .catch(console.error)
      
    })
    // var variationsJSON = new Array();
    // for(var i = 0; i < variationsIdArray.length; ++i) {
    //   variationsJSON.push({"sys": {"id": variationsIdArray[i], "linkType": "Entry", "type": "Link"}});
    // }
  })
}

function getGeometry(id, shirtBlankArray) {
  for(var i = 0; i < shirtBlankArray.length; ++i) {
    if(shirtBlankArray[i].id == id) {
      return shirtBlankArray[i].mockupOverlayGeometry.width+"x"+shirtBlankArray[i].mockupOverlayGeometry.height+"+"+shirtBlankArray[i].mockupOverlayGeometry.x+"+"+shirtBlankArray[i].mockupOverlayGeometry.y
    }
  }
}

function createAndUploadVariations(sessionID, variations, blankShirtArray) {
  var promiseArray = new Array();
  for(var i = 0; i < variations.length; ++i) {
    var variantPromise = fullSizeMockup(sessionID, variations[i].blankUrl, variations[i].htvId, variations[i].blankId, variations[i].variantName)
    promiseArray.push(variantPromise)
  };
  return promiseArray;
}
