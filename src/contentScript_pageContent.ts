import { Readability } from "@mozilla/readability";
import browser from "webextension-polyfill";
import { GET_PAGE_CONTENT, MessageSchema } from "./types";

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(message: unknown) {
	const { action } = MessageSchema.parse(message);

	if (action === GET_PAGE_CONTENT) {
		return getPageContent();
	}
}

async function getPageContent(): Promise<string> {
	const documentClone = document.cloneNode(true) as Document;
	const article = new Readability(documentClone).parse();

	const title = article?.title || document.title;
	const content = article?.textContent || document.body.textContent || "";
	const attachment = `Page Title: ${title}\n\nContent:\n${content}`;

	return attachment;
}
