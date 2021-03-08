var fs = require("fs");
const path = require('path');


const fileName = path.join(__dirname, 'do_not_delete', 'do_not_modify', 'serial');
const encoding = 'utf-8';

module.exports = function(numberOfSkus) {
    return new Promise((resolve, reject) => {
        makeSkus(numberOfSkus, resolve, reject);
    });
};

function makeSkus(numberOfSkus, resolve, reject) {
    fs.readFile(fileName, encoding, function(err, data) {
        if(err) {
            console.log(err);
            reject("Failed to generate fresh SKU numbers.");
        }
        let currentSerial = data;
        let skuArray = [];
        for(var i = 0; i < numberOfSkus; ++i) {
            skuArray.push(currentSerial++);
        }
        fs.writeFile(fileName, currentSerial.toString(), encoding, function(err, data) {
            if(err) {
                console.log(err);
                reject("Failed to generate fresh SKU numbers.");
            }
            resolve(skuArray);
        });
    });
}