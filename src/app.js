#!/usr/bin/env node
// shebang

// const { createCanvas, loadImage, Image } = require('canvas')
const canvas = require('canvas');

const fs = require('fs');
// we need fs to read the image & redraw it onto canvas

const yargs = require('yargs');
// yargs allows us to configure for arguments 
// we need to accept multiple arguments for business info (5x mandatory & 3x optional) and a JSON object (mandatory)  
// we need to accept 1 x mandatory argument for JSON file path 
// we need to accept 1 x optional argument for Locale tag (language) 

const options = yargs
.usage("Usage: -n <name>")
.option("o", {alias: "order", describe: "JSON file path", type: "string", demandOption: true})
.option("n", {alias: "name", describe: "Your name - 20 char limit", type: "string", demandOption: true})
.option("a", {alias: "address1", describe: "Number, Street, City - 53 char limit", type: "string", demandOption: true})
.option("b", {alias: "address2", describe: "Country & UK postcode - 53 char limit", type: "string", demandOption: true})
.option("v", {alias: "vat", describe: "VAT number", type: "string", demandOption: true})
.option("i", {alias: "image", describe: "url to image for logo", type: "string", demandOption: true})
.option("t", {alias: "telephone", describe: "Telephone number", type: "number", demandOption: false })
.option("w", {alias: "website", describe: "Website - 48 char limit", type: "string", demandOption: false})
.option("t", {alias: "topMessage", describe: "Top Message - 30 char limit", type: "string", demandOption: false})
.option("l", {alias: "locale", describe: "locale tag", type: "string", demandOption: false})
.choices("l", ["en", "de", "zh"])
.argv;
 
// TOO: The Order info: Class that takes JSON file path - do we need to use fs function fs.createReadFileStream

// check
console.log(`Business name: ${options.name}, Address: ${options.address1 + " "  + options.address2}, VAT: ${options.vat}, Logo/Image URL: ${options.image}`);

// validates mandatory CLI arguments with char limit
const validate = (arg, limit = 53) => {
  try {
    if (options[arg].length > limit) {
      throw new Error( `${arg} exceeds ${limit} character limit. Valid input required.` );
      // throw new Error exposes an error event with two params name & message. It also terminates further execution. 
    }
  } catch (err) {
      console.log(err.name, err.message);
  }
}

validate("name", 20); 
validate("address1");
validate("address2");
validate("vat");
validate("telephone");
validate("website");
validate("topMessage", 30);

// resize logo
// gets original dimensions of image
let oWidth; 
let oHeight; 

const img = new canvas.Image();
// TODO: check if this is async
img.onload = function() {
  oWidth = this.width
  oHeight = this.height;
}
img.src = options.image;

// calculate scale  
const logoWidth = 448;
const logoHeight = 120;

function diff (a,b) {
  return Math.abs(a-b);
}

const determineScale = () => {
  let widthDiff = diff(logoWidth, oWidth);
  let heightDiff = diff(logoHeight, oHeight);

  if (widthDiff <= heightDiff) {
    return oWidth/logoWidth;  
  } else {
    return oHeight/logoHeight; 
  }
}
let scale = determineScale(); 
const newWidth = oWidth * scale 
const newHeight = oHeight * scale 


// format business info
const formatVAT = () => {
  return `VAT NO: ${options.vat}`;
}

const formatTelephone = () => {
  if (options.telephone) {
    return `Tel: ${options.telephone}`;  
  } else {
    return null; 
  }
}

const formatWebsite = () => {
  if (options.website) {
    return `Website: ${options.website}`;  
  } else {
    return null; 
  }
}

// calculate height of business info
const marginHeight = 60;

const calcBusHeight = () => {
  let busInfoHeight = 40 + 20 + 20 + 20 + 20;  // 100 incl. line break

  if (options.website || options.telephone) {
    busInfoHeight =+ 20  // space break 
  }
  if (options.telephone) {
    busInfoHeight =+ 20 
  }
  if (options.website) {
    busInfoHeight =+ 20 
  }
  if (options.topMessage) {
    busInfoHeight =+ 30 + 40 // inc. dotted line & space break 
  }
  return busInfoHeight;
}
let busInfoHeight = calcBusHeight();

// format all other data (order information, payment information, optional message) before we start drawing. 

// draws blank canvas
const width = 568
const height = totalHeight // to be calculated once all data formatted 
const canvas = canvas.createCanvas(width, height)
const context = canvas.getContext('2d')

// draw logo
canvas.loadImage(options.image)
.then(image => {
    console.log("image loaded");
    context.drawImage(image, 284, 120, newWidth, newHeight) 
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync('./image.png', buffer)
})
.catch(error => {console.log(error)});
// TODO: check if we really need to 'load' the image again 

// draw company name (title)
context.font = 'bold 36pt Menlo'
context.textAlign = 'center'
context.fillStyle = '#e74c3c'
context.fillText(options.name, 284, marginHeight + logoHeight + 20)

// draw business info 
const busText = options.address1 + options.address2 + formatVAT() /*+ SPACE */ + formatTelephone() + formatWebsite() /* + SPACE */
context.font = '14pt Menlo'
context.textAlign = 'center'
context.fillStyle = '#e74c3c'
context.fillText(busText, 284, marginHeight + logoHeight + busInfoHeight/2 ) 

// draw optional top message 
const drawTopMessage = () => {
  if (options.topMessage) {
  let message = options.topMessage + linebreak
    context.font = 'bold 24pt Menlo'
    context.textAlign = 'center'
    context.fillStyle = '#e74c3c'
    context.fillText(message, 284, marginHeight + logoHeight + busInfoHeight - 15)
  }
}
drawTopMessage(); 

// draw dotted line break
const dotBreak = '-----------------------------' // +  SPACE
context.font = '14pt Menlo'
context.textAlign = 'center'
context.fillStyle = '#e74c3c'
context.fillText(dotBreak, 284, marginHeight + logoHeight + busInfoHeight + 20) 


