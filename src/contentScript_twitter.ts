import { GET_TWEET_CONTENT, Tweet } from "./types";

// Cross-browser compatible approach
// @ts-ignore
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug('Request Action:', request.action);
  if (request.action === GET_TWEET_CONTENT) {
    sendResponse(getTweetContent());
  }
});

function getTweetContent(): Tweet {
  var tweet = document.querySelector('[data-testid="tweet"]')
  var [authorName, handle] = tweet?.querySelector<HTMLElement>(`[data-testid="User-Name"]`)?.innerText.split(`@`).map(t => t.trim());
  var tweetText = tweet?.querySelector<HTMLElement>(`[data-testid="tweetText"]`)?.innerText ?? '';
  var attachment = tweet?.querySelector<HTMLImageElement>(`[aria-label="Image"] img`)?.src

  return {
    authorName: authorName,
    authorHandle: handle,
    tweetContent: tweetText,
    imageSrc: attachment
  }
}
