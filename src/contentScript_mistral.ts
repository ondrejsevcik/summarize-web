import browser from "webextension-polyfill";
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
	// Include attachment content directly in the prompt text since file upload doesn't work
	const fullPrompt = prompt.attachment
		? `${prompt.promptText}\n\n--- Content to analyze ---\n${prompt.attachment}`
		: prompt.promptText;

	await updateEditorValue(fullPrompt);
	await submitButton();
}

async function updateEditorValue(value: string) {
	const editorElement =
		await querySelectorAsync<HTMLDivElement>(".ProseMirror");

	// ProseMirror uses rich text editing with DOM structure, not plain text
	// Setting textContent would flatten everything into one line, ignoring line breaks
	// We need to create proper paragraph elements for each line to preserve formatting

	// Clear the editor first
	editorElement.innerHTML = "";

	// Split the text by line breaks and create paragraph elements
	const lines = value.split("\n");
	lines.forEach((line, _index) => {
		const p = document.createElement("p");

		// Handle empty lines - ProseMirror needs a <br> element to render empty paragraphs
		if (line.trim() === "") {
			const br = document.createElement("br");
			br.className = "ProseMirror-trailingBreak";
			p.appendChild(br);
		} else {
			p.textContent = line;
		}

		editorElement.appendChild(p);
	});

	// Trigger input event to notify ProseMirror of the change
	const event = new Event("input", { bubbles: true, cancelable: true });
	editorElement.dispatchEvent(event);
}

async function submitButton() {
	const oneMinuteTimeout = 60 * 1000;

	await waitFor(() => {
		// Wait for the Mistral submit button to be enabled
		const button = document.querySelector<HTMLButtonElement>(
			'[aria-label="Send question"]',
		);
		return button?.disabled === false;
	}, oneMinuteTimeout);

	const submitButton = await querySelectorAsync<HTMLButtonElement>(
		'[aria-label="Send question"]',
	);

	submitButton.click();
}
