import { Readability } from "@mozilla/readability";
import browser from "webextension-polyfill";
import {
	GET_PAGE_CONTENT,
	MessageSchema,
	PageContent,
	type Page,
} from "./types";

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(message: unknown) {
	const { action } = MessageSchema.parse(message);

	if (action === GET_PAGE_CONTENT) {
		return getPageContent();
	}
}

async function getPageContent(): Promise<Page> {
	const documentClone = document.cloneNode(true) as Document;
	const article = new Readability(documentClone).parse();

	return PageContent.parse(article);
}
