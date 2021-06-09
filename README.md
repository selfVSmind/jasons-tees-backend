# ![Jason's Tees](public/image/jasons-tees-logo.png)

This is a custom Ebay listing tool that I built for my narrow use case. Getting everything set up for a new t-shirt listing on ebay was just painful and slow using their standard website, so I dreamed up this app that would allow me to make new listings in a matter of seconds.

I use Adobe Illustrator to create my custom graphics and an Illustrator plug-in to cut out the design on heat transfer vinyl. With this tool, I am able to upload my Illustrator files directly, make a few color choices, and upload everything to Ebay in just a few clicks!

## Back End Technology

On the back end, this web app makes use of Image Magick to convert Adobe Illustrator files into a PNG with transparency. The result is then overlayed onto a stock photo of a blank t-shirt.

The actual web server is a NodeJS program running Express.

## Front End Technology

### Original Javascript Version

The client side Javascript file for the original front end was built on NodeJS and converted for the browser on the back end using Browserify. For historical purposes, see it [here](https://t-shirts.jasonlambert.io/old-version).

### New Angular Version

I rebuilt the entire front end in Angular. I will still be adding features over time, but it is up and running right [here](https://t-shirts.jasonlambert.io/create).
