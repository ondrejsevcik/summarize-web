import { GET_TWEET_CONTENT, type Tweet } from "./types";

// Cross-browser compatible approach
// @ts-ignore
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.debug("Request Action:", request.action);
	if (request.action === GET_TWEET_CONTENT) {
		sendResponse(getTweetContent());
	}
});

function getTweetContent(): Tweet {
	const tweet = document.querySelector('[data-testid="tweet"]');
	const [authorName, handle] = tweet
		?.querySelector<HTMLElement>(`[data-testid="User-Name"]`)
		?.innerText.split(`@`)
		.map((t) => t.trim());
	const tweetText =
		tweet?.querySelector<HTMLElement>(`[data-testid="tweetText"]`)?.innerText ??
		"";
	const attachment = tweet?.querySelector<HTMLImageElement>(
		`[aria-label="Image"] img`,
	)?.src;

	return {
		authorName: authorName,
		authorHandle: handle,
		tweetContent: tweetText,
		imageSrc: attachment,
	};
}
