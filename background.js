// Hello there
console.log("hello from summarize-web");

// When the browser_action is clicked, inject a content script into the current page
browser.browserAction.onClicked.addListener((tab) => {
  browser.tabs.executeScript(tab.id, {
    file: "contentScript.js",
  });
});

browser.runtime.onMessage.addListener((data, sender) => {
  console.log(`A content script sent a message: ${request.greeting}`);
});
