import { querySelectorAsync } from "./utils";
import { GET_YOUTUBE_CONTENT, type Youtube } from "./types";

// Cross-browser compatible approach
// @ts-ignore
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.debug("Request Action:", request.action);
	if (request.action === GET_YOUTUBE_CONTENT) {
		getYoutubeContent().then((response) => sendResponse(response));
		return true; // Keep the message channel open for asynchronous response
	}
});

async function getYoutubeContent(): Promise<Youtube> {
	const showTranscriptBtn = await querySelectorAsync<HTMLButtonElement>(
		'button[aria-label="Show transcript"]',
	);

	showTranscriptBtn.click();

	await querySelectorAsync(".segment-text");
	const transcriptNode = await querySelectorAsync<HTMLElement>(
		"ytd-transcript-segment-list-renderer",
	);

	return {
		title: document.title.replace(" - YouTube", ""),
		transcript: transcriptNode.innerText,
	};
}
