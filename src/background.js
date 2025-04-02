// Cross-browser compatible approach
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onInstalled.addListener(function () {
    browserAPI.contextMenus.create({
        id: "summarize-page-in-perplexity",
        title: "Summarize page in Perplexity",
        contexts: ["page"]
    });

    // Summarize tweet in perplexity
    browserAPI.contextMenus.create({
        id: "summarize-tweet-in-perplexity",
        title: "Summarize Tweet in Perplexity",
        contexts: ["page"],
        documentUrlPatterns: ["https://x.com/*"],
        // onClicked: function (info, tab) {
        //     browserAPI.tabs.sendMessage(tab.id, { action: "ACTION_SUMMARIZE_TWEET" });
        // }
    });
});
  
browserAPI.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarize-page-in-perplexity") {
        browserAPI.tabs.sendMessage(tab.id, { action: "ACTION_SUMMARIZE_IN_PERPLEXITY" });
    }
    if (info.menuItemId === "summarize-tweet-in-perplexity") {
        browserAPI.tabs.sendMessage(tab.id, { action: "ACTION_SUMMARIZE_TWEET" });
    }
});

browserAPI.runtime.onMessage.addListener((message) => {
    if (message.action === "openTab") {
        browserAPI.tabs.create({ url: message.url });
    }
});