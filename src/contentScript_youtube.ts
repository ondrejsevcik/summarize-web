import { Readability } from "@mozilla/readability";
import { querySelectorPromise } from "./utils";
import { GET_YOUTUBE_CONTENT, type Youtube } from "./types";

// TODO add youtube support
// Cross-browser compatible approach
// @ts-ignore
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.debug("Request Action:", request.action);
	if (request.action === GET_YOUTUBE_CONTENT) {
		// TODO fix me
		// TODO youtube does not work now!
		getYoutubeContent().then((response) => sendResponse(response));
		return true; // Keep the message channel open for asynchronous response
	}
});

async function getYoutubeContent(): Promise<Youtube> {
	const showTranscriptBtn = document.querySelector<HTMLButtonElement>(
		'button[aria-label="Show transcript"]',
	);
	console.debug("Transcript button:", showTranscriptBtn);
	// if (!showTranscriptBtn) {
	//   alert("Transcript button not found. Please check if the transcript is available for this video.");
	//   throw new Error("Transcript button not found");
	// }

	console.log("clicking btn", showTranscriptBtn);
	showTranscriptBtn?.click();

	await querySelectorPromise(".segment-text");

	return {
		title: document.title.replace(" - YouTube", ""),
		transcript:
			document.querySelector<HTMLElement>(
				"ytd-transcript-segment-list-renderer",
			)?.innerText ?? "",
	};
}
