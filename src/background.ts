import { ACTION_SUMMARIZE_PAGE, ACTION_SUMMARIZE_TWEET, ACTION_SUMMARIZE_YOUTUBE, GET_PAGE_CONTENT, GET_TWEET_CONTENT, GET_YOUTUBE_CONTENT, Page, PageActionPayload, Tweet, TweetActionPayload, Youtube, YoutubeActionPayload } from "./types";

// Cross-browser compatible approach
// @ts-ignore
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onInstalled.addListener(function () {
    browserAPI.contextMenus.create({
        id: "summarize-page-in-perplexity",
        title: "Summarize page in Perplexity",
        contexts: ["page"]
    });

    browserAPI.contextMenus.create({
        id: "summarize-page-in-chatgpt",
        title: "Summarize page in ChatGPT",
        contexts: ["page"]
    });

    // Summarize tweet in perplexity
    browserAPI.contextMenus.create({
        id: "summarize-tweet-in-perplexity",
        title: "Summarize Tweet in Perplexity",
        contexts: ["page"],
        documentUrlPatterns: ["https://x.com/*"],
    });

    // Summarize Youtube transcript in perplexity
    browserAPI.contextMenus.create({
        id: "summarize-youtube-in-perplexity",
        title: "Summarize Youtube in Perplexity",
        contexts: ["page"],
        documentUrlPatterns: ["https://www.youtube.com/*"],
    });

    browserAPI.contextMenus.create({
        id: "summarize-youtube-in-chatgpt",
        title: "Summarize Youtube in ChatGPT",
        contexts: ["page"],
        documentUrlPatterns: ["https://www.youtube.com/*"],
    });
});
  
browserAPI.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarize-page-in-perplexity") {
        browserAPI.tabs.sendMessage(tab.id, { action: GET_PAGE_CONTENT })
          .then(function handleGetPageContentResponse(response: Page) {
            // Open perplexity website
            return openAndWaitForComplete("https://www.perplexity.ai/")
                .then((perplexityTab) => {
                    // Send the page content to the perplexity tab
                    browserAPI.tabs.sendMessage(perplexityTab.id, {
                        action: ACTION_SUMMARIZE_PAGE,
                        data: response
                    } satisfies PageActionPayload)
                })
          });
    }

    if (info.menuItemId === "summarize-page-in-chatgpt") {
        browserAPI.tabs.sendMessage(tab.id, { action: GET_PAGE_CONTENT })
          .then(function handleGetPageContentResponse(response: Page) {
            // Open ChatGPT website
            return openAndWaitForComplete("https://chatgpt.com")
                .then((targetTab) => {
                    // Send the page content to the target tab
                    browserAPI.tabs.sendMessage(targetTab.id, {
                        action: ACTION_SUMMARIZE_PAGE,
                        data: response
                    } satisfies PageActionPayload)
                })
          });
    }

    if (info.menuItemId === "summarize-tweet-in-perplexity") {
        browserAPI.tabs.sendMessage(tab.id, { action: GET_TWEET_CONTENT })
            .then(function handleGetTweetContentResponse(response: Tweet) {
                // Open perplexity website
                return openAndWaitForComplete("https://www.perplexity.ai/")
                    .then((perplexityTab) => {
                        // Send the tweet content to the perplexity tab
                        browserAPI.tabs.sendMessage(perplexityTab.id, {
                            action: ACTION_SUMMARIZE_TWEET,
                            data: response
                        } satisfies TweetActionPayload)
                    })
            })
            // and send it instructions to do the stuff once loaded
            .error(console.error)
    }

    if (info.menuItemId === "summarize-youtube-in-perplexity") {
        browserAPI.tabs.sendMessage(tab.id, { action: GET_YOUTUBE_CONTENT })
            .then(function handleGetYoutubeContentResponse(response: Youtube) {
                // Open perplexity website
                return openAndWaitForComplete("https://www.perplexity.ai/")
                    .then((perplexityTab) => {
                        // Send the tweet content to the perplexity tab
                        browserAPI.tabs.sendMessage(perplexityTab.id, {
                            action: ACTION_SUMMARIZE_YOUTUBE,
                            data: response
                        } satisfies YoutubeActionPayload)
                    })
            })
            // and send it instructions to do the stuff once loaded
            .error(console.error)
    }

    if (info.menuItemId === "summarize-youtube-in-chatgpt") {
        browserAPI.tabs.sendMessage(tab.id, { action: GET_YOUTUBE_CONTENT })
            .then(function handleGetYoutubeContentResponse(response: Youtube) {
                // Open ChatGPT website
                return openAndWaitForComplete("https://chatgpt.com")
                    .then((targetTab) => {
                        // Send the tweet content to the target tab tab
                        browserAPI.tabs.sendMessage(targetTab.id, {
                            action: ACTION_SUMMARIZE_YOUTUBE,
                            data: response
                        } satisfies YoutubeActionPayload)
                    })
            })
            // and send it instructions to do the stuff once loaded
            .error(console.error)
    }
});

// TODO move to utils
async function openAndWaitForComplete(url: string): Promise<{ id: string }> {
    return new Promise((resolve, reject) => {
        browserAPI.tabs.create({ url }, (openedTab) => {
            // Function to check if this tab is complete
            function checkTabLoaded(tabId, changeInfo, updatedTab) {
                if (browserAPI.runtime.lastError) {
                    return reject(new Error(browserAPI.runtime.lastError.message));
                }

                // Make sure we're looking at the right tab
                if (tabId !== openedTab.id) {
                    return;
                }
                
                // If the tab is fully loaded
                if (changeInfo.status === 'complete') {
                    // Remove the event listener to avoid memory leaks
                    browserAPI.tabs.onUpdated.removeListener(checkTabLoaded);

                    // Resolve the promise with the updated tab
                    resolve(updatedTab);
                }
            };
            
            // Add the listener for tab updates
            browserAPI.tabs.onUpdated.addListener(checkTabLoaded);
        });
    });
}