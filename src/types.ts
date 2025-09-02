import zod from "zod";

export const MessageSchema = zod.object({
	action: zod.string(),
	payload: zod.unknown(),
});

export type Message = zod.infer<typeof MessageSchema>;

export const PromptSchema = zod.object({
	promptText: zod
		.string()
		.min(1, "Prompt text must be at least 1 character long"),
	attachment: zod
		.string()
		.min(1, "Attachment must be at least 1 character long"),
});

export type Prompt = zod.infer<typeof PromptSchema>;

export const GET_CONTENT = "GET_CONTENT";
export const ACTION_SUMMARIZE = "ACTION_SUMMARIZE";

export type SummarizePromptPayload = {
	action: "ACTION_SUMMARIZE";
	payload: Prompt;
};
