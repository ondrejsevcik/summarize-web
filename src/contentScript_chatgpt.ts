import { changeProseMirrorValue, simulateFileSelection } from "./dom-utils.js";
import {
	ACTION_SUMMARIZE_PAGE,
	ACTION_SUMMARIZE_YOUTUBE,
	MessageSchema,
	PageContent,
	YoutubeContent,
	type Page,
	type Youtube,
} from "./types.js";
import { querySelectorPromise, waitForTime } from "./utils";
import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener(handleMessage);

async function handleMessage(message: unknown) {
	const { action, payload } = MessageSchema.parse(message);
	console.debug("Request Action:", action);

	if (action === ACTION_SUMMARIZE_PAGE) {
		return PageContent.parseAsync(payload).then(runPageSummarization);
	}

	if (action === ACTION_SUMMARIZE_YOUTUBE) {
		return YoutubeContent.parseAsync(payload).then(runYoutubeSummarization);
	}
}

async function runPageSummarization(pageData: Page) {
	return querySelectorPromise(".ProseMirror").then(async (textarea) => {
		const prompt =
			"Extract the essential ideas from this text, organizing them by importance (main concepts → supporting points). Preserve logical connections between ideas and include just enough context to ensure understanding. Format your response for both quick scanning and deeper comprehension.";
		changeProseMirrorValue(textarea, prompt);

		const fileContent = `Title: ${pageData.title}\n\nContent:\n${pageData.textContent}`;
		const inputElement =
			document.querySelector<HTMLInputElement>("input[type=file]");
		if (!inputElement) return;
		simulateFileSelection(
			inputElement,
			fileContent,
			"content.txt",
			"text/plain",
		);

		// Wait 5s for upload
		await waitForTime(5000);

		const submitButton = document.querySelector<HTMLButtonElement>(
			"[aria-label='Send prompt']",
		);
		submitButton?.click();
	});
}

async function runYoutubeSummarization(youtubeData: Youtube) {
	return querySelectorPromise(".ProseMirror").then(async (textarea) => {
		const prompt = "Give me key ideas from the attached YouTube transcript.";
		changeProseMirrorValue(textarea, prompt);

		const fileContent = `Title: ${youtubeData.title}\n\nContent:\n${youtubeData.transcript}`;
		const inputElement =
			document.querySelector<HTMLInputElement>("input[type=file]");
		if (!inputElement) return;
		simulateFileSelection(
			inputElement,
			fileContent,
			"content.txt",
			"text/plain",
		);

		// Wait 5s for upload
		await waitForTime(5000);

		const submitButton = document.querySelector<HTMLButtonElement>(
			"[aria-label='Send prompt']",
		);
		submitButton?.click();
	});
}
