import { ACTION_SUMMARIZE_TWEET, GET_TWEET_CONTENT, Tweet, TweetActionPayload } from "./types";

// Cross-browser compatible approach
// @ts-ignore
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
    });
});
  
browserAPI.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarize-page-in-perplexity") {
        browserAPI.tabs.sendMessage(tab.id, { action: "ACTION_SUMMARIZE_IN_PERPLEXITY" });
        return;
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
});

browserAPI.runtime.onMessage.addListener((message) => {
    if (message.action === "openTab") {
        browserAPI.tabs.create({ url: message.url });
    }
});

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