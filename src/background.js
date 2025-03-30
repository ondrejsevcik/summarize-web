// Cross-browser compatible approach
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onInstalled.addListener(function () {
    browserAPI.contextMenus.create({
        id: "summarize-in-perplexity",
        title: "Summarize in Perplexity",
        contexts: ["page"]
    });
});
  
browserAPI.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarize-in-perplexity") {
        browserAPI.tabs.sendMessage(tab.id, { action: "ACTION_SUMMARIZE_IN_PERPLEXITY" });
    }
});

browserAPI.runtime.onMessage.addListener((message) => {
    if (message.action === "openTab") {
        browserAPI.tabs.create({ url: message.url });
    }
});