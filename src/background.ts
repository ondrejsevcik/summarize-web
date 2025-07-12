import {
	ACTION_SUMMARIZE_PAGE,
	ACTION_SUMMARIZE_YOUTUBE,
	GET_PAGE_CONTENT,
	GET_YOUTUBE_CONTENT,
	PageContent,
	YoutubeContent,
	Content,
	type PageActionPayload,
	type YoutubeActionPayload,
	ContentSchema,
	PromptSchema,
	type SummarizePromptPayload,
	ACTION_SUMMARIZE,
} from "./types";
import browser from "webextension-polyfill";
import { getTabId, openTab } from "./utils";
import { PROMPT } from "./prompt";

browser.runtime.onInstalled.addListener(handleInstallation);

function handleInstallation() {
	// Page context menu items
	browser.contextMenus.create({
		id: "summarize-page-in-venice",
		title: "Summarize page in Venice",
		contexts: ["page"],
	});

	browser.contextMenus.create({
		id: "summarize-page-in-claude",
		title: "Summarize page in Claude",
		contexts: ["page"],
	});

	browser.contextMenus.create({
		id: "summarize-page-in-chatgpt",
		title: "Summarize page in ChatGPT",
		contexts: ["page"],
	});

	// Youtube context menu items
	// browser.contextMenus.create({
	// 	id: "summarize-youtube-in-venice",
	// 	title: "Summarize Youtube in Venice",
	// 	contexts: ["page"],
	// 	documentUrlPatterns: ["https://www.youtube.com/*"],
	// });

	// browser.contextMenus.create({
	// 	id: "summarize-youtube-in-claude",
	// 	title: "Summarize Youtube in Claude",
	// 	contexts: ["page"],
	// 	documentUrlPatterns: ["https://www.youtube.com/*"],
	// });

	// browser.contextMenus.create({
	// 	id: "summarize-youtube-in-chatgpt",
	// 	title: "Summarize Youtube in ChatGPT",
	// 	contexts: ["page"],
	// 	documentUrlPatterns: ["https://www.youtube.com/*"],
	// });
}

type Info = browser.Menus.OnClickData;
type Tab = browser.Tabs.Tab;
type ContextMenuHandler = (info: Info, tab: Tab) => Promise<unknown>;

const actionMap = new Map<string, ContextMenuHandler>([
	["summarize-page-in-chatgpt", buildSummarizeContent("https://chatgpt.com")],
	["summarize-page-in-claude", buildSummarizeContent("https://claude.ai/new")],
	["summarize-page-in-venice", buildSummarizeContent("https://venice.ai/chat")],
	// [
	// 	"summarize-youtube-in-chatgpt",
	// 	buildSummarizeYoutube("https://chatgpt.com"),
	// ],
	// [
	// 	"summarize-youtube-in-claude",
	// 	buildSummarizeYoutube("https://claude.ai/new"),
	// ],
	// [
	// 	"summarize-youtube-in-venice",
	// 	buildSummarizeYoutube("https://venice.ai/chat"),
	// ],
]);

browser.contextMenus.onClicked.addListener((info, tab) => {
	if (!tab) {
		throw new Error("Tab is undefined in context menu click handler");
	}

	const menuItemId = String(info.menuItemId);
	const handler = actionMap.get(menuItemId);
	handler?.(info, tab);
});

function buildSummarizeContent(aiToolUrl: string) {
	return async function summarizePage(info: Info, tab: Tab) {
		const tabId = getTabId(tab);

		let event: Promise<unknown> | undefined = undefined;

		if (tab.url?.includes("youtube.com")) {
			event = browser.tabs.sendMessage(tabId, {
				action: GET_YOUTUBE_CONTENT,
			});
		} else {
			event = browser.tabs.sendMessage(tabId, {
				action: GET_PAGE_CONTENT,
			});
		}

		event.then(async function handleResponse(value: unknown) {
			const aiTab = await openTab(aiToolUrl);
			const tabId = getTabId(aiTab);
			browser.tabs.sendMessage(tabId, {
				action: ACTION_SUMMARIZE,
				payload: PromptSchema.parse({
					promptText: PROMPT,
					attachment: value,
				}),
			} satisfies SummarizePromptPayload);
		});
	};
}

// function buildSummarizeYoutube(aiToolUrl: string) {
// 	return async function summarizeYoutube(info: Info, tab: Tab) {
// 		const tabId = getTabId(tab);

// 		browser.tabs
// 			.sendMessage(tabId, { action: GET_YOUTUBE_CONTENT })
// 			.then(async function handleResponse(value: unknown) {
// 				const aiTab = await openTab(aiToolUrl);
// 				const tabId = getTabId(aiTab);
// 				browser.tabs.sendMessage(tabId, {
// 					action: ACTION_SUMMARIZE_YOUTUBE,
// 					payload: YoutubeContent.parse(value),
// 				} satisfies YoutubeActionPayload);
// 			});
// 	};
// }
