import { describe, expect, it } from "vitest";
import {
    CHAT_REQUEST_TIMEOUT_SECONDS,
    useChatConversation
} from "./useChatConversation";
import type { ChatGenerationRequest, ChatGenerationResult } from "@/assets/scripts/Application/Providers";

const provider = {
    providerType: "openai_compatible" as const,
    endpoint: "https://provider.example/v1",
    apiKey: "secret",
    model: "gpt-4o-mini"
};

describe("useChatConversation", () => {
    it("separates context compaction from the completed response", async () => {
        const requests: ChatGenerationRequest[] = [];
        let finishCompaction: ((result: ChatGenerationResult) => void) | undefined;
        const conversation = useChatConversation({
            getProviderConfig: () => provider,
            getFlowSnapshot: () => "{\"flow\":true}",
            createAdapter: () => ({
                async generateChat(request) {
                    requests.push(request);
                    if (request.purpose === "summary") {
                        return new Promise<ChatGenerationResult>((resolve) => {
                            finishCompaction = resolve;
                        });
                    }

                    return {
                        providerId: "runtime-openai_compatible",
                        providerType: provider.providerType,
                        model: provider.model,
                        text: "pancakes",
                        finishReason: "stop"
                    };
                }
            })
        });

        for (let index = 1; index <= 12; index += 1) {
            await conversation.submit(`Question ${index}`);
        }

        expect(conversation.messages.value).toHaveLength(24);
        expect(conversation.messages.value[0]).toMatchObject({ role: "user", content: "Question 1" });
        expect(conversation.isSending.value).toBe(false);
        expect(conversation.isCompacting.value).toBe(true);
        expect(requests).toHaveLength(13);
        expect(requests[0].timeoutSeconds).toBe(CHAT_REQUEST_TIMEOUT_SECONDS);

        const summaryRequest = requests.at(-1)!;
        expect(summaryRequest.systemInstruction).toContain("summary");
        expect(summaryRequest.messages).toHaveLength(13);
        expect(summaryRequest.messages.slice(1)).toEqual(
            Array.from({ length: 12 }, (_, index) => ({
                role: index % 2 === 0 ? "user" : "assistant",
                content: index % 2 === 0 ? `Question ${index / 2 + 1}` : "pancakes"
            }))
        );

        await conversation.submit("Question 13");
        expect(conversation.messages.value).toHaveLength(24);

        finishCompaction?.({
            providerId: "runtime-openai_compatible",
            providerType: provider.providerType,
            model: provider.model,
            text: "Earlier decision: preserve evidence.",
            finishReason: "stop"
        });
        await new Promise((resolve) => setTimeout(resolve));
        expect(conversation.isCompacting.value).toBe(false);
    });

    it("keeps the query in the log and reports a configuration error without a provider", async () => {
        const conversation = useChatConversation({
            getProviderConfig: () => null,
            getFlowSnapshot: () => "{}"
        });

        await conversation.submit("What is missing?");

        expect(conversation.messages.value).toEqual([
            { id: 0, role: "user", content: "What is missing?" }
        ]);
        expect(conversation.errorMessage.value).toContain("Configure a direct provider");
    });
});
