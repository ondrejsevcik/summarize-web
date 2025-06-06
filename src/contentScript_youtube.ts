import { querySelectorAsync } from "./utils";
import { GET_YOUTUBE_CONTENT, MessageSchema, type Youtube } from "./types";
import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(message: unknown) {
	const { action } = MessageSchema.parse(message);

	if (action === GET_YOUTUBE_CONTENT) {
		return getYoutubeContent();
	}
}

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
