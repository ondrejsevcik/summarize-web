import zod from 'zod';

export const MessageSchema = zod.object({
    action: zod.string(),
    payload: zod.unknown(),
});

export type Message = zod.infer<typeof MessageSchema>;

export const PageContent = zod.object({
    title: zod.string(),
    textContent: zod.string(),
});

export type Page = zod.infer<typeof PageContent>;

export const YoutubeContent = zod.object({
    title: zod.string(),
    transcript: zod.string(),
});
export type Youtube = zod.infer<typeof YoutubeContent>;

export const ContentSchema = zod.object({
    title: zod.string().min(1, "Title must be at least 1 character long"),
    attachment: zod.string().min(1, "Attachment must be at least 1 character long"),
})

export type Content = zod.infer<typeof ContentSchema>;

export const PromptSchema = zod.object({
    promptText: zod.string().min(1, "Prompt text must be at least 1 character long"),
    attachment: zod.string().min(1, "Attachment must be at least 1 character long"),
});

export type Prompt = zod.infer<typeof PromptSchema>;

export const GET_PAGE_CONTENT = "GET_PAGE_CONTENT";
export const GET_YOUTUBE_CONTENT = "GET_YOUTUBE_CONTENT";

export const ACTION_SUMMARIZE_PAGE = "ACTION_SUMMARIZE_PAGE";
export const ACTION_SUMMARIZE_YOUTUBE = "ACTION_SUMMARIZE_YOUTUBE";
export const ACTION_SUMMARIZE = "ACTION_SUMMARIZE";

export type PageActionPayload = { action: "ACTION_SUMMARIZE_PAGE", payload: Page };
export type YoutubeActionPayload = { action: "ACTION_SUMMARIZE_YOUTUBE", payload: Youtube };
export type SummarizePromptPayload = { action: "ACTION_SUMMARIZE", payload: Prompt };