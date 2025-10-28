import browser from "webextension-polyfill";
import { GET_CONTENT, MessageSchema } from "./types";
import { querySelectorAsync } from "./utils";

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
	const transcriptSegments = transcriptNode.querySelectorAll(".segment-text");
	// Extract only text content (excluding timestamps) and normalize whitespace for better AI summarization
	const transcript = Array.from(transcriptSegments)
		.map((segment) => segment.textContent?.replace(/\s+/g, " ").trim())
		.filter(Boolean)
		.join(" ");
	const attachment = `Youtube Video Title: ${title}\n\nTranscript:\n\n${transcript}`;

	return attachment;
}
