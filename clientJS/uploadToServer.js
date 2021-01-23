var updateMockupImage = require("./updateMockupImage.js")

module.exports = function (elementId, frontORback, element, description) {
  var file = element.files[0];
  var pictureToUpdate = element.previousElementSibling.childNodes[1].id
  var hiddenElement = document.getElementById(elementId + frontORback + "PlaceHolder")

var pic = document.getElementById(pictureToUpdate)
  pic.src = "/image/whiteBlank.jpg"
  pic.className = "is-hidden"
  hiddenElement.className = "myLoader"

  // This code is only for demo ...
  console.log("name : " + file.name);
  console.log("size : " + file.size);
  console.log("type : " + file.type);
  // console.log("date : " + file.lastModified);

  let formData = new FormData();
  formData.append('photo', file);
  fetch('/upload', {method: 'POST', body: formData})
  .then(response => response.json())
  .then(filePath => {
    console.log(filePath);
    let regex = /\/uploads\/(.+)$/;
    let assetUrl = encodeURI("https://t-shirts.jasonlambert.io" + regex.exec(filePath)[0]);
    console.log(assetUrl)

    if(elementId == "keyGraphic") {
      var regexExt = /(?:\.([^.]+))?$/;
      var fileExtension = regexExt.exec(filePath)[1];   

      updateMockupImage.updateKeyGraphicImage(pictureToUpdate, hiddenElement, assetUrl, null, fileExtension);
    } else {
      updateMockupImage.updateMockShirtImage(pictureToUpdate, hiddenElement, assetUrl, null);
    }
    
    // return asset;
  })
  .catch((error) => {
    console.error(error);
    module.exports(elementId, frontORback, element, description);
  });
};
