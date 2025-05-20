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

// Perplexity button
// <button
//     type="button"
//     class="focus-visible:bg-offsetPlus dark:focus-visible:bg-offsetPlusDark hover:bg-offsetPlus text-textOff dark:text-textOffDark hover:text-textMain dark:hover:bg-offsetPlusDark dark:hover:text-textMainDark px-[4px] font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out font-sans select-none items-center relative group/button justify-center text-center items-center rounded-lg cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-[9/8]"
//     data-state="closed"
// >
//     <div class="flex items-center min-w-0 font-medium gap-1.5 justify-center">
//         <div>
//             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" color="currentColor" fill="currentColor" fill-rule="evenodd">
//                 <path
//                     d="M12.2401 8.96004C10.6561 8.96004 9.36011 7.66404 9.36011 6.08004C9.36011 4.49604 10.6561 3.20004 12.2401 3.20004C13.8241 3.20004 15.1201 4.49604 15.1201 6.08004C15.1201 7.66404 13.8241 8.96004 12.2401 8.96004ZM12.2401 5.12004C11.7121 5.12004 11.2801 5.55204 11.2801 6.08004C11.2801 6.60804 11.7121 7.04004 12.2401 7.04004C12.7681 7.04004 13.2001 6.60804 13.2001 6.08004C13.2001 5.55204 12.7681 5.12004 12.2401 5.12004Z M18 14.7201C16.416 14.7201 15.12 13.4241 15.12 11.8401C15.12 10.2561 16.416 8.96011 18 8.96011C19.584 8.96011 20.88 10.2561 20.88 11.8401C20.88 13.4241 19.584 14.7201 18 14.7201ZM18 10.8801C17.472 10.8801 17.04 11.3121 17.04 11.8401C17.04 12.3681 17.472 12.8001 18 12.8001C18.528 12.8001 18.96 12.3681 18.96 11.8401C18.96 11.3121 18.528 10.8801 18 10.8801Z M6.48004 14.7201C4.89604 14.7201 3.60004 13.4241 3.60004 11.8401C3.60004 10.2561 4.89604 8.96011 6.48004 8.96011C8.06404 8.96011 9.36004 10.2561 9.36004 11.8401C9.36004 13.4241 8.06404 14.7201 6.48004 14.7201ZM6.48004 10.8801C5.95204 10.8801 5.52004 11.3121 5.52004 11.8401C5.52004 12.3681 5.95204 12.8001 6.48004 12.8001C7.00804 12.8001 7.44004 12.3681 7.44004 11.8401C7.44004 11.3121 7.00804 10.8801 6.48004 10.8801Z M12.2401 20.48C10.6561 20.48 9.36011 19.184 9.36011 17.6C9.36011 16.016 10.6561 14.72 12.2401 14.72C13.8241 14.72 15.1201 16.016 15.1201 17.6C15.1201 19.184 13.8241 20.48 12.2401 20.48ZM12.2401 16.64C11.7121 16.64 11.2801 17.072 11.2801 17.6C11.2801 18.128 11.7121 18.56 12.2401 18.56C12.7681 18.56 13.2001 18.128 13.2001 17.6C13.2001 17.072 12.7681 16.64 12.2401 16.64Z"
//                 ></path>
//             </svg>
//         </div>
//     </div>
// </button>

// Perplexity switch
// <button
//     class="group/switch gap-sm flex items-center flex rounded-full duration-150 shadow-inset-xs w-5 h-3.5 p-0.5 data-[state=checked]:justify-end data-[state=checked]:bg-super dark:data-[state=checked]:bg-superDark/85 data-[state=unchecked]:bg-textOff/60 dark:data-[state=unchecked]:bg-textOffDark/35"
//     type="button"
//     role="switch"
//     aria-checked="true"
//     data-state="checked"
//     value="on"
// >
//     <div
//         class="rounded-full relative bg-background dark:bg-text-100 dark:text-main size-2.5 before:content-[''] before:duration-150 before:shadow-xs dark:before:shadow-md before:absolute before:inset-0 before:rounded-full before:bg-background before:dark:bg-white data-[state=unchecked]:opacity:80"
//         data-state="checked"
//     ></div>
// </button>
