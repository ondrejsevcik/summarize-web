import { changeTextareaValue, simulateFileSelection } from "./dom-utils";
import {
	ACTION_SUMMARIZE_PAGE,
	ACTION_SUMMARIZE_SELECTION,
	ACTION_SUMMARIZE_YOUTUBE,
	MessageSchema,
	PageContent,
	YoutubeContent,
	type Page,
	type Youtube,
} from "./types";
import { assertNonNullish, querySelectorAsync, waitFor } from "./utils";
import browser from "webextension-polyfill";
import { z } from "zod";

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(message: unknown) {
	const { action, payload } = MessageSchema.parse(message);

	if (action === ACTION_SUMMARIZE_YOUTUBE) {
		return YoutubeContent.parseAsync(payload).then(runYoutubeSummarization);
	}

	if (action === ACTION_SUMMARIZE_PAGE) {
		return PageContent.parseAsync(payload).then(runPageSummarization);
	}

	if (action === ACTION_SUMMARIZE_SELECTION) {
		return z.string().parseAsync(payload).then(runSummarizeSelection);
	}
}

async function runPageSummarization(pageData: Page) {
	const prompt = "Give me key ideas from the attached file.";
	await changePerplexityTextareaValue(prompt);

	const fileContent = `Title: ${pageData.title}\n\nContent:\n${pageData.textContent}`;
	await uploadFile(fileContent);

	await disableWebSearch();
	await submitPrompt();
}

async function runSummarizeSelection(selectedText: string) {
	const prompt = `Give me key ideas from the following text:\n${selectedText}`;
	await changePerplexityTextareaValue(prompt);

	await disableWebSearch();
	await submitPrompt();
}

async function runYoutubeSummarization(youtubeData: Youtube) {
	const prompt = "Give me key ideas from the attached YouTube transcript.";
	// const prompt = "Analyze this video transcript and provide a comprehensive summary that includes: 1) Main topics discussed, 2) Key points and insights, 3) Important quotes or specific mentions, 4) Any actionable items or conclusions. Structure your response with clear headings and bullet points where appropriate."
	await changePerplexityTextareaValue(prompt);

	const fileContent = `Title: ${youtubeData.title}\n\nContent:\n${youtubeData.transcript}`;
	await uploadFile(fileContent);

	await disableWebSearch();
	await submitPrompt();
}

async function changePerplexityTextareaValue(value: string) {
	const textarea = await querySelectorAsync<HTMLTextAreaElement>("textarea");
	changeTextareaValue(textarea, value);
}

async function disableWebSearch() {
	return true;
	// TODO this needs to be fixed

	// // Find the "set sources for search" button
	// const svgIcon = await querySelectorAsync(".tabler-icon-world");
	// const setSourcesButton = svgIcon.closest<HTMLButtonElement>("button");

	// assertNonNullish(setSourcesButton, "setSourcesButton is null");
	// setSourcesButton.click();

	// const searchWebBtn = await querySelectorAsync<HTMLButtonElement>(
	// 	'button[role="switch"]',
	// );

	// if (searchWebBtn.getAttribute("aria-checked") === "true") {
	// 	searchWebBtn.click();

	// 	await waitFor(() => {
	// 		console.debug("Waiting for web search to be disabled...");
	// 		// Wait for the switch to take effect
	// 		const updatedBtn = document.querySelector<HTMLButtonElement>(
	// 			'button[role="switch"]',
	// 		);
	// 		return updatedBtn?.getAttribute("aria-checked") === "false";
	// 	});

	// 	console.debug("Web search disabled");
	// }
}

async function uploadFile(content: string) {
	const inputElement =
		document.querySelector<HTMLInputElement>("input[type=file]");

	assertNonNullish(inputElement, "inputElement is null");
	simulateFileSelection(inputElement, content, "content.txt", "text/plain");

	await waitFor(() => {
		// Wait for upload to finish
		return document.querySelector(".tabler-icon-loader-2") === null;
	});
}

async function submitPrompt() {
	const submitButton = await querySelectorAsync<HTMLButtonElement>(
		"[aria-label=Submit]",
	);

	await waitFor(() => {
		// Wait for the submit button to be enabled
		return !submitButton.disabled;
	});

	submitButton.click();
}
