import { Readability } from "@mozilla/readability";
import { querySelectorPromise } from "./utils";

// Cross-browser compatible approach
// @ts-ignore
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// const CONTEXT_MENU_ID = "summarize-context-menu";

// chrome.runtime.onInstalled.addListener(() => {
//   console.log("installed context menu");
//   chrome.contextMenus.create({
//     id: CONTEXT_MENU_ID,
//     title: "Summarize in ChatGPT",
//     contexts: ["selection"],
//   });
// });

browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug('Request Action:', request.action);
  if (request.action === "ACTION_SUMMARIZE_IN_PERPLEXITY") {
    TriggerSummarizeInPerplexity();

    sendResponse({ status: "success" });
  }
});

async function TriggerSummarizeInPerplexity() {
  console.debug("Button clicked");

  let content = "";
  if (document.location.origin.includes("youtube.com")) {
    console.debug("Youtube detected");
    content = await getYoutubeContent();
  } else {
    console.debug("Not Youtube");
    content = getDocumentContent(document);
  }

  browserAPI.storage.local.set({ text: content }, function () {
    console.debug("Text is set to " + content);

    // Opening a new tab has to be done from
    // background script due to permission reasons
    browserAPI.runtime.sendMessage({ action: "openTab", url: "https://perplexity.ai" });
  });
};

function getDocumentContent(doc) {
  var documentClone = doc.cloneNode(true);
  var article = new Readability(documentClone).parse();

  return article.textContent;
}

async function getYoutubeContent() {
  const showTranscriptBtn = document.querySelector(
    'button[aria-label="Show transcript"]'
  );

  showTranscriptBtn.click();

  await querySelectorPromise(".segment-text");

  return document.querySelector("ytd-transcript-segment-list-renderer").innerText;
}
