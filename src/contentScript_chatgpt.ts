import { z } from "zod";
import { simulateFileSelection } from "./dom-utils";
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
import { querySelectorAsync, waitFor } from "./utils";
import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(message: unknown) {
	const { action, payload } = MessageSchema.parse(message);

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
	const prompt = "Give me key ideas from the attached file.";
	await updateEditorValue(prompt);

	const fileContent = `Title: ${pageData.title}\n\nContent:\n${pageData.textContent}`;
	await uploadFile(fileContent);
	await submitButton();
}

async function runYoutubeSummarization(youtubeData: Youtube) {
	const prompt = "Give me key ideas from the attached YouTube transcript.";
	await updateEditorValue(prompt);

	const fileContent = `Title: ${youtubeData.title}\n\nContent:\n${youtubeData.transcript}`;
	await uploadFile(fileContent);
	await submitButton();
}

async function runSummarizeSelection(selectedText: string) {
	const prompt = `Give me key ideas from the following text:\n\n${selectedText}`;
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
	const oneMinuteTimeout = 60 * 1000;

	await waitFor(() => {
		// Wait for the submit button to be enabled
		const button = document.querySelector<HTMLButtonElement>("[aria-label='Send prompt']");
		return button?.disabled === false;
	}, oneMinuteTimeout);

	const submitButton = await querySelectorAsync<HTMLButtonElement>(
		"[aria-label='Send prompt']",
	);

	submitButton.click();
}
