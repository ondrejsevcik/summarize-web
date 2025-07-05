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
import { getTabId, openTab } from "./utils";

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
		id: "summarize-page-in-claude",
		title: "Summarize page in Claude",
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
		id: "summarize-youtube-in-claude",
		title: "Summarize Youtube in Claude",
		contexts: ["page"],
		documentUrlPatterns: ["https://www.youtube.com/*"],
	});

	browser.contextMenus.create({
		id: "summarize-selection-in-perplexity",
		title: "Summarize selection in Perplexity",
		contexts: ["selection"],
	});

	browser.contextMenus.create({
		id: "summarize-selection-in-chatgpt",
		title: "Summarize selection in ChatGPT",
		contexts: ["selection"],
	});
}

type Info = browser.Menus.OnClickData;
type Tab = browser.Tabs.Tab;
type ContextMenuHandler = (info: Info, tab: Tab) => Promise<unknown>;

const actionMap = new Map<string, ContextMenuHandler>([
	["summarize-selection-in-perplexity", summarizeSelectionInPerplexity],
	["summarize-selection-in-chatgpt", summarizeSelectionInChatGPT],
	["summarize-page-in-perplexity", summarizePageInPerplexity],
	["summarize-page-in-chatgpt", summarizePageInChatGPT],
	["summarize-page-in-claude", summarizePageInClaude],
	["summarize-youtube-in-perplexity", summarizeYoutubeInPerplexity],
	["summarize-youtube-in-chatgpt", summarizeYoutubeInChatGPT],
	["summarize-youtube-in-claude", summarizeYoutubeInClaude],
]);

browser.contextMenus.onClicked.addListener((info, tab) => {
	if (!tab) {
		throw new Error("Tab is undefined in context menu click handler");
	}

	const menuItemId = String(info.menuItemId);
	const handler = actionMap.get(menuItemId);
	handler?.(info, tab);
});

async function summarizePageInPerplexity(info: Info, tab: Tab) {
	const tabId = getTabId(tab);

	browser.tabs
		.sendMessage(tabId, { action: GET_PAGE_CONTENT })
		.then(async function handleResponse(value: unknown) {
			const perplexityTab = await openTab("https://www.perplexity.ai/");
			const perplexityTabId = getTabId(perplexityTab);
			browser.tabs.sendMessage(perplexityTabId, {
				action: ACTION_SUMMARIZE_PAGE,
				payload: PageContent.parse(value),
			} satisfies PageActionPayload);
		});
}

async function summarizeSelectionInPerplexity(info: Info, tab: Tab) {
	const selectedText = info.selectionText ?? "";
	const perplexityTab = await openTab("https://perplexity.ai");
	browser.tabs.sendMessage(getTabId(perplexityTab), {
		action: ACTION_SUMMARIZE_SELECTION,
		payload: selectedText,
	} satisfies SummarizeSelectionActionPayload);
}

async function summarizeSelectionInChatGPT(info: Info, tab: Tab) {
	const selectedText = info.selectionText ?? "";
	const openedTab = await openTab("https://chatgpt.com");
	browser.tabs.sendMessage(getTabId(openedTab), {
		action: ACTION_SUMMARIZE_SELECTION,
		payload: selectedText,
	} satisfies SummarizeSelectionActionPayload);
}

async function summarizePageInChatGPT(info: Info, tab: Tab) {
	const tabId = getTabId(tab);

	browser.tabs
		.sendMessage(tabId, { action: GET_PAGE_CONTENT })
		.then(async function handleResponse(value: unknown) {
			const chatGPTTab = await openTab("https://chatgpt.com");
			const chatGPTTabId = getTabId(chatGPTTab);
			browser.tabs.sendMessage(chatGPTTabId, {
				action: ACTION_SUMMARIZE_PAGE,
				payload: PageContent.parse(value),
			} satisfies PageActionPayload);
		});
}

async function summarizePageInClaude(info: Info, tab: Tab) {
	const tabId = getTabId(tab);

	browser.tabs
		.sendMessage(tabId, { action: GET_PAGE_CONTENT })
		.then(async function handleResponse(value: unknown) {
			const aiTab = await openTab("https://claude.ai/new");
			const tabId = getTabId(aiTab);
			browser.tabs.sendMessage(tabId, {
				action: ACTION_SUMMARIZE_PAGE,
				payload: PageContent.parse(value),
			} satisfies PageActionPayload);
		});
}

async function summarizeYoutubeInPerplexity(info: Info, tab: Tab) {
	const tabId = getTabId(tab);

	browser.tabs
		.sendMessage(tabId, { action: GET_YOUTUBE_CONTENT })
		.then(async function handleResponse(value: unknown) {
			const perplexityTab = await openTab("https://www.perplexity.ai/");
			const perplexityTabId = getTabId(perplexityTab);
			browser.tabs.sendMessage(perplexityTabId, {
				action: ACTION_SUMMARIZE_YOUTUBE,
				payload: YoutubeContent.parse(value),
			} satisfies YoutubeActionPayload);
		});
}

async function summarizeYoutubeInChatGPT(info: Info, tab: Tab) {
	const tabId = getTabId(tab);

	browser.tabs
		.sendMessage(tabId, { action: GET_YOUTUBE_CONTENT })
		.then(async function handleResponse(value: unknown) {
			const chatGPTTab = await openTab("https://chatgpt.com");
			const chatGPTTabId = getTabId(chatGPTTab);
			browser.tabs.sendMessage(chatGPTTabId, {
				action: ACTION_SUMMARIZE_YOUTUBE,
				payload: YoutubeContent.parse(value),
			} satisfies YoutubeActionPayload);
		});
}

async function summarizeYoutubeInClaude(info: Info, tab: Tab) {
	const tabId = getTabId(tab);

	browser.tabs
		.sendMessage(tabId, { action: GET_YOUTUBE_CONTENT })
		.then(async function handleResponse(value: unknown) {
			const aiTab = await openTab("https://claude.ai/new");
			const tabId = getTabId(aiTab);
			browser.tabs.sendMessage(tabId, {
				action: ACTION_SUMMARIZE_YOUTUBE,
				payload: YoutubeContent.parse(value),
			} satisfies YoutubeActionPayload);
		});
}
