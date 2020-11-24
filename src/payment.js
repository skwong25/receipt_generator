class Payment {
    constructor(order, grandTotal) {
        this.canvas = require('canvas');
        this.payment = order.payment; 
        this.grandTotal = grandTotal; 
        this.shortid = require('shortid');
    }

    get type() {
        return this.payment.type; 
    }

    get paidAmount() {
        return this.payment.cash;
    }

    formatText() {
        const currency = "GBP" // we can swap this out for currency chosen 
        if (this.payment.type === "cash") {
            const paid = this.payment.paid.toFixed(2)
            const line1 = `PAID in ${currency}:   ${paid}\r\n`; 
            const change = this.payment.paid - this.grandTotal; 
            const line2 = `CHANGE in ${currency}: ${change.toFixed(2)}` 
            return line1 + line2;
        } else {
            const line1 = `Card no. ${this.payment.number}  Expiry: ${this.payment.expiry}\r\n`; 
            const transactionId = this.shortid.generate();  
            const line2 = `Transaction reference: ${transactionId}` 
            return line1 + line2;
        }
    }

    
}

module.exports.object = Payment; 
// export a class by attaching it as a property of the module.exports object 

// Note that if a module is imported multiple times, but with the same specifier (i.e. path), 
// the JavaScript specification guarantees that you’ll receive the same module instance. 
// Above, we should expect that although the class object might be imported in 2 js files, it will be the same instance. 
// However, if it is instantiated in two separate places it will be two separate class instances. 


// TODO: update 18.11.2020 - shortid reported to be deprecated, replace with nano id
