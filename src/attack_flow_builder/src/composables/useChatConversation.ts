import { computed, ref } from "vue";
import sharedPrompts from "@afb-ai-prompts";
import type { RuntimeProviderConfig } from "@/assets/scripts/Application/Configuration";
import {
    AiSdkProviderAdapter,
    type ChatGenerationRequest,
    type ChatGenerationResult,
    type ChatMessage
} from "@/assets/scripts/Application/Providers";

const COMPACTION_THRESHOLD = 24;
const COMPACTION_BATCH_SIZE = 12;
export const CHAT_REQUEST_TIMEOUT_SECONDS = 300 as const;

const CHAT_SYSTEM_INSTRUCTION = sharedPrompts.chat.system_instruction;
const SUMMARY_SYSTEM_INSTRUCTION = sharedPrompts.chat.summary_instruction;

export interface ChatLogMessage extends ChatMessage {
    id: number;
}

interface UseChatConversationOptions {
    getProviderConfig: () => RuntimeProviderConfig | null;
    getFlowSnapshot: () => string;
    createAdapter?: (provider: RuntimeProviderConfig) => ChatCompletionAdapter;
    createApiAdapter?: () => ChatCompletionAdapter | null;
    useApiAdapter?: () => boolean;
}

interface ChatCompletionAdapter {
    generateChat(request: ChatGenerationRequest): Promise<ChatGenerationResult>;
}

function createChatRequest(
    provider: RuntimeProviderConfig,
    systemInstruction: string,
    messages: ChatMessage[],
    purpose: "chat" | "summary"
): ChatGenerationRequest {
    return {
        providerType: provider.providerType,
        endpoint: provider.endpoint,
        apiKey: provider.apiKey,
        model: provider.model,
        useAzure: provider.useAzure,
        azureApiVersion: provider.azureApiVersion,
        extraHeaders: provider.extraHeaders,
        systemInstruction,
        purpose,
        messages,
        timeoutSeconds: CHAT_REQUEST_TIMEOUT_SECONDS
    };
}

/**
 * Owns local chat history and turns it into bounded direct-provider context.
 * The visible log is never discarded; only the request context is compacted.
 */
export function useChatConversation(options: UseChatConversationOptions) {
    const messages = ref<ChatLogMessage[]>([]);
    const isSending = ref(false);
    const isCompacting = ref(false);
    const isBusy = computed(() => isSending.value || isCompacting.value);
    const errorMessage = ref("");
    const summary = ref("");
    let compactedMessageCount = 0;
    let nextMessageId = 0;
    let compactionPromise: Promise<void> | null = null;

    function addMessage(role: ChatMessage["role"], content: string) {
        messages.value.push({ id: nextMessageId++, role, content });
    }

    function uncompactMessages(): ChatMessage[] {
        return messages.value.slice(compactedMessageCount).map(({ role, content }) => ({ role, content }));
    }

    async function compactContext(adapter: ChatCompletionAdapter, provider: RuntimeProviderConfig) {
        const uncompacted = uncompactMessages();
        if (uncompacted.length < COMPACTION_THRESHOLD) {
            return;
        }

        const retiringMessages = uncompacted.slice(0, COMPACTION_BATCH_SIZE);
        const summaryInput: ChatMessage[] = [
            {
                role: "user",
                content: summary.value
                    ? `Existing summary:\n${summary.value}`
                    : "There is no existing conversation summary."
            },
            ...retiringMessages
        ];

        try {
            const result = await adapter.generateChat(createChatRequest(
                provider,
                SUMMARY_SYSTEM_INSTRUCTION,
                summaryInput,
                "summary"
            ));
            const replacement = result.text.trim();
            if (replacement) {
                summary.value = replacement;
                compactedMessageCount += retiringMessages.length;
            }
        } catch {
            // Keep the raw messages intact. The normal reply can still use the newest context.
        }
    }

    function beginCompaction(adapter: ChatCompletionAdapter, provider: RuntimeProviderConfig) {
        if (compactionPromise || uncompactMessages().length < COMPACTION_THRESHOLD) {
            return;
        }

        isCompacting.value = true;
        compactionPromise = compactContext(adapter, provider).finally(() => {
            isCompacting.value = false;
            compactionPromise = null;
        });
    }

    function buildConversationContext(): ChatMessage[] {
        const flowSnapshot = options.getFlowSnapshot();
        const context: ChatMessage[] = [
            { role: "user", content: `Current Attack Flow:\n${flowSnapshot}` }
        ];

        if (summary.value) {
            context.push({ role: "user", content: `Earlier conversation summary:\n${summary.value}` });
        }

        const uncompacted = uncompactMessages();
        // If summarization previously failed, preserve a bounded request while retaining the full UI log.
        context.push(...(uncompacted.length >= COMPACTION_THRESHOLD
            ? uncompacted.slice(-COMPACTION_BATCH_SIZE)
            : uncompacted));
        return context;
    }

    async function submit(query: string) {
        const trimmedQuery = query.trim();
        if (!trimmedQuery || isBusy.value) {
            return;
        }

        const provider = options.getProviderConfig();
        addMessage("user", trimmedQuery);
        errorMessage.value = "";
        isSending.value = true;

        try {
            const apiAdapter = options.useApiAdapter?.() ? options.createApiAdapter?.() : null;
            if (!apiAdapter && !provider) {
                throw new Error("Configure a direct provider in Chat Settings before sending a message.");
            }

            const requestProvider: RuntimeProviderConfig = provider ?? {
                providerType: "openai_compatible",
                endpoint: "",
                apiKey: "",
                model: ""
            };
            const adapter = apiAdapter ?? options.createAdapter?.(provider!) ?? new AiSdkProviderAdapter(provider!);
            const result = await adapter.generateChat(createChatRequest(
                requestProvider,
                CHAT_SYSTEM_INSTRUCTION,
                buildConversationContext(),
                "chat"
            ));
            addMessage("assistant", result.text);
            // Keep compaction separate so a completed response does not stay in its sending state.
            beginCompaction(adapter, requestProvider);
        } catch (error) {
            console.error(error);
            errorMessage.value = error instanceof Error ? error.message : "The chat request failed.";
        } finally {
            isSending.value = false;
        }
    }

    return {
        messages,
        isSending,
        isCompacting,
        isBusy,
        errorMessage,
        submit
    };
}
