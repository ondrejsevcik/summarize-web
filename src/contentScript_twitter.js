import { Readability } from "@mozilla/readability";
import { querySelectorPromise } from "./utils";

// Cross-browser compatible approach
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug('Request Action:', request.action);
  if (request.action === "ACTION_SUMMARIZE_TWEET") {
    TriggerSummarizeInPerplexity();

    sendResponse({ status: "success" });
  }
});

async function TriggerSummarizeInPerplexity() {
  console.debug("Button clicked");

  let content = "";
  if (document.location.origin.includes("x.com")) {
    console.debug("x.com detected");
    content = await getTweetContent();
  } else {
    console.debug("Not x.com");
    alert(`Can't run this on non x.com site.`);
  }

  browserAPI.storage.local.set({ text: content }, function () {
    console.debug("Text is set to " + content);

    // Opening a new tab has to be done from
    // background script due to permission reasons
    browserAPI.runtime.sendMessage({ action: "openTab", url: "https://perplexity.ai" });
  });
};

async function getTweetContent() {
  const userName = document.querySelector(`[data-testid="User-Name"]`).innerText;
  const tweetText = document.querySelector(`[data-testid="tweetText"]`).innerText;

  return `Tweet by:
${userName}.

Tweet content: 
${tweetText}`;
}
