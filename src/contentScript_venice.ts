import { simulateFileSelection } from "./dom-utils";
import { PROMPT } from "./prompt";
import {
	ACTION_SUMMARIZE_PAGE,
	ACTION_SUMMARIZE_YOUTUBE,
	MessageSchema,
	ContentSchema,
	PageContent,
	YoutubeContent,
	type Content,
	type Page,
	type Youtube,
	type Prompt,
	PromptSchema,
	ACTION_SUMMARIZE,
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

	if (action === ACTION_SUMMARIZE) {
		return PromptSchema.parseAsync(payload).then(runContentSummarization);
	}
}

async function runContentSummarization(prompt: Prompt) {
	await updateEditorValue(prompt.promptText);
	await uploadFile(prompt.attachment);
	await submitButton();
}

async function runPageSummarization(pageData: Page) {
	await updateEditorValue(PROMPT);

	const fileContent = `Page Title: ${pageData.title}\n\nContent:\n${pageData.textContent}`;
	await uploadFile(fileContent);
	await submitButton();
}

async function runYoutubeSummarization(youtubeData: Youtube) {
	// const prompt = "Give me key ideas from the attached YouTube transcript.";
	await updateEditorValue(PROMPT);

	const fileContent = `Youtube Video Title: ${youtubeData.title}\n\nTranscript:\n${youtubeData.transcript}`;
	await uploadFile(fileContent);
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
