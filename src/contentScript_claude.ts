import browser from "webextension-polyfill";
import { simulateFileSelection } from "./dom-utils";
import {
	ACTION_SUMMARIZE,
	MessageSchema,
	type Prompt,
	PromptSchema,
} from "./types";
import { querySelectorAsync, waitFor } from "./utils";

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(message: unknown) {
	const { action, payload } = MessageSchema.parse(message);

	if (action === ACTION_SUMMARIZE) {
		return PromptSchema.parseAsync(payload).then(runSummarization);
	}
}

async function runSummarization(prompt: Prompt) {
	await updateEditorValue(prompt.promptText);
	await uploadFile(prompt.attachment);
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
	const inputElement = await querySelectorAsync<HTMLInputElement>(
		"input[aria-label='Upload files']",
	);
	simulateFileSelection(inputElement, fileContent, "content.txt", "text/plain");
}

async function submitButton() {
	const oneMinuteTimeout = 60 * 1000;

	await waitFor(() => {
		// Wait for the submit button to be enabled
		const button = document.querySelector<HTMLButtonElement>(
			"[aria-label='Send message']",
		);
		return button?.disabled === false;
	}, oneMinuteTimeout);

	const submitButton = await querySelectorAsync<HTMLButtonElement>(
		"[aria-label='Send message']",
	);

	submitButton.click();
}
