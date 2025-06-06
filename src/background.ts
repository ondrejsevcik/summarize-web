import {
	ACTION_SUMMARIZE_PAGE,
	ACTION_SUMMARIZE_SELECTION,
	ACTION_SUMMARIZE_YOUTUBE,
	GET_PAGE_CONTENT,
	GET_YOUTUBE_CONTENT,
	PageContent,
	YoutubeContent,
	type PageActionPayload,
	type SummarizeSelectionActionPayload,
	type YoutubeActionPayload,
} from "./types";
import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(handleInstallation);

function handleInstallation() {
	browser.contextMenus.create({
		id: "summarize-page-in-perplexity",
		title: "Summarize page in Perplexity",
		contexts: ["page"],
	});

	browser.contextMenus.create({
		id: "summarize-page-in-chatgpt",
		title: "Summarize page in ChatGPT",
		contexts: ["page"],
	});

	browser.contextMenus.create({
		id: "summarize-youtube-in-perplexity",
		title: "Summarize Youtube in Perplexity",
		contexts: ["page"],
		documentUrlPatterns: ["https://www.youtube.com/*"],
	});

	browser.contextMenus.create({
		id: "summarize-youtube-in-chatgpt",
		title: "Summarize Youtube in ChatGPT",
		contexts: ["page"],
		documentUrlPatterns: ["https://www.youtube.com/*"],
	});

	browser.contextMenus.create({
		id: "summarize-selection-in-perplexity",
		title: "Summarize selection in Perplexity",
		contexts: ["selection"],
	});

	// TODO add summarize selection in ChatGPT
}

function getTabId(tab: browser.Tabs.Tab | undefined): number {
	if (!tab || !tab.id) {
		throw new Error("Tab is not available or does not have an ID.");
	}

	return tab.id;
}

type ContextMenuHandler = Parameters<
	typeof browser.contextMenus.onClicked.addListener
>[0];

const summarizePageInPerplexity: ContextMenuHandler = (info, tab) => {
	const tabId = getTabId(tab);

	browser.tabs
		.sendMessage(tabId, { action: GET_PAGE_CONTENT })
		.then(async function handleResponse(value: unknown) {
			const perplexityTab = await openAndWaitForComplete(
				"https://www.perplexity.ai/",
			);
			const perplexityTabId = getTabId(perplexityTab);
			browser.tabs.sendMessage(perplexityTabId, {
				action: ACTION_SUMMARIZE_PAGE,
				payload: PageContent.parse(value),
			} satisfies PageActionPayload);
		});
};

const summarizeSelectionInPerplexity: ContextMenuHandler = async (
	info,
	tab,
) => {
	const selectedText = info.selectionText ?? "";
	const perplexityTab = await openAndWaitForComplete("https://perplexity.ai");
	browser.tabs.sendMessage(getTabId(perplexityTab), {
		action: ACTION_SUMMARIZE_SELECTION,
		payload: selectedText,
	} satisfies SummarizeSelectionActionPayload);
};

const summarizePageInChatGPT: ContextMenuHandler = (info, tab) => {
	const tabId = getTabId(tab);

	browser.tabs
		.sendMessage(tabId, { action: GET_PAGE_CONTENT })
		.then(async function handleResponse(value: unknown) {
			const chatGPTTab = await openAndWaitForComplete("https://chatgpt.com");
			const chatGPTTabId = getTabId(chatGPTTab);
			browser.tabs.sendMessage(chatGPTTabId, {
				action: ACTION_SUMMARIZE_PAGE,
				payload: PageContent.parse(value),
			} satisfies PageActionPayload);
		});
};

const summarizeYoutubeInPerplexity: ContextMenuHandler = (info, tab) => {
	const tabId = getTabId(tab);
	
	browser.tabs
		.sendMessage(tabId, { action: GET_YOUTUBE_CONTENT })
		.then(async function handleResponse(value: unknown) {
			const perplexityTab = await openAndWaitForComplete("https://www.perplexity.ai/");
			const perplexityTabId = getTabId(perplexityTab);
			browser.tabs.sendMessage(perplexityTabId, {
				action: ACTION_SUMMARIZE_YOUTUBE,
				payload: YoutubeContent.parse(value),
			} satisfies YoutubeActionPayload);
		});
};

const summarizeYoutubeInChatGPT: ContextMenuHandler = (info, tab) => {
	const tabId = getTabId(tab);
	
	browser.tabs
		.sendMessage(tabId, { action: GET_YOUTUBE_CONTENT })
		.then(async function handleResponse(value: unknown) {
			const chatGPTTab = await openAndWaitForComplete("https://chatgpt.com");
			const chatGPTTabId = getTabId(chatGPTTab);
			browser.tabs.sendMessage(chatGPTTabId, {
				action: ACTION_SUMMARIZE_YOUTUBE,
				payload: YoutubeContent.parse(value),
			} satisfies YoutubeActionPayload);
		});
};

const actionMap = new Map<string, ContextMenuHandler>([
	["summarize-page-in-perplexity", summarizePageInPerplexity],
	["summarize-selection-in-perplexity", summarizeSelectionInPerplexity],
	['summarize-page-in-chatgpt', summarizePageInChatGPT],
	['summarize-youtube-in-perplexity', summarizeYoutubeInPerplexity],
	['summarize-youtube-in-chatgpt', summarizeYoutubeInChatGPT],
]);

browser.contextMenus.onClicked.addListener((info, tab) => {
	const handler = actionMap.get(String(info.menuItemId));
	handler?.(info, tab);
});

type OnTabUpdatedListener = Parameters<
	typeof browser.tabs.onUpdated.addListener
>[0];

// TODO move to utils
async function openAndWaitForComplete(url: string): Promise<browser.Tabs.Tab> {
	return new Promise((resolve, reject) => {
		browser.tabs.create({ url }).then((openedTab) => {
			const checkTabLoaded: OnTabUpdatedListener = (
				tabId,
				changeInfo,
				updatedTab,
			) => {
				if (browser.runtime.lastError) {
					return reject(new Error(browser.runtime.lastError.message));
				}

				// Make sure we're looking at the right tab
				if (tabId !== openedTab.id) {
					return;
				}

				// If the tab is fully loaded
				if (changeInfo.status === "complete") {
					// Remove the event listener to avoid memory leaks
					browser.tabs.onUpdated.removeListener(checkTabLoaded);

					// Resolve the promise with the updated tab
					resolve(updatedTab);
				}
			};

			// Add the listener for tab updates
			browser.tabs.onUpdated.addListener(checkTabLoaded);
		});
	});
}
