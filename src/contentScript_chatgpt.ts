import { z } from "zod";
import { simulateFileSelection } from "./dom-utils.js";
import {
	ACTION_SUMMARIZE_PAGE,
	ACTION_SUMMARIZE_SELECTION,
	ACTION_SUMMARIZE_YOUTUBE,
	MessageSchema,
	PageContent,
	YoutubeContent,
	type Page,
	type Youtube,
} from "./types.js";
import { querySelectorAsync, waitForTime } from "./utils";
import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(message: unknown) {
	const { action, payload } = MessageSchema.parse(message);
	console.debug("Request Action:", action);

	if (action === ACTION_SUMMARIZE_PAGE) {
		return PageContent.parseAsync(payload).then(runPageSummarization);
	}

	if (action === ACTION_SUMMARIZE_YOUTUBE) {
		return YoutubeContent.parseAsync(payload).then(runYoutubeSummarization);
	}

	if (action === ACTION_SUMMARIZE_SELECTION) {
		return z.string().parseAsync(payload).then(runSummarizeSelection);
	}
}

async function runPageSummarization(pageData: Page) {
	const prompt =
		"Extract the essential ideas from this text, organizing them by importance (main concepts → supporting points). Preserve logical connections between ideas and include just enough context to ensure understanding. Format your response for both quick scanning and deeper comprehension.";
	await updateEditorValue(prompt);

	const fileContent = `Title: ${pageData.title}\n\nContent:\n${pageData.textContent}`;
	await uploadFile(fileContent);

	// Wait for upload
	await waitForTime(5000);
	await submitButton();
}

async function runYoutubeSummarization(youtubeData: Youtube) {
	const prompt = "Give me key ideas from the attached YouTube transcript.";
	await updateEditorValue(prompt);

	const fileContent = `Title: ${youtubeData.title}\n\nContent:\n${youtubeData.transcript}`;
	await uploadFile(fileContent);

	// Wait for upload
	await waitForTime(5000);
	await submitButton();
}

async function runSummarizeSelection(selectedText: string) {
	const prompt = `Give me key ideas from the following text:\n${selectedText}`;
	await updateEditorValue(prompt);
	await submitButton();
}

async function updateEditorValue(value: string) {
	const editorElement =
		await querySelectorAsync<HTMLDivElement>(".ProseMirror");

	// This updates value in the ProseMirror editor
	editorElement.textContent = value;
	const event = new Event("input", { bubbles: true, cancelable: true });
	editorElement.dispatchEvent(event);
}

async function uploadFile(fileContent: string) {
	const inputElement =
		await querySelectorAsync<HTMLInputElement>("input[type=file]");
	simulateFileSelection(inputElement, fileContent, "content.txt", "text/plain");
}

async function submitButton() {
	const submitButton = await querySelectorAsync<HTMLButtonElement>(
		"[aria-label='Send prompt']",
	);
	submitButton.click();
}
