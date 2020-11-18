#!/usr/bin/env node
// shebang

const canvas = require('canvas');
const fs = require('fs');
const yargs = require('yargs');
// we need to accept multiple arguments for business info (5x mandatory & 3x optional) and a JSON object (mandatory)  
// we need to accept 1 x mandatory argument for JSON file path 
// we need to accept 1 x optional argument for Locale tag (language) 

// configure for CLI arguments via yargs 
const options = yargs
.usage("Usage: -n <name>")
.option("o", {alias: "order", describe: "JSON file path", type: "string", demandOption: true})
.option("n", {alias: "name", describe: "Your name - 20 char limit", type: "string", demandOption: true})
.option("a", {alias: "address1", describe: "Number, Street, City - 53 char limit", type: "string", demandOption: true})
.option("d", {alias: "address2", describe: "Country & UK postcode - 53 char limit", type: "string", demandOption: true})
.option("v", {alias: "vat", describe: "VAT number", type: "string", demandOption: true})
.option("i", {alias: "image", describe: "url to image for logo", type: "string", demandOption: true})
.option("p", {alias: "phone", describe: "Phone number", type: "string", demandOption: false })
.option("w", {alias: "website", describe: "Website - 48 char limit", type: "string", demandOption: false})
.option("t", {alias: "topMessage", describe: "Top Message - 30 char limit", type: "string", demandOption: false})
.option("b", {alias: "botMessage", describe: "Bottom Message - 30 char limit", type: "string", demandOption: false})
.option("l", {alias: "locale", describe: "locale tag", type: "string", demandOption: false})
.choices("l", ["en", "de", "zh"])
.argv;
 
// check
console.log(`Business name: ${options.name}, Address: ${options.address1 + " "  + options.address2}, VAT: ${options.vat}, Logo/Image URL: ${options.image}`);
console.log(`Website: ${options.website}, Phone: ${options.phone}, Message1: ${options.topMessage}, Message2: ${options.botMessage}`);

// import JSON object
const orderObj = require(options.order);

// instantiation of imported classes
let importObject = require('./business'); 
const BusinessInfo = importObject.object; 
const business = new BusinessInfo(options); 

importObject = require('./items'); 
const Items = importObject.object; 
const order = new Items(orderObj); 

importObject = require('./payment');
const Payment = importObject.object; 
const payment = new Payment(orderObj, order.grandTotal); 



// sets heights for elements 
const margin = 60;

const maxSpacing = 40;
const midSpacing = 30;
const minSpacing = 20;
const linebreak = 20; 
const dottedLineBreak = 20; 

const logoContainerHeight = 120;
const logoSize = business.getNewDimensions(options.image); 
// returns object with new width & height values  

// calculates total height to determine canvas height
const mandInfoHeight = 3 * minSpacing; 
const optInfoHeight = (business.countOptInfo() * minSpacing); 
const messagesHeight = (business.countMessages() * midSpacing);
const itemsHeight = (2 * minSpacing) + (4 * linebreak) + (order.numberItems * minSpacing) + midSpacing + dottedLineBreak; 
const paymentHeight = (3 * linebreak)  + midSpacing + (2 * minSpacing); 
const stampHeight = 1 * minSpacing; 
let totalHeight = margin + logoContainerHeight + maxSpacing + mandInfoHeight + optInfoHeight + messagesHeight + itemsHeight + paymentHeight + stampHeight;

const canvasWidth = 568;
const canvasHeight = totalHeight; 
let centrepoint = canvasWidth/2 



// functions
// TODO: these can be extracted into another module to clean up the main app.js
const generateTimeStamp = () => {
  const today = new Date();
  const date = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return date + " " + time; 
}

const drawLogo = async function (url) { 
  await canvas.loadImage(url)
  // note that the loading of an image is always async 
  .then(image => {
      console.log("image loaded");
      console.log("new sizes: " + logoSize.width + ", " + logoSize.height); 
      let x = centrepoint - (logoSize.width/2);
      context.drawImage(image, x, y, logoSize.width, logoSize.height); 
      const buffer = mainCanvas.toBuffer('image/png'); // creates buffer object representing image in the canvas 
      fs.writeFileSync('./receipt.png', buffer); // fs.writeFileSync(file, data, options) creates a new file if the specified file does not exist. 
      y = y + logoContainerHeight + maxSpacing; 
      return y; 
  })
  .catch(error => {
    console.log(error)
  });
}

const drawDottedLine = () => {
  const dotBreak = '---------------------------------------';
  context.textAlign = 'center'
  context.font = '14pt Menlo';
  context.fillText(dotBreak, centrepoint, y); 
  y = y + linebreak + minSpacing; 
  return y; 
}

const drawOptInfo = () => {
  if (optBusText) {
    context.fillText(optBusText, centrepoint, y); 
    y = y + optInfoHeight + maxSpacing; 
  }
  return y; 
}

const drawTopMessage = () => {
  if (options.topMessage) {
    context.font = 'bold 24pt Menlo';
    context.fillText(options.topMessage, centrepoint, y);
    y = y + midSpacing; 
    return y; 
  }
}

const drawBotMessage = () => {
  if (options.botMessage) { 
    context.font = '24pt Menlo'
    context.fillText(options.botMessage, centrepoint, y)
    y = y + midSpacing; 
    drawDottedLine();
  }
}



// validates CLI arguments and reassigns reformatted value 
let arguments = ["address1", , "address2", "vat", "phone", "website"];
arguments.forEach(item => options[item] = business.validate(item));
business.validate("name", 20); 
business.validate("topMessage", 30);
business.validate("botMessage", 30);

// retrieves formatted business information via getters on the business class 
const mandBusText = business.address + business.vat;
const optBusText = business.phone + business.website; 

// retrieves formatted order info via methods on the order class  
const grandTotal = order.grandTotal;
const items = order.itemsCol();
const quantities = order.quantityCol();
const values = order.valueCol();
const totals = order.totalCol();

// generates payment information via methods on the payment class 
let paymentHeader = payment.type.toUpperCase();
let paymentText = payment.formatText(); 

// generates date & time stamp
const timeStamp = generateTimeStamp(); 



// beginning of drawing 
// note that optional information such as Messages are wrapped in functions to allow for 'if' statements 

let y  = margin // running height
// Note that after each drawn element, y to be incremented by the difference from the previous drawing start point and next drawing start point 

// draw blank canvas
const mainCanvas = canvas.createCanvas(canvasWidth, canvasHeight);
const context = mainCanvas.getContext('2d');  // getContext() allows us access to the canvas tags 2D drawing functions 
context.fillStyle = '#ffffff' // hexadecimal colour code (white) 
context.fillRect(0, 0, 568, 2000)

// draw logo to canvas
console.log()
drawLogo(options.image);

// draw company name (title)
context.font = 'bold 36pt Menlo'
context.textAlign = 'center'
context.fillStyle = '#000000'
context.fillText(options.name, centrepoint, y)
y = y + linebreak + minSpacing;

// draw mandatory business info 
context.font = '14pt Menlo'
context.fillText(mandBusText, centrepoint, y); 
y = y + mandInfoHeight + linebreak; 

// optional business info 
drawOptInfo(); 

// optional top message
drawTopMessage(); 

// dotted line break
drawDottedLine()

// note items, quantities and values columns have same 'y' coodinate position
// draw items column
context.textAlign = 'left'
context.fillText(items, 60, y); 

// draw quantities column
context.textAlign = 'right'
context.fillText(quantities, centrepoint, y); 

// draw values column
context.fillText(values, centrepoint + 100, y); 

// draw totals column
context.fillText(totals, 568 - margin, y + (2 * linebreak));
y = y + itemsHeight - (2 * midSpacing) - linebreak - dottedLineBreak; 

// draw grand total
const miniLine = "----\r\n";
context.font = 'bold 24pt Menlo'
context.textAlign = 'left'
context.fillText(miniLine + grandTotal, 568 - (2 * margin), y);
y = y + (2 * midSpacing); 

drawDottedLine();

// draw payment information
context.font = '24pt Menlo'
context.textAlign = 'left'
context.fillText(paymentHeader, margin, y);
y = y + midSpacing + linebreak; 

context.font = '14pt Menlo'
context.textAlign = 'right'
context.fillText(paymentText, centrepoint, y);
y = y + (2 * minSpacing) + linebreak; 

// time and date
context.textAlign = 'center'
context.fillText(timeStamp, centrepoint, y); 
y = y + stampHeight;

// dotted divider
drawDottedLine(); 

// optional bottom message
drawBotMessage(); 

// TODO: fix logo - not currently printing logo image; 
// TODO: Check if we need it to draw onto Terminal? 