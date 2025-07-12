import { querySelectorAsync } from "./utils";
import { GET_CONTENT, MessageSchema } from "./types";
import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(message: unknown) {
	const { action } = MessageSchema.parse(message);

	if (action === GET_CONTENT) {
		return getYoutubeContent();
	}
}

async function getYoutubeContent(): Promise<string> {
	const showTranscriptBtn = await querySelectorAsync<HTMLButtonElement>(
		'button[aria-label="Show transcript"]',
	);

	showTranscriptBtn.click();

	await querySelectorAsync(".segment-text");
	const transcriptNode = await querySelectorAsync<HTMLElement>(
		"ytd-transcript-segment-list-renderer",
	);

	const title = document.title.replace(" - YouTube", "");
	const transcript = transcriptNode.innerText;
	const attachment = `Youtube Video Title: ${title}\n\nTranscript:\n\n${transcript}`;

	return attachment;
}
