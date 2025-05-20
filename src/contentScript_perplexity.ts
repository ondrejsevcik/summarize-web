import { changeTextareaValue, simulateFileSelection } from "./dom-utils.js";
import {
	ACTION_SUMMARIZE_PAGE,
	ACTION_SUMMARIZE_TWEET,
	ACTION_SUMMARIZE_YOUTUBE,
	type Page,
	type Tweet,
	type Youtube,
} from "./types.js";
import { querySelectorPromise, waitForTime } from "./utils.js";

// Cross-browser compatible approach
// @ts-ignore
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Tweet summarization
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("Message received in content script:", message);
	console.log("Sender information:", sender);

	// Check the message type/action to determine how to process it
	if (message.action !== ACTION_SUMMARIZE_TWEET) {
		return;
	}

	const tweet = message.data as Tweet;

	querySelectorPromise("textarea")
		.then(async (textarea) => {
			const prompt = `Explain this tweet.

Tweet author: ${tweet.authorName} @${tweet.authorHandle}
Tweet content
${tweet.tweetContent}`;

			changeTextareaValue(textarea, prompt);

			const submitButton = await querySelectorPromise("[aria-label=Submit]");
			submitButton.click();
			sendResponse({ status: "success" });
		})
		.catch((error) => {
			console.error(error);
			sendResponse({ status: "fail" });
		});
});

// Page summarization
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("Message received in content script:", message);
	console.log("Sender information:", sender);

	// Check the message type/action to determine how to process it
	if (message.action !== ACTION_SUMMARIZE_PAGE) {
		return;
	}

	const pageData = message.data as Page;

	querySelectorPromise("textarea")
		.then(async (textarea) => {
			const prompt = "Give me key ideas from the attached file.";
			changeTextareaValue(textarea, prompt);

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

			const submitButton = await querySelectorPromise("[aria-label=Submit]");
			submitButton.click();
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

	querySelectorPromise("textarea")
		.then(async (textarea) => {
			const prompt = "Give me key ideas from the attached YouTube transcript.";
			changeTextareaValue(textarea, prompt);

			const fileContent = `Title: ${youtubeData.title}\n\nContent:\n${youtubeData.transcript}`;
			const inputElement =
				document.querySelector<HTMLInputElement>("input[type=file]");
			if (!inputElement) return;

			// Find the "set sources for search" button
			const setSourcesButton = await querySelectorPromise(".tabler-icon-world").then(
				(path) => path.closest("button"),
			);

			if (setSourcesButton) {
				setSourcesButton.click();

				// Wait for the menu to appear
				await waitForTime(500);

				// Find and click the switch if it's on
				const switchElement = await querySelectorPromise(
					"button[role='switch']",
				);
				if (
					switchElement &&
					switchElement.getAttribute("aria-checked") === "true"
				) {
					switchElement.click();
					// Wait for the switch to take effect
					await waitForTime(300);
				}
			}

			simulateFileSelection(
				inputElement,
				fileContent,
				"content.txt",
				"text/plain",
			);

			// Wait 5s for upload
			await waitForTime(5000);

			const submitButton = await querySelectorPromise("[aria-label=Submit]");
			submitButton.click();
			sendResponse({ status: "success" });
		})
		.catch((error) => {
			console.error(error);
			sendResponse({ status: "fail" });
		});
});
