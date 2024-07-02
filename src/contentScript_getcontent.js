import { Readability } from "@mozilla/readability";

// const CONTEXT_MENU_ID = "summarize-context-menu";

// chrome.runtime.onInstalled.addListener(() => {
//   console.log("installed context menu");
//   chrome.contextMenus.create({
//     id: CONTEXT_MENU_ID,
//     title: "Summarize in ChatGPT",
//     contexts: ["selection"],
//   });
// });

console.debug("document loaded", document);

var button = document.createElement("button");
button.addEventListener("click", function () {
  console.debug("Button clicked");
  const content = getDocumentContent(document);

  chrome.storage.local.set({ text: content }, function () {
    console.debug("Text is set to " + content);

    window.open("https://chatgpt.com", "_blank");
  });
});

button.innerText = "Summarize in ChatGPT";
document.body.appendChild(button);

function getDocumentContent(doc) {
  var documentClone = doc.cloneNode(true);
  var article = new Readability(documentClone).parse();

  return article.textContent;
}
