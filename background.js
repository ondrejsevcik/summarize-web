const CONTEXT_MENU_ID = "summarize-context-menu";
chrome.runtime.onInstalled.addListener(() => {
  console.log("installed context menu");
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Summarize in ChatGPT",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  saveText(info.selectionText);

  chrome.tabs.create({ url: "https://chatgpt.com" });
});

function saveText(text) {
  chrome.storage.local.set({ text: text }, function () {
    console.debug("Text is set to " + text);
  });
}
