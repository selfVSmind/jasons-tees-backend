const contentful = require('contentful-management')
const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_TOKEN;

const client = contentful.createClient({
  accessToken: accessToken
})


module.exports = {
    addEbayItemGroupKey: updateShirtDesignContentfulEntryWithEbayItemGroupSku,
}

function updateShirtDesignContentfulEntryWithEbayItemGroupSku(contentfulEntryId, inventoryItemGroupKey, ebayListingId, updatedVariations) {
    console.log(contentfulEntryId)
    // Update entry
    client.getSpace(spaceId)
    .then((space) => space.getEntry(contentfulEntryId))
    .then((entry) => {
      entry.fields.ebayInventoryItemGroupKey = {}
      entry.fields.ebayInventoryItemGroupKey['en-US'] = inventoryItemGroupKey
      entry.fields.ebayListingId = {}
      entry.fields.ebayListingId['en-US'] = ebayListingId
      entry.fields.variations['en-US'] = updatedVariations
      return entry.update()
    })
    .then((entry) => entry.publish())
    .then((entry) => console.log(`Entry ${entry.sys.id} updated.`))
    .catch(console.error)
}