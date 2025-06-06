import zod from 'zod';

export const MessageSchema = zod.object({
    action: zod.string(),
    payload: zod.unknown(),
});

export type Message = zod.infer<typeof MessageSchema>;

export const TweetSchema = zod.object({
    authorName: zod.string().nonempty(),
    authorHandle: zod.string().nonempty(),
    tweetContent: zod.string(),
    imageSrc: zod.string().optional(),
});

export type Tweet = zod.infer<typeof TweetSchema>;

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

export const GET_TWEET_CONTENT = "GET_TWEET_CONTENT";
export const GET_PAGE_CONTENT = "GET_PAGE_CONTENT";
export const GET_YOUTUBE_CONTENT = "GET_YOUTUBE_CONTENT";

export const ACTION_SUMMARIZE_TWEET = "ACTION_SUMMARIZE_TWEET";
export const ACTION_SUMMARIZE_PAGE = "ACTION_SUMMARIZE_PAGE";
export const ACTION_SUMMARIZE_YOUTUBE = "ACTION_SUMMARIZE_YOUTUBE";
export const ACTION_SUMMARIZE_SELECTION = "ACTION_SUMMARIZE_SELECTION";
export const FIX_GRAMMAR = "FIX_GRAMMAR";

export type TweetActionPayload = { action: "ACTION_SUMMARIZE_TWEET", payload: Tweet };
export type PageActionPayload = { action: "ACTION_SUMMARIZE_PAGE", payload: Page };
export type YoutubeActionPayload = { action: "ACTION_SUMMARIZE_YOUTUBE", payload: Youtube };
export type FixGrammarActionPayload = { action: "FIX_GRAMMAR", payload: string };
export type SummarizeSelectionActionPayload = { action: "ACTION_SUMMARIZE_SELECTION", payload: string };