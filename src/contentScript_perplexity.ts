import { changeTextareaValue, simulateFileSelection } from "./dom-utils.js";
import {
	ACTION_SUMMARIZE_PAGE,
	ACTION_SUMMARIZE_SELECTION,
	ACTION_SUMMARIZE_TWEET,
	ACTION_SUMMARIZE_YOUTUBE,
	type Page,
	type Tweet,
	type Youtube,
} from "./types.js";
import { assertNonNullish, querySelectorAsync, waitForTime } from "./utils";

// Cross-browser compatible approach
// @ts-ignore
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.debug("Message received in content script:", message);
	console.debug("Sender information:", sender);

	if (message.action === ACTION_SUMMARIZE_YOUTUBE) {
		const youtubeData = message.data as Youtube;

		runYoutubeSummarization(youtubeData)
			.then(() => {
				sendResponse({ status: "success" });
			})
			.catch((error) => {
				console.error(error);
				sendResponse({ status: "fail" });
			});
	}

	if (message.action === ACTION_SUMMARIZE_TWEET) {
		const tweet = message.data as Tweet;

		runTweetSummarization(tweet)
			.then(() => {
				sendResponse({ status: "success" });
			})
			.catch((error) => {
				console.error(error);
				sendResponse({ status: "fail" });
			});
	}

	if (message.action === ACTION_SUMMARIZE_PAGE) {
		const pageData = message.data as Page;

		runPageSummarization(pageData)
			.then(() => {
				sendResponse({ status: "success" });
			})
			.catch((error) => {
				console.error(error);
				sendResponse({ status: "fail" });
			});
	}

	if (message.action === ACTION_SUMMARIZE_SELECTION) {
		const selectedText = message.data as string;

		runSummarizeSelection(selectedText)
			.then(() => {
				sendResponse({ status: "success" });
			})
			.catch((error) => {
				console.error(error);
				sendResponse({ status: "fail" });
			});
	}
});

async function runTweetSummarization(tweet: Tweet) {
	const prompt = `Explain this tweet.

Tweet author: ${tweet.authorName} @${tweet.authorHandle}
Tweet content
${tweet.tweetContent}`;

	await changePerplexityTextareaValue(prompt);

	await submitPrompt();
}

async function runPageSummarization(pageData: Page) {
	const prompt = "Give me key ideas from the attached file.";
	await changePerplexityTextareaValue(prompt);

	await disableWebSearch();

	const fileContent = `Title: ${pageData.title}\n\nContent:\n${pageData.textContent}`;
	await uploadFile(fileContent);

	await disableWebSearch();

	await submitPrompt();
}

async function runSummarizeSelection(selectedText: string) {
	const prompt = "Give me key ideas from the following text:\n" + selectedText;
	await changePerplexityTextareaValue(prompt);	

	await disableWebSearch();
	await submitPrompt();
}

async function runYoutubeSummarization(youtubeData: Youtube) {
	const prompt = "Give me key ideas from the attached YouTube transcript.";
	await changePerplexityTextareaValue(prompt);

	await disableWebSearch();

	const fileContent = `Title: ${youtubeData.title}\n\nContent:\n${youtubeData.transcript}`;
	await uploadFile(fileContent);
	await submitPrompt();
}

async function changePerplexityTextareaValue(value: string) {
	const textarea = await querySelectorAsync<HTMLTextAreaElement>("textarea");
	changeTextareaValue(textarea, value);
}

async function disableWebSearch() {
	// Find the "set sources for search" button
	const svgIcon = await querySelectorAsync(".tabler-icon-world");
	const setSourcesButton = svgIcon.closest<HTMLButtonElement>("button");

	assertNonNullish(setSourcesButton, "setSourcesButton is null");
	setSourcesButton.click();

	// Find and click the "search web" switch is on
	const switchElement = await querySelectorAsync<HTMLButtonElement>(
		'button[role="switch"]',
	);
	if (switchElement && switchElement.getAttribute("aria-checked") === "true") {
		switchElement.click();

		// Wait for the switch to take effect
		await waitForTime(300);
	}
}

async function uploadFile(content: string) {
	const inputElement =
		document.querySelector<HTMLInputElement>("input[type=file]");

	assertNonNullish(inputElement, "inputElement is null");
	simulateFileSelection(inputElement, content, "content.txt", "text/plain");

	// Wait for upload
	await waitForTime(5000);
}

async function submitPrompt() {
	const submitButton = await querySelectorAsync<HTMLButtonElement>(
		"[aria-label=Submit]",
	);
	submitButton.click();
}
