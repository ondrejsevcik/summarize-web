import {
	changeProseMirrorValue,
	simulateFileSelection,
} from "./dom-utils.js";
import {
	ACTION_SUMMARIZE_PAGE,
	ACTION_SUMMARIZE_YOUTUBE,
	FIX_GRAMMAR,
	type Page,
	type Youtube,
} from "./types.js";
import { querySelectorPromise, waitForTime } from "./utils";

// Cross-browser compatible approach
// @ts-ignore
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Page summarization
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("Message received in content script:", message);
	console.log("Sender information:", sender);

	// Check the message type/action to determine how to process it
	if (message.action !== ACTION_SUMMARIZE_PAGE) {
		return;
	}

	const pageData = message.data as Page;

	querySelectorPromise(".ProseMirror")
		.then(async (textarea) => {
			const prompt = "Extract the essential ideas from this text, organizing them by importance (main concepts → supporting points). Preserve logical connections between ideas and include just enough context to ensure understanding. Format your response for both quick scanning and deeper comprehension.";
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
			sendResponse({ status: "success" });
		})
		.catch((error) => {
			console.error(error);
			sendResponse({ status: "fail" });
		});
});

// Youtube summarization
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("Message received in content script:", message);
	console.log("Sender information:", sender);

	// Check the message type/action to determine how to process it
	if (message.action !== ACTION_SUMMARIZE_YOUTUBE) {
		return;
	}

	const youtubeData = message.data as Youtube;

	querySelectorPromise(".ProseMirror")
		.then(async (textarea) => {
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
			sendResponse({ status: "success" });
		})
		.catch((error) => {
			console.error(error);
			sendResponse({ status: "fail" });
		});
});

// Fix grammar
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("Message received in content script:", message);
	console.log("Sender information:", sender);

	// Check the message type/action to determine how to process it
	if (message.action !== FIX_GRAMMAR) {
		return;
	}

	const textContent = message.data as string;

	querySelectorPromise(".ProseMirror")
		.then(async (textarea) => {
			const prompt = `Fix grammar in the following text. Do not change the words, just fix grammar issues.
      
      ${textContent}`;
			changeProseMirrorValue(textarea, prompt);

			const submitButton = document.querySelector<HTMLButtonElement>(
				"[aria-label='Send prompt']",
			);
			submitButton?.click();
			sendResponse({ status: "success" });
		})
		.catch((error) => {
			console.error(error);
			sendResponse({ status: "fail" });
		});
});
