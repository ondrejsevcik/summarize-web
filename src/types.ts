import { z } from "zod";

export const MessageSchema = z.object({
	action: z.string(),
	payload: z.unknown(),
});

export type Message = z.infer<typeof MessageSchema>;

export const PromptSchema = z.object({
	promptText: z
		.string()
		.min(1, "Prompt text must be at least 1 character long"),
	attachment: z.string().min(1, "Attachment must be at least 1 character long"),
});

export type Prompt = z.infer<typeof PromptSchema>;

export const GET_CONTENT = "GET_CONTENT";
export const ACTION_SUMMARIZE = "ACTION_SUMMARIZE";

export type SummarizePromptPayload = {
	action: "ACTION_SUMMARIZE";
	payload: Prompt;
};
