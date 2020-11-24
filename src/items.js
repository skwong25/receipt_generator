// format the JSON order information into strings

// const { createCanvas, loadImage, Image } = require('canvas')

class Items {
    constructor(order) {
        this.canvas = require('canvas');
        this.order = order; 

    // TODO: check if we actually need to bind makeArray? 
    // Note that methods that contain neighbouring method calls require binding to the class
    this.itemsCol = this.itemsCol.bind(this);
    this.makeArray = this.makeArray.bind(this);

    }
    
    get numberItems() {
        let arr = this.makeArray('description');
        return arr.length; 
    }

    get grandTotal() {
        let arr = this.makeTotalsArray(); 
        const grandTotal =  arr.reduce((a, v) => {
            return a + v;
        });
        return grandTotal; 
    }

    // access this.order.items - an array 
    // i want to make an array of the descriptions
    makeArray(key) {
        let arr = [];
        for (let item in this.order.items) {
            arr.push(this.order.items[item][key]);  
        };
        return arr;  
    }

    makeTotalsArray() {
        let arr = []; 
        for (let item in this.order.items) {
            arr.push(this.order.items[item].quantity * this.order.items[item].value);  
        }
        return arr; 
    }

    itemsCol() {
        let arr = this.makeArray('description');
        const header = "ITEM(S)\r\n\r\n"
        const itemText = header + arr.join('\r\n');
        return itemText; 
    }

    quantityCol() {
        let arr = this.makeArray('quantity');
        const header = "QTY\r\n\r\nX "
        const footer =  arr.reduce((a, v) => {
            return a + v;
        });
        const qtyText =  header + arr.join("\r\nX ") + "\r\n\r\n " + footer;
        return qtyText; 
    }

    valueCol() {
        let arr = this.makeArray('value');
        const header = "VALUE\r\n\r\n@  ";
        const footer =  "TOTAL";
        const valueText =  header + arr.join("\r\n@  ") + "\r\n\r\n " + footer;
        return valueText; 
    }

    totalCol() {
        let arr = this.makeTotalsArray();
        const header = "@  ";
        const totalsText =  header + arr.join("\r\n@  ");
        return totalsText; 
    }
}

module.exports.object = Items; 
// export a class by attaching it as a property of the module.exports object 

// Note that if a module is imported multiple times, but with the same specifier (i.e. path), 
// the JavaScript specification guarantees that you’ll receive the same module instance. 
// Above, we should expect that although the class object might be imported in 2 js files, it will be the same instance. 
// However, if it is instantiated in two separate places it will be two separate class instances. 

