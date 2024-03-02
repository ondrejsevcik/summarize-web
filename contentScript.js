// Get all text from the body element
var bodyText = document.body.innerText;

// Send it back to the background script
browser.runtime.sendMessage({ text: bodyText });
