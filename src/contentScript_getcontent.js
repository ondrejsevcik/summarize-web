import { Readability } from "@mozilla/readability";
import { querySelectorPromise } from "./utils";

// const CONTEXT_MENU_ID = "summarize-context-menu";

// chrome.runtime.onInstalled.addListener(() => {
//   console.log("installed context menu");
//   chrome.contextMenus.create({
//     id: CONTEXT_MENU_ID,
//     title: "Summarize in ChatGPT",
//     contexts: ["selection"],
//   });
// });

var button = document.createElement("button");
button.style.top = "5px";
button.style.left = "5px";
button.style.position = "fixed";
button.style.zIndex = "999999";
button.style.backgroundColor = "#4CAF50";
button.style.borderRadius = "5px";

button.addEventListener("click", async function () {
  console.debug("Button clicked");

  let content = "";
  if (document.location.origin.includes("youtube.com")) {
    console.debug("Youtube detected");
    content = await getYoutubeContent();
  } else {
    console.debug("Not Youtube");
    content = getDocumentContent(document);
  }

  chrome.storage.local.set({ text: content }, function () {
    console.debug("Text is set to " + content);

    window.open("https://perplexity.ai", "_blank");
  });
});

button.innerText = "Summarize in ChatGPT";
document.body.appendChild(button);

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
