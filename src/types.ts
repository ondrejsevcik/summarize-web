import zod from 'zod';

// Zod model for Tweet content, fields - authorName, authorHandle, tweetContent, imageSrc
export const TweetSchema = zod.object({
    authorName: zod.string().nonempty(),
    authorHandle: zod.string().nonempty(),
    tweetContent: zod.string(),
    imageSrc: zod.string().optional(),
});

// TypeScript type for Tweet
export type Tweet = zod.infer<typeof TweetSchema>;

export const GET_TWEET_CONTENT = "GET_TWEET_CONTENT";
export const ACTION_SUMMARIZE_TWEET = "ACTION_SUMMARIZE_TWEET";

type ContentActions = typeof GET_TWEET_CONTENT | typeof ACTION_SUMMARIZE_TWEET;


export type TweetActionPayload = { action: "ACTION_SUMMARIZE_TWEET", data: Tweet };