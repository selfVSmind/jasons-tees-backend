var shirtBlankColorsArray

module.exports = {
    show: function() {
        document.getElementById("inventoryPageId").className = "section"
    },
    
    hide: function() {
        document.getElementById("inventoryPageId").className = "section is-hidden"
    },
    
    setupInventoryTable: function(array) {
        // shirtBlankColorsArray = JSON.parse(JSON.stringify(array))
        // var tableBody = document.getElementById("inventoryTableBody")
        // shirtBlankColorsArray.forEach(function(entry) {
        //     var node = document.createElement("tr")
        //     let sizesAvailable = entry.tShirtModel.fields.sizesAvailable
        //     let theHtml = `
        //         <td>${entry.color}</td>
        //     `;
        //     for(var i = 0; i < sizesAvailable.length; ++i) {
        //         theHtml += `<td>${entry['count'+sizesAvailable[i]]}</td>`;
        //     }
        //     theHtml += `<td>${entry.model.brand} ${entry.model.mpn}</td>`;
        //     node.innerHTML = theHtml;
        //     tableBody.appendChild(node)
        // })
    }
}