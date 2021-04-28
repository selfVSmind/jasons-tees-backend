# [![Jason's Tees](public/image/jasons-tees-logo.png)](https://t-shirts.jasonlambert.io)

This is a very custom ebay listing tool that I built for myself. Getting everything set up for a new t-shirt listing on ebay was just painful and slow using their standard website, so I dreamed up this app that would allow me to make new listings in a matter of seconds.

## Back End Technology

On the back end, this web app makes use of Image Magick to convert Adobe Illustrator files into a PNG with transparency. The result is then overlayed onto a stock photo of a blank t-shirt.

## Front End Technology

The client side Javascript file for [the original front end](https://t-shirts.jasonlambert.io/old-version) is built on NodeJS and converted for the browser on the back end using Browserify.

I had a hankering to learn Angular recently, so I rebuilt the entire front end in Angular. You can see that [here](https://t-shirts.jasonlambert.io).
