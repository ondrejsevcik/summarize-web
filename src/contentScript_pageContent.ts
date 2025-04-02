import { Readability } from "@mozilla/readability";
import { querySelectorPromise } from "./utils";
import { GET_PAGE_CONTENT, Page } from "./types";

// Cross-browser compatible approach
// @ts-ignore
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug('Request Action:', request.action);
  if (request.action === GET_PAGE_CONTENT) {
    sendResponse(getPageContent());
  }
});

function getPageContent(): Page {
  let documentClone = document.cloneNode(true) as Document;
  let article = new Readability(documentClone).parse();

  // TODO think if this is necessary
  return article ?? { title: '', content: '' };
}
