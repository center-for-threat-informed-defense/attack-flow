<template>
  <div
    v-if="!isShowingSettings"
    class="chat-pane"
  >
    <div
      v-if="classificationShouldWarn"
      class="tlp-warning-message"
    >
      <span class="warning-icon">⚠</span>
      <p style="flex: 1;">
        Your flow has been labeled {{ classificationMarking }}<span v-if="classificationGroup?.value">:{{ classificationGroup.value }}</span>. Is your endpoint securely provisioned for this data?
        The endpoint will receive this flow as context for any questions you ask.
      </p>
    </div>
    <ScrollBox
      ref="chatLog"
      class="chat-log"
      :always-show-scroll-bar="true"
      :propagate-scroll="false"
      aria-live="polite"
    >
      <div class="chat-log-content">
        <section
          v-if="showWelcome"
          class="chat-welcome"
        >
          <p class="chat-welcome-message">
            <span v-if="isUsingApi">
              Hello! Welcome to the Attack Flow chatbot. Configure optional API overrides in the settings pane, then ask questions about your flow.
            </span>
            <span v-else>
              Hello! Welcome to the Attack Flow chatbot. Enter your endpoint and token information in the settings pane, then ask questions about your flow.
            </span>
          </p>
          <button
            v-for="(prompt, index) in suggestedPrompts"
            :key="index"
            class="chat-suggested-prompt"
            type="button"
            :disabled="isBusy || isCheckingApiAvailability || !!missingDirectProviderParam"
            @click="submitSuggestedPrompt(prompt)"
            :title="submitQueryTooltip"
          >
            {{ prompt }}
          </button>
        </section>
        <template
          v-for="message in messages"
          :key="message.id"
        >
          <p
            v-if="message.role === 'user'"
            class="chat-log-message user"
          >
            {{ message.content }}
          </p>
          <div
            v-else
            class="chat-log-message assistant"
          >
            <!-- Raw HTML is disabled in markdown-it; keep it disabled before rendering LLM output with v-html. -->
            <div v-html="renderAssistantMarkdown(message.content)" />
            <button
              class="chat-copy-response-button"
              :class="{ copied: copiedMessageId === message.id }"
              type="button"
              :aria-label="copiedMessageId === message.id ? 'Response copied' : 'Copy response'"
              :title="copiedMessageId === message.id ? 'Copied' : 'Copy response'"
              @click="copyAssistantResponse(message.id, message.content)"
            >
              <span v-if="copiedMessageId === message.id">Copied</span>
              <CopyIcon
                v-else
                color="currentColor"
                :width="12"
                :height="12"
              />
            </button>
          </div>
        </template>
        <p
          v-if="isSending"
          class="chat-log-message assistant pending"
        >
          Thinking…
        </p>
        <p
          v-if="isCompacting"
          class="chat-context-notice"
          aria-live="polite"
        >
          Optimizing chat context…
        </p>
        <p
          v-if="errorMessage"
          class="chat-error-message"
          role="alert"
        >
          {{ errorMessage }}
        </p>
      </div>
    </ScrollBox>
    <div class="chat-composer">
      <form
        class="chat-message-form"
        @submit.prevent="sendMessage"
      >
        <input
          v-model="draftMessage"
          ref="chatMessageInput"
          class="chat-message-input"
          type="text"
          :placeholder="isCheckingApiAvailability ? 'Checking API availability...' : 'Type your question here...'"
          aria-label="Chat message"
          :disabled="isCheckingApiAvailability"
        >
        <span
          class="chat-send-button-tooltip"
          :title="submitQueryTooltip"
        >
          <button
            class="chat-send-button"
            type="submit"
            aria-label="Send message"
            :disabled="isBusy || isCheckingApiAvailability || !!missingDirectProviderParam"
          >
            <ArrowLeftIcon class="chat-send-icon" />
          </button>
        </span>
      </form>
      <button
        class="chat-settings-button"
        type="button"
        aria-label="Chat settings"
        @click="showSettings"
      >
        <GearIcon />
      </button>
    </div>
  </div>
  <div
    v-else
    class="chat-settings-pane"
  >
    <ScrollBox
      class="chat-settings-scrollbox"
      :always-show-scroll-bar="true"
      :propagate-scroll="false"
    >
      <div class="chat-settings-content">
        <button
          class="chat-settings-back-button"
          type="button"
          @click="hideSettings"
        >
          <ArrowLeftIcon />
          <span>Chat Settings</span>
        </button>
        <p v-if="apiAvailabilityStatus === 'checking' || apiAvailabilityStatus === 'idle'">
          Checking API availability...
        </p>
        <template v-else-if="isUsingApi">
          <p class="chat-api-override-note">
            Connected to the Attack Flow API. Provider overrides are optional.
          </p>
          <ProviderConnectionSettings
            v-model:provider-type="apiProviderType"
            v-model:endpoint="apiEndpoint"
            v-model:token="apiToken"
            v-model:model="apiModel"
            v-model:azure-deployment="apiAzureDeployment"
            v-model:azure-api-version="apiAzureApiVersion"
            :provider-types="RUNTIME_PROVIDER_OVERRIDE_TYPES"
            api-override
          />
        </template>
        <ProviderConnectionSettings
          v-else
          v-model:provider-type="providerType"
          v-model:endpoint="endpoint"
          v-model:token="token"
          v-model:model="model"
          v-model:use-azure="useAzure"
          v-model:azure-api-version="azureApiVersion"
          :provider-types="SUPPORTED_RUNTIME_PROVIDER_TYPES"
        />
      </div>
    </ScrollBox>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { RUNTIME_PROVIDER_OVERRIDE_TYPES } from "@/api/jobs";
import { generateApiChat, type ApiChatProviderOverride } from "@/api/chat";
import {
  SUPPORTED_RUNTIME_PROVIDER_TYPES,
  type SupportedRuntimeProviderType
} from "@/assets/scripts/Application/Configuration";
import { useApiAvailability } from "@/composables/useApiAvailability";
import { useChatConversation } from "@/composables/useChatConversation";
import { useApplicationStore } from "@/stores/ApplicationStore";
import { useRuntimeProviderStore } from "@/stores/RuntimeProviderStore";
import ArrowLeftIcon from "@/components/Icons/ArrowLeftIcon.vue";
import CopyIcon from "@/components/Icons/CopyIcon.vue";
import GearIcon from "@/components/Icons/GearIcon.vue";
import ScrollBox from "@/components/Containers/ScrollBox.vue";
import { renderAssistantMarkdown } from "@/components/Elements/ChatMarkdownRenderer";
import ProviderConnectionSettings from "./ProviderConnectionSettings.vue";
import { EnumProperty, StringProperty } from "@/assets/scripts/OpenChart/DiagramModel/index.ts";
import { TupleProperty } from "@/assets/scripts/OpenChart/DiagramModel/index.ts";

const { status: apiAvailabilityStatus, ensureChecked: ensureApiAvailabilityChecked } = useApiAvailability();
const applicationStore = useApplicationStore();
const runtimeProviderStore = useRuntimeProviderStore();
const isShowingSettings = ref(false);
const chatLog = ref<{ scrollToBottom: () => void } | null>(null);
const chatMessageInput = ref<HTMLInputElement | null>(null);
const draftMessage = ref("");
const copiedMessageId = ref<number | null>(null);
const showWelcome = ref(true);
const suggestedPrompts = [
  "Summarize this flow.",
  "Generate an adversary emulation plan from this flow.",
];
const providerType = ref("");
const endpoint = ref("");
const token = ref("");
const model = ref("");
const useAzure = ref(false);
const azureApiVersion = ref("");

// API overrides must not inherit direct-provider values from the runtime store.
const apiProviderType = ref("");
const apiEndpoint = ref("");
const apiToken = ref("");
const apiModel = ref("");
const apiAzureDeployment = ref("");
const apiAzureApiVersion = ref("");

const isUsingApi = computed(() => apiAvailabilityStatus.value === "available");
const isCheckingApiAvailability = computed(
  () => apiAvailabilityStatus.value === "idle" || apiAvailabilityStatus.value === "checking"
);
const missingDirectProviderParam = computed(() => {
  if (isUsingApi.value || isCheckingApiAvailability.value) return "";

  const missing = [
    !providerType.value && "provider type",
    !endpoint.value.trim() && "endpoint",
    !token.value.trim() && "token",
    !model.value.trim() && "model"
  ].filter((value): value is string => Boolean(value));

  return missing.length ? `Missing direct-provider settings: ${missing.join(", ")}.` : "";
});

const classificationMarking = computed<string | undefined>(() => {
    const tup : TupleProperty | undefined = applicationStore.activeEditor.file.canvas.properties.get("classification")
    if (!tup) {
        return undefined;
    }
    const enumProp : EnumProperty | undefined = tup?.value.get("marking") as EnumProperty;
    return enumProp ? enumProp.toString() : undefined;
});

const classificationGroup = computed<StringProperty | undefined>( () => {
    const tup : TupleProperty | undefined = applicationStore.activeEditor.file.canvas.properties.get("classification")
    if (!tup) {
        return undefined;
    }
    const result : StringProperty | undefined = tup?.value.get("group") as StringProperty;
    return result
});

const classificationShouldWarn = computed<boolean>(() => {
    if (classificationMarking.value === undefined) return false;
    return ["TLP:RED", "TLP:AMBER", "TLP:AMBER+STRICT"].includes(classificationMarking.value);
});

const submitQueryTooltip = computed<string>(() => {
    return isCheckingApiAvailability.value ? 'Checking API availability...' :
        missingDirectProviderParam.value ? missingDirectProviderParam.value :
        isBusy.value ? 'Thinking...' :
        'Submit query';
});

const {
  messages,
  isSending,
  isCompacting,
  isBusy,
  errorMessage,
  submit: submitChatMessage
} = useChatConversation({
  getProviderConfig: () => runtimeProviderStore.runtimeProviderConfig,
  getFlowSnapshot: () => JSON.stringify(applicationStore.activeEditor.file.toExport(), null, 2),
  useApiAdapter: () => isUsingApi.value,
  createApiAdapter: () => ({
    async generateChat(request) {
      const response = await generateApiChat({
        messages: request.messages,
        purpose: request.purpose ?? "chat",
        providerOverride: buildApiProviderOverride()
      });
      return {
        providerId: response.provider_id,
        providerType: response.provider_type as SupportedRuntimeProviderType,
        model: response.model,
        text: response.text,
        finishReason: response.finish_reason as "stop" | "length" | "content_filter" | "tool_call" | "unknown",
        metadata: { request_id: response.request_id }
      };
    }
  })
});

function buildApiProviderOverride(): ApiChatProviderOverride | undefined {
  if (!apiProviderType.value) return undefined;

  return {
    provider_type: apiProviderType.value as ApiChatProviderOverride["provider_type"],
    endpoint: apiEndpoint.value.trim() || undefined,
    api_key: apiToken.value || undefined,
    model: apiModel.value.trim() || undefined,
    deployment: apiAzureDeployment.value.trim() || undefined,
    api_version: apiAzureApiVersion.value.trim() || undefined
  };
}

async function copyAssistantResponse(messageId: number, content: string) {
  try {
    await navigator.clipboard.writeText(content);
    copiedMessageId.value = messageId;
    window.setTimeout(() => {
      if (copiedMessageId.value === messageId) copiedMessageId.value = null;
    }, 1500);
  } catch (error) {
    console.error("Unable to copy chat response.", error);
  }
}

async function scrollChatToBottom() {
  await nextTick();
  chatLog.value?.scrollToBottom();
}

async function submitQuery(query: string) {
  if(!query || isBusy.value || isCheckingApiAvailability.value) return;

  showWelcome.value = false;
  draftMessage.value = "";
  const request = submitChatMessage(query);
  await nextTick();
  chatMessageInput.value?.focus();
  await scrollChatToBottom();

  await request;
  await scrollChatToBottom();
}

async function sendMessage() {
  await submitQuery(draftMessage.value.trim());
}

async function submitSuggestedPrompt(prompt: string) {
  if(isBusy.value || isCheckingApiAvailability.value) return;
  await submitQuery(prompt);
}

async function showSettings() {
  isShowingSettings.value = true;
  // Refresh availability whenever settings opens; concurrent consumers share one request.
  await ensureApiAvailabilityChecked(true);
}

function hideSettings() {
  if(!isUsingApi.value && providerType.value) {
    runtimeProviderStore.setRuntimeProviderConfig({
      providerType: providerType.value as SupportedRuntimeProviderType,
      endpoint: endpoint.value.trim(),
      apiKey: token.value,
      model: model.value.trim(),
      useAzure: useAzure.value,
      azureApiVersion: azureApiVersion.value.trim()
    });
  }
  isShowingSettings.value = false;
}

onMounted(() => {
  void ensureApiAvailabilityChecked();
  const provider = runtimeProviderStore.runtimeProviderConfig;
  if(!provider) return;
  providerType.value = provider.providerType;
  endpoint.value = provider.endpoint;
  token.value = provider.apiKey;
  model.value = provider.model;
  useAzure.value = !!provider.useAzure;
  azureApiVersion.value = provider.azureApiVersion ?? "";
});
</script>

<style scoped>

.chat-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.chat-log {
  flex: 1;
  min-height: 0;
}

.chat-log-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 16px;
}

.chat-welcome {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 4px;
  padding: 10px;
  border: solid 1px var(--af-border-color-primary);
  border-radius: 10px;
}

.chat-welcome-message {
  margin: 0 0 2px;
  color: var(--af-text-color-primary);
  font-size: 9.5pt;
  line-height: 1.25;
}

.chat-suggested-prompt {
  padding: 10px 18px;
  color: var(--af-text-color-primary);
  font: inherit;
  font-size: 9.5pt;
  text-align: left;
  border: solid 1px var(--af-border-color-primary);
  border-radius: 9px;
  background: var(--af-bg-color-primary);
  cursor: pointer;
}

.chat-suggested-prompt:hover {
  background: var(--af-bg-color-tertiary);
}

.chat-suggested-prompt:disabled {
  cursor: default;
  opacity: 0.7;
}

.chat-log-message {
  max-width: 85%;
  margin: 0;
  padding: 8px 10px;
  color: var(--af-text-color-primary);
  font-size: 9.5pt;
  line-height: 1.35;
  border-radius: 8px;
}

.chat-log-message.user {
  align-self: flex-end;
  background: var(--af-bg-color-tertiary);
}

.chat-log-message.assistant {
  position: relative;
  align-self: flex-start;
  padding-bottom: 28px;
  border: solid 1px var(--af-border-color-primary);
}

.chat-log-message.assistant :deep(p) {
  margin: 0;
}

.chat-log-message.assistant :deep(p + p),
.chat-log-message.assistant :deep(ul + p),
.chat-log-message.assistant :deep(ol + p) {
  margin-top: 8px;
}

.chat-log-message.assistant :deep(ul),
.chat-log-message.assistant :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.chat-log-message.assistant :deep(pre) {
  overflow-x: auto;
  margin: 8px 0;
}

.chat-copy-response-button {
  position: absolute;
  right: 7px;
  bottom: 6px;
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  padding: 0;
  color: var(--af-text-color-secondary);
  border: none;
  background: transparent;
  cursor: pointer;
}

.chat-copy-response-button:hover {
  color: var(--af-text-color-hover-action);
}

.chat-copy-response-button.copied {
  width: auto;
  padding: 0 3px;
  font: inherit;
  font-size: 8pt;
}

.chat-log-message.pending {
  color: var(--af-text-color-secondary);
  padding-bottom: inherit;
}

.chat-context-notice {
  margin: 0;
  color: var(--af-text-color-secondary);
  font-size: 9.5pt;
  font-style: italic;
  line-height: 1.35;
}

.chat-error-message {
  margin: 0;
  color: var(--af-text-color-tertiary);
  font-size: 9.5pt;
  line-height: 1.35;
}

.chat-composer {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 16px;
}

.chat-message-form {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  border: solid 1px var(--af-border-color-primary);
  border-radius: 9px;
  background: var(--af-bg-color-primary);
}

.chat-message-input {
  flex: 1;
  min-width: 0;
  height: 38px;
  padding: 0 10px 0 18px;
  color: var(--af-text-color-primary);
  font: inherit;
  border: none;
  outline: none;
  background: transparent;
}

.chat-message-input::placeholder {
  color: var(--af-text-color-placeholder);
}

.chat-settings-content {
    padding: 28px 16px;
}

.chat-send-button,
.chat-settings-button {
  display: grid;
  place-items: center;
  padding: 0;
  color: var(--af-text-color-secondary);
  border: none;
  background: transparent;
  cursor: pointer;
}

.chat-send-button {
  width: 36px;
  height: 38px;
}

.chat-send-button-tooltip {
  display: flex;
}

.chat-send-icon {
  transform: rotate(180deg);
}

.chat-send-button :deep(svg) {
  fill: currentColor;
}

.chat-settings-button {
  width: 24px;
  height: 38px;
}

.chat-settings-button :deep(svg) {
  width: 19px;
  height: 19px;
  fill: currentColor;
  color: inherit;
}

.chat-send-button:hover,
.chat-settings-button:hover {
  color: var(--af-text-color-hover-action);
}

.chat-send-button:disabled,
.chat-message-input:disabled {
  cursor: default;
  opacity: 0.7;
}

/** === Settings === */

.chat-settings-pane {
  height: 100%;
  box-sizing: border-box;
}

.chat-settings-scrollbox {
  height: 100%;
}

.chat-settings-back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  padding: 0;
  color: var(--af-text-color-tertiary);
  font: inherit;
  font-size: 9.5pt;
  font-weight: 600;
  text-transform: uppercase;
  border: none;
  background: transparent;
  cursor: pointer;
}

.chat-settings-back-button :deep(svg) {
  fill: currentColor;
}

.chat-api-override-note {
  margin: 0 0 14px;
  color: var(--af-text-color-secondary);
  font-size: 9pt;
  line-height: 1.35;
}

.tlp-warning-message {
    background-color: var(--af-color-info);
    display: flex;
    align-items: center;
    padding: 10px;
    color: var(--af-text-color-info-bg);
    font-size: small;
}

.tlp-warning-message .warning-icon {
    margin-right: 10px;
    font-size: x-large;
}

</style>
