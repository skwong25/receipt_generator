// Use as a singleton - only loads once due to caching, not as an instance

const path = require('path')
const i18n = require('i18n')

i18n.configure({
  locales: ['en', 'de'],
  directory: path.join(__dirname, 'locales')
})

// set to german
i18n.setLocale('de')

// will put 'Hallo'
// i18n.__() applies the translation to the Locale passed to the value within the brackets  
console.log(i18n.__('Hello'));
console.log(i18n.__('Goodbye'));

let bye = i18n.__('Goodbye');
console.log('Bye in German is: ' + bye); 

i18n.setLocale('en')
// note that we cannot reassign variable 'bye' even if we declare with 'let'

let goodbye = i18n.__('Goodbye');
console.log('Bye in English is: ' + goodbye); 


// How does this apply to our CLI?
// We need to populate the library with all the text on the receipt that will need translating
// Then if a language is passed as a CLI argument, we call with its Locale tag: 'de', 'en' etc:
// i18n.setLocale('de')
// Then all text needs to be reassigned via 
// let text = i18n.__('text_to_be_printed');
// This could happen in a seperate module and be imported as text variables into main app.js
