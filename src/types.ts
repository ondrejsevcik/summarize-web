import zod from 'zod';

// Zod model for Tweet content, fields - authorName, authorHandle, tweetContent, imageSrc
export const TweetSchema = zod.object({
    authorName: zod.string().nonempty(),
    authorHandle: zod.string().nonempty(),
    tweetContent: zod.string(),
    imageSrc: zod.string().optional(),
});

export const PageContent = zod.object({
    title: zod.string(),
    content: zod.string(),
});

// TypeScript type for Tweet
export type Tweet = zod.infer<typeof TweetSchema>;
// TypeScript type for Page content
export type Page = zod.infer<typeof PageContent>;

export const GET_TWEET_CONTENT = "GET_TWEET_CONTENT";
export const GET_PAGE_CONTENT = "GET_PAGE_CONTENT";

export const ACTION_SUMMARIZE_TWEET = "ACTION_SUMMARIZE_TWEET";
export const ACTION_SUMMARIZE_PAGE = "ACTION_SUMMARIZE_PAGE";

type ContentActions = typeof GET_TWEET_CONTENT | typeof GET_PAGE_CONTENT | typeof ACTION_SUMMARIZE_TWEET;


export type TweetActionPayload = { action: "ACTION_SUMMARIZE_TWEET", data: Tweet };
export type PageActionPayload = { action: "ACTION_SUMMARIZE_PAGE", data: Page };