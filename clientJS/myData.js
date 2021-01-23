function compare(a,b) {
  if(a.tShirtModelId < b.tShirtModelId) {
    return -1;
  } else if(a.tShirtModelId > b.tShirtModelId) {
    return 1;
  }
  
  if(a.color < b.color) {
    return -1;
  } else if(a.color > b.color) {
    return 1;
  }else return 0;
}

module.exports = function() {
    var globalDataObject = {};

    globalDataObject.tShirtModels = [];
    globalDataObject.tShirtBlanks = [];
    globalDataObject.heatTransferVinyls = [];
    globalDataObject.myShirtDesigns = [];

    return new Promise((resolve, reject) => {
        // Get data from Contentful and initialize everything
        fetch("/getContentfulEntries")
        .then(response => response.json())
        .then((entries) => {
        
          entries.items.forEach(function (entry) {
            switch(entry.sys.contentType.sys.id) {
              case 'tShirtBlank':
                var x = JSON.parse(JSON.stringify(entry.fields));
                delete x.front;
                delete x.back;
                delete x.tShirtModel;
                x.modelId = entry.fields.tShirtModel.sys.id;
                x.frontPic = {"url": entry.fields.front.fields.file.url, "id": entry.fields.front.sys.id};
                x.backPic = {"url": entry.fields.back.fields.file.url, "id": entry.fields.back.sys.id};
                x.id = entry.sys.id;
                globalDataObject.tShirtBlanks.push(x)
                break;
              case 'tShirtModel':
                var sizeChart = {"url": 'https:'+entry.fields.sizeChart.fields.file.url, "id": entry.fields.sizeChart.sys.id};
                var x = entry.fields;
                delete x.sizeChart;
                x.sizeChart = sizeChart;
                x.id = entry.sys.id;
                globalDataObject.tShirtModels.push(x);
                break;
              case 'heatTransferVinyl':
                var x = entry.fields;
                x.id = entry.sys.id;
                globalDataObject.heatTransferVinyls.push(x)
                break;
              case 'tShirtDesign':
                var x = entry.fields;
                x.frontPic = {"url": entry.fields.frontMockupImage.fields.file.url, "id": entry.fields.frontMockupImage.sys.id};
                x.backPic = {"url": entry.fields.backMockupImage.fields.file.url, "id": entry.fields.backMockupImage.sys.id};
                x.designFile = {"url": entry.fields.projectFiles[0].fields.file.url, "id": entry.fields.projectFiles[0].sys.id};
                delete x.projectFiles;
                delete x.backMockupImage;
                delete x.frontMockupImage;
                x.id = entry.sys.id;
                globalDataObject.myShirtDesigns.push(x)
                break;
            }
          });

          //then iterate through shirtBlankColorsArray and add matching demographic+ other junks from shirtModelsArray
        //   globalDataObject.tShirtBlanks.forEach(function (blank) {
        //     globalDataObject.tShirtModels.forEach(function (model) {
        //       if(blank.modelId == model.id) {
        //         blank.model = model;
        //         // Object.assign(blank, model);
        //       };
        //     });
        //   });
        
          globalDataObject.tShirtBlanks.sort(compare);
          globalDataObject.heatTransferVinyls.sort(compare);
          
          resolve(globalDataObject);
        })
        .catch((err) => {
            reject(err);
        })
    });    
};
