import { simulateFileSelection } from "./dom-utils";
import {
	MessageSchema,
	type Prompt,
	PromptSchema,
	ACTION_SUMMARIZE,
} from "./types";
import { querySelectorAsync, waitFor } from "./utils";
import browser from "webextension-polyfill";

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
		await querySelectorAsync<HTMLTextAreaElement>(".chakra-textarea");

	// Update textarea value
	editorElement.value = value;
	editorElement.dispatchEvent(new Event("input", { bubbles: true }));
}

async function uploadFile(fileContent: string) {
	const inputElement = await querySelectorAsync<HTMLInputElement>(
		"input[name='attachments']",
	);
	simulateFileSelection(inputElement, fileContent, "content.txt", "text/plain");
}

async function submitButton() {
	const oneMinuteTimeout = 60 * 1000;

	await waitFor(() => {
		// Wait for the submit button to be enabled
		const button = document.querySelector<HTMLButtonElement>(
			"[aria-label='Submit chat']",
		);
		return button?.disabled === false;
	}, oneMinuteTimeout);

	// Wait extra second to ensure the UI is ready
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const submitButton = await querySelectorAsync<HTMLButtonElement>(
		"[aria-label='Submit chat']",
	);

	submitButton.click();
}
