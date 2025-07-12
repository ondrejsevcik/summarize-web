import { simulateFileSelection } from "./dom-utils";
import {
	ACTION_SUMMARIZE_PAGE,
	ACTION_SUMMARIZE_YOUTUBE,
	MessageSchema,
	PageContent,
	YoutubeContent,
	type Page,
	type Youtube,
} from "./types";
import { querySelectorAsync, waitFor } from "./utils";
import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(message: unknown) {
	const { action, payload } = MessageSchema.parse(message);

	if (action === ACTION_SUMMARIZE_PAGE) {
		return PageContent.parseAsync(payload).then(runPageSummarization);
	}

	if (action === ACTION_SUMMARIZE_YOUTUBE) {
		return YoutubeContent.parseAsync(payload).then(runYoutubeSummarization);
	}
}

async function runPageSummarization(pageData: Page) {
	await updateEditorValue(PROMPT);

	const fileContent = `Page Title: ${pageData.title}\n\nContent:\n${pageData.textContent}`;
	await uploadFile(fileContent);
	await submitButton();
}

async function runYoutubeSummarization(youtubeData: Youtube) {
	// const prompt = "Give me key ideas from the attached YouTube transcript.";
	await updateEditorValue(PROMPT);

	const fileContent = `Youtube Video Title: ${youtubeData.title}\n\nTranscript:\n${youtubeData.transcript}`;
	await uploadFile(fileContent);
	await submitButton();
}

async function updateEditorValue(value: string) {
	const editorElement =
		await querySelectorAsync<HTMLTextAreaElement>(".chakra-textarea");

	// Update textarea value
	editorElement.value = value;
	editorElement.dispatchEvent(new Event("input", { bubbles: true }));
}

async function uploadFile(fileContent: string) {
	const inputElement = await querySelectorAsync<HTMLInputElement>(
		"input[name='attachments']",
	);
	simulateFileSelection(inputElement, fileContent, "content.txt", "text/plain");
}

async function submitButton() {
	const oneMinuteTimeout = 60 * 1000;

	await waitFor(() => {
		// Wait for the submit button to be enabled
		const button = document.querySelector<HTMLButtonElement>(
			"[aria-label='Submit chat']",
		);
		return button?.disabled === false;
	}, oneMinuteTimeout);

	// Wait extra second to ensure the UI is ready
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const submitButton = await querySelectorAsync<HTMLButtonElement>(
		"[aria-label='Submit chat']",
	);

	submitButton.click();
}

// const PROMPT = `Please analyze this content and create a structured summary that includes:

// 1. **Clear thematic organization** - Group related ideas under descriptive section headings
// 2. **Key insights with explanations** - Don't just list points, but briefly explain the reasoning or context
// 3. **Actionable takeaways** - Highlight practical applications where relevant
// 4. **Hierarchical structure** - Use bullet points or sub-bullets to show relationships between ideas
// 5. **Preserve important nuances** - Include any important caveats or counterpoints mentioned

// Format the summary using markdown with clear headings and bullet points for easy scanning.`;

// const PROMPT =
// 	"Summarize the key ideas from the content in a clear and structured way. Organize the summary into thematic sections with descriptive headings. Use bullet points to highlight the most important insights or takeaways under each theme. Focus on clarity, depth, and preserving the intent and tone of the original content.";


const PROMPT = `Analyze the provided content and create a structured summary using the following format:

## Instructions:
1. **Identify 4-10 main thematic sections** that capture the core elements of the content
2. **Use descriptive, specific headings** that clearly indicate what each section covers
3. **Write in clear, accessible language** while maintaining accuracy
4. **Include key facts, quotes, and details** that support each main point
5. **Maintain logical flow** from most important/immediate information to broader context
6. **Highlight expert opinions, official statements, or authoritative sources** when present
7. **Note uncertainties, ongoing developments, or unanswered questions** where relevant

## Structure Template:
- Start with the most immediate/important information
- Progress to context and background
- Include analysis or expert perspectives
- End with implications, next steps, or unresolved aspects

## Formatting:
- Use ## for main section headings
- Use **bold** for emphasis on key terms, names, or critical facts
- Hierarchical structure - Use bullet points or sub-bullets to show relationships between ideas
- Keep each section focused but comprehensive
- Conclude with a brief statement about the overall significance or current status

Adapt the specific headings and focus areas to match the content type (news, research, business, technical documentation, etc.) while maintaining this structured, informative approach.`