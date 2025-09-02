import browser from "webextension-polyfill";
import { PROMPT } from "./prompt";
import {
	ACTION_SUMMARIZE,
	GET_CONTENT,
	PromptSchema,
	type SummarizePromptPayload,
} from "./types";
import { getTabId, openTab } from "./utils";

browser.runtime.onInstalled.addListener(handleInstallation);

function handleInstallation() {
	browser.contextMenus.create({
		id: "summarize-page-in-venice",
		title: "Summarize in Venice",
		contexts: ["page"],
	});

	browser.contextMenus.create({
		id: "summarize-page-in-claude",
		title: "Summarize in Claude",
		contexts: ["page"],
	});

	browser.contextMenus.create({
		id: "summarize-page-in-chatgpt",
		title: "Summarize in ChatGPT",
		contexts: ["page"],
	});

	browser.contextMenus.create({
		id: "summarize-page-in-mistral",
		title: "Summarize in Mistral",
		contexts: ["page"],
	});

	browser.contextMenus.create({
		id: "download-content",
		title: "Download Content as TXT file",
		contexts: ["page"],
	});
}

type Info = browser.Menus.OnClickData;
type Tab = browser.Tabs.Tab;
type ContextMenuHandler = (info: Info, tab: Tab) => Promise<unknown>;

const actionMap = new Map<string, ContextMenuHandler>([
	["summarize-page-in-venice", buildSummarizeContent("https://venice.ai/chat")],
	["summarize-page-in-claude", buildSummarizeContent("https://claude.ai/new")],
	["summarize-page-in-chatgpt", buildSummarizeContent("https://chatgpt.com")],
	[
		"summarize-page-in-mistral",
		buildSummarizeContent("https://chat.mistral.ai"),
	],
	["download-content", downloadContentAsTxtFile],
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
	return async function summarizePage(_info: Info, tab: Tab) {
		const tabId = getTabId(tab);

		browser.tabs
			.sendMessage(tabId, { action: GET_CONTENT })
			.then(async function handleResponse(value: unknown) {
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

async function downloadContentAsTxtFile(_info: Info, tab: Tab): Promise<void> {
	const tabId = getTabId(tab);

	browser.tabs
		.sendMessage(tabId, { action: GET_CONTENT })
		.then(async function handleResponse(value: unknown) {
			if (typeof value !== "string") {
				throw new Error("Expected content to be a string");
			}

			const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(value)}`;
			const filename = `content-${Date.now()}.txt`;

			await browser.downloads.download({
				url: dataUrl,
				filename,
				saveAs: false,
			});
		});
}
