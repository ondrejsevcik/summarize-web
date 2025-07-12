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
	// Page context menu items
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
		id: "summarize-page-in-venice",
		title: "Summarize page in Venice",
		contexts: ["page"],
	});

	// Youtube context menu items
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
		id: "summarize-youtube-in-venice",
		title: "Summarize Youtube in Venice",
		contexts: ["page"],
		documentUrlPatterns: ["https://www.youtube.com/*"],
	});

	// Selection context menu items
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
	["summarize-selection-in-chatgpt", buildSummarizeSelection("https://chatgpt.com")],
	["summarize-page-in-chatgpt", buildSummarizePage("https://chatgpt.com")],
	["summarize-page-in-claude", buildSummarizePage("https://claude.ai/new")],
	["summarize-page-in-venice", buildSummarizePage("https://venice.ai/chat")],
	[
		"summarize-youtube-in-chatgpt",
		buildSummarizeYoutube("https://chatgpt.com"),
	],
	[
		"summarize-youtube-in-claude",
		buildSummarizeYoutube("https://claude.ai/new"),
	],
	[
		"summarize-youtube-in-venice",
		buildSummarizeYoutube("https://venice.ai/chat"),
	],
]);

browser.contextMenus.onClicked.addListener((info, tab) => {
	if (!tab) {
		throw new Error("Tab is undefined in context menu click handler");
	}

	const menuItemId = String(info.menuItemId);
	const handler = actionMap.get(menuItemId);
	handler?.(info, tab);
});

function buildSummarizeSelection(aiToolUrl: string) {
	return async function summarizeSelection(info: Info, tab: Tab) {
		const selectedText = info.selectionText ?? "";
		const aiTab = await openTab(aiToolUrl);
		const tabId = getTabId(aiTab);
		browser.tabs.sendMessage(tabId, {
			action: ACTION_SUMMARIZE_SELECTION,
			payload: selectedText,
		} satisfies SummarizeSelectionActionPayload);
	};
}

function buildSummarizePage(aiToolUrl: string) {
	return async function summarizePage(info: Info, tab: Tab) {
		const tabId = getTabId(tab);

		browser.tabs
			.sendMessage(tabId, { action: GET_PAGE_CONTENT })
			.then(async function handleResponse(value: unknown) {
				const aiTab = await openTab(aiToolUrl);
				const tabId = getTabId(aiTab);
				browser.tabs.sendMessage(tabId, {
					action: ACTION_SUMMARIZE_PAGE,
					payload: PageContent.parse(value),
				} satisfies PageActionPayload);
			});
	};
}

function buildSummarizeYoutube(aiToolUrl: string) {
	return async function summarizeYoutube(info: Info, tab: Tab) {
		const tabId = getTabId(tab);

		browser.tabs
			.sendMessage(tabId, { action: GET_YOUTUBE_CONTENT })
			.then(async function handleResponse(value: unknown) {
				const aiTab = await openTab(aiToolUrl);
				const tabId = getTabId(aiTab);
				browser.tabs.sendMessage(tabId, {
					action: ACTION_SUMMARIZE_YOUTUBE,
					payload: YoutubeContent.parse(value),
				} satisfies YoutubeActionPayload);
			});
	};
}
