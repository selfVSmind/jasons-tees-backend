var retrieveMyData = require("./myData.js");
var tShirtVariant = require("./tShirtVariant.js");
var tShirtDesign = require("./listTShirtDesigns.js");
var inventoryTable = require("./inventoryTable.js");
var saveTshirtDesign = require('./saveTshirtDesign.js');

const pages = {['myDesignsPageId']: tShirtDesign, ['createShirtPageId']: tShirtVariant, ['inventoryPageId']: inventoryTable} //ADD THESE  activeEbay, activeAll, activeEtsy, inventoryAll
var myGlobalDataObject;

retrieveMyData()
.then((globalDataObject) => {
  myGlobalDataObject = globalDataObject;
  // console.log(JSON.stringify(globalDataObject, null, 2))
  tShirtDesign.initializePage(myGlobalDataObject.tShirtBlanks, myGlobalDataObject.heatTransferVinyls, myGlobalDataObject.myShirtDesigns)
  tShirtVariant.setupNewShirtPage(myGlobalDataObject)
  // saveTshirtDesign.setupTShirtModelArray(shirtModelsArray)
  showPage('createShirtPageId')
  inventoryTable.setupInventoryTable(myGlobalDataObject.tShirtBlanks)
})
.catch((err) => {
  console.log(err);
});

document.addEventListener('DOMContentLoaded', () => {

  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {

  // Add a click event on each of them
  $navbarBurgers.forEach( el => {
      el.addEventListener('click', () => {

      // Get the target from the "data-target" attribute
      const target = el.dataset.target;
      const $target = document.getElementById(target);

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');

      });
  });
  }

});

window.onload = () => {
  // // just a little trick.. i don't have access to <far fa-info-circle> so foneawesome defaults it to a neat animation
  // document.getElementById("about-link-icon").className = "far fa-info-circle";

  // font awesome doesn't provide a logo for okta so.... TAKE THAT
  FontAwesome.library.add({
    prefix: 'fac',
    iconName: 'okta',
    icon: [640, 512, [], 'e001', 'M81.4,202.9c-44.3,0-80.2,35.9-80.2,80.2s35.9,80.2,80.2,80.2s80.2-35.9,80.2-80.2S125.7,202.9,81.4,202.9z M81.4,323.2\
    c-22.2,0-40.2-18-40.2-40.2s18-40.2,40.2-40.2s40.2,18,40.2,40.2S103.5,323.2,81.4,323.2z M222.3,310c0-6.4,7.7-9.4,12.1-4.9\
    c20.1,20.4,53.2,55.5,53.4,55.6c0.5,0.5,1,1.3,2.9,1.9c0.8,0.3,2.1,0.3,3.5,0.3h36.2c6.5,0,8.4-7.5,5.4-11.3l-59.9-61.4l-3.2-3.2\
    c-6.9-8.1-6.1-11.3,1.8-19.6l47.5-53.1c3-3.8,1.1-11.2-5.6-11.2h-32.8c-1.3,0-2.2,0-3.2,0.3c-1.9,0.6-2.7,1.3-3.2,1.9\
    c-0.2,0.2-26.5,28.5-42.7,45.9c-4.5,4.8-12.4,1.6-12.4-4.9v-91c0-4.6-3.8-6.4-6.9-6.4h-26.8c-4.6,0-6.9,3-6.9,5.7v201.8\
    c0,4.6,3.8,5.9,7,5.9h26.8c4.1,0,6.9-3,6.9-6.1v-2.1V310H222.3z M441,355.6l-2.9-26.8c-0.3-3.7-3.8-6.2-7.5-5.6\
    c-2.1,0.3-4.1,0.5-6.2,0.5c-21.4,0-38.7-16.7-40-37.9c0-0.6,0-1.4,0-2.2v-32.8c0-4.3,3.2-7.8,7.5-7.8h35.9c2.6,0,6.4-2.2,6.4-6.9\
    v-25.3c0-4.9-3.2-7.5-6.1-7.5h-36.2c-4.1,0-7.5-3-7.7-7.2v-40.6c0-2.6-1.9-6.4-6.9-6.4h-26.6c-3.3,0-6.5,2.1-6.5,6.2\
    c0,0,0,129.9,0,130.5c1.1,43.4,36.7,77.9,80.2,77.9c3.7,0,7.2-0.3,10.7-0.8C438.9,362.4,441.5,359.2,441,355.6z M634.2,321.9\
    c-22.6,0-26.1-8.1-26.1-38.6c0-0.2,0-0.2,0-0.3v-73.2c0-2.6-1.9-6.9-7-6.9h-26.8c-3.3,0-7,2.7-7,6.9v3.3\
    c-11.6-6.7-25.2-10.5-39.5-10.5c-44.3,0-80.2,35.9-80.2,80.2s35.9,80.2,80.2,80.2c19.9,0,38.1-7.3,52.1-19.3\
    c7.5,11.5,19.6,19.1,38.6,19.3c3.2,0,20.4,0.6,20.4-7.5V327C638.8,324.6,636.9,321.9,634.2,321.9z M527.8,323.2\
    c-22.2,0-40.2-18-40.2-40.2c0-22.2,18-40.2,40.2-40.2s40.2,18,40.2,40.2C567.9,305.2,549.8,323.2,527.8,323.2z']
  });
  document.getElementById("okta-logo").className = "fac fa-okta fa-2x";

  fetch('/checkKeyGraphic')
  .then(response => response.json())
  .then(response => {
    if(response.haveGraphic) {
      var element = document.getElementById("keyGraphic");
      element.src = response.assetUrl+"?time="+ new Date().getTime();
    }
  })
  .catch((error) => {
    console.error(error);
  });
};

var currentPage = "";

function showPage(newPageId) {
  if(!pages.hasOwnProperty([newPageId])) return
  else if(currentPage == newPageId) return
  else {
    if(!pages.hasOwnProperty([currentPage])) currentPage = newPageId
    pages[currentPage].hide()
    pages[newPageId].show()
    currentPage = newPageId
  }
}

function resetShirtsVariants() {tShirtVariant.reinitialize()}

module.exports = {
  // client: client,
  newColor: tShirtVariant.newColor,
  addVariant: tShirtVariant.makeVariant,
  deleteNode: tShirtVariant.deleteNode,
  uploadz: tShirtVariant.uploadToServer,
  showPage: showPage,
  resetShirtsVariants: resetShirtsVariants,
  newGender: tShirtVariant.genderChanged,
  saveButtonWasPressed: saveTshirtDesign.saveTheDesign,
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
}

document.onkeydown = function(evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key == "Escape" || evt.key == "Esc");
    } else {
        isEscape = (evt.keyCode == 27);
    }
    if (isEscape) {
      var modal = document.getElementById("resetShirtVariantsModal")
      if(modal.className == "modal is-active") {
        modal.className = "modal";
      }
    }
};
