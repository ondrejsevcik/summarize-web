// Get all text from the body element
let bodyText = document.body.innerText;

// Log the text to the console
console.log(bodyText);

// Or send it back to the background script
browser.runtime.sendMessage({ text: bodyText });
