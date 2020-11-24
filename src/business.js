// format the JSON order information into strings

// const { createCanvas, loadImage, Image } = require('canvas')

class BusinessInfo {
    constructor(options) {
        this.options = options;
        this.sizeOf = require('image-size');

        this.determineScale = this.determineScale.bind(this); 
        // TODO: check if we need to bind determineScale method actually? 
    }
    
    get address() {
        return `${this.options.address1}\r\n${this.options.address2}\r\n`
    }

    get vat()  {
        return `VAT NO: ${this.options.vat}\r\n`;
    }

    get phone() {
        if (this.options.phone) {
        return `Tel: ${this.options.phone}\r\n`;  
        } else {
        return " ";
        }
    }

    get website() {
        if (this.options.website) {
        return `Website: ${this.options.website}\r\n`;  
        } else {
        return " ";
        }
    }

    // truncates CLI argument over the char limit
    validate (arg, limit = 53) {
        if (this.options[arg]) {
            let string = this.options[arg];
            while (string.length > limit) {
                string.pop();
            }
            return string; 
        } 
    }

    // detemines required scale to rescale logo image 
    determineScale (oWidth, oHeight, logoWidth, logoHeight) {

        function diff(a,b) {
          return Math.abs(a-b);
        }
      
       let widthDiff = diff(logoWidth, oWidth); 
       let heightDiff = diff(logoHeight, oHeight);
      
       if (widthDiff >= heightDiff) { 
         return logoWidth/oWidth;  // 448/224 = 2 or 448/896=0.5
       } else {
         return logoHeight/oHeight; 
       }
    }

    // calculates new dimensions for logo image 
    getNewDimensions (url) {

            const logoWidth = 448;
            const logoHeight = 120;
        
            console.log("url" + url); // options.image 
            const dimensions = this.sizeOf(url);  
            const oWidth = dimensions.width
            const oHeight = dimensions.height;
            console.log("oWidth: " + oWidth + ", oHeight: " + oHeight);
        
            const scale = this.determineScale(oWidth, oHeight, logoWidth, logoHeight); 
            console.log("scale: " + scale);
        
            const newWidth = Math.floor(oWidth * scale); 
            const newHeight = Math.floor(oHeight * scale); 
            console.log("newWidth: " + newWidth + ", newHeight: " + newHeight);
            
            return {width: newWidth, height: newHeight}; 
    }

    countOptInfo() {
        let count = 0; 
        if (this.options.website) {
            count++;
        } 
        if (this.options.telephone) {
            count++;
        }
        if (this.options.website || this.options.telephone) {
            count++; // linebreak
        }
        return count;
    }

    countMessages() {
        let count = 0; 
        if (this.options.topMessage) {
            count++;
        } 
        if (this.options.botMessage) {
            count++;
            count++; // dotted line break 
        }
        return count;
    }
}


module.exports.object = BusinessInfo; 
// export a class by attaching it as a property of the module.exports object 

// Note that if a module is imported multiple times, but with the same specifier (i.e. path), 
// the JavaScript specification guarantees that you’ll receive the same module instance. 
// Above, we should expect that although the class object might be imported in 2 js files, it will be the same instance. 
// However, if it is instantiated in two separate places it will be two separate class instances. 

