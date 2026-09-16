<template>
  <div
    v-if="!isShowingSettings"
    class="chat-pane"
  >
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
            Hello! Welcome to the Attack Flow chatbot. Enter your endpoint and token information in the settings pane, then ask questions about your flow.
          </p>
          <button
            v-for="(prompt, index) in suggestedPrompts"
            :key="index"
            class="chat-suggested-prompt"
            type="button"
            :disabled="isSending"
            @click="submitSuggestedPrompt(prompt)"
          >
            {{ prompt }}
          </button>
        </section>
        <p
          v-for="message in messages"
          :key="message.id"
          class="chat-log-message"
          :class="message.role"
        >
          {{ message.text }}
        </p>
        <p
          v-if="isSending"
          class="chat-log-message assistant pending"
        >
          Thinking…
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
          placeholder="Type your question here..."
          aria-label="Chat message"
        >
        <button
          class="chat-send-button"
          type="submit"
          aria-label="Send message"
          :disabled="isSending"
        >
          <ArrowLeftIcon class="chat-send-icon" />
        </button>
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
        <template v-else-if="isUsingApiOverride">
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
import { SUPPORTED_RUNTIME_PROVIDER_TYPES } from "@/assets/scripts/Application/Configuration";
import { useApiAvailability } from "@/composables/useApiAvailability";
import { useRuntimeProviderStore } from "@/stores/RuntimeProviderStore";
import ArrowLeftIcon from "@/components/Icons/ArrowLeftIcon.vue";
import GearIcon from "@/components/Icons/GearIcon.vue";
import ScrollBox from "@/components/Containers/ScrollBox.vue";
import ProviderConnectionSettings from "./ProviderConnectionSettings.vue";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const { status: apiAvailabilityStatus, ensureChecked: ensureApiAvailabilityChecked } = useApiAvailability();
const runtimeProviderStore = useRuntimeProviderStore();
const isShowingSettings = ref(false);
const chatLog = ref<{ scrollToBottom: () => void } | null>(null);
const chatMessageInput = ref<HTMLInputElement | null>(null);
const draftMessage = ref("");
const messages = ref<ChatMessage[]>([]);
const isSending = ref(false);
const showWelcome = ref(true);
const suggestedPrompts = [
  "Example Prompt 1",
  "Example Prompt 2- longer text here to show what multiple lines look like.",
  "Example Prompt 1"
];
let nextMessageId = 0;
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

const isUsingApiOverride = computed(() => apiAvailabilityStatus.value === "available");

async function requestChatResponse(): Promise<string> {
  await new Promise(resolve => window.setTimeout(resolve, 300));
  return "pancakes";
}

async function scrollChatToBottom() {
  await nextTick();
  chatLog.value?.scrollToBottom();
}

async function submitQuery(query: string) {
  if(!query || isSending.value) return;

  showWelcome.value = false;
  messages.value.push({ id: nextMessageId++, role: "user", text: query });
  draftMessage.value = "";
  isSending.value = true;
  await nextTick();
  chatMessageInput.value?.focus();
  await scrollChatToBottom();

  try {
    const response = await requestChatResponse();
    messages.value.push({ id: nextMessageId++, role: "assistant", text: response });
    await scrollChatToBottom();
  } finally {
    isSending.value = false;
  }
}

async function sendMessage() {
  await submitQuery(draftMessage.value.trim());
}

async function submitSuggestedPrompt(prompt: string) {
  if(isSending.value) return;
  await submitQuery(prompt);
}

async function showSettings() {
  isShowingSettings.value = true;
  // Refresh availability whenever settings opens; concurrent consumers share one request.
  await ensureApiAvailabilityChecked(true);
}

function hideSettings() {
  if(!isUsingApiOverride.value && providerType.value) {
    runtimeProviderStore.setRuntimeProviderConfig({
      providerType: providerType.value as "openai_compatible" | "anthropic" | "gemini",
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
  align-self: flex-start;
  border: solid 1px var(--af-border-color-primary);
}

.chat-log-message.pending {
  color: var(--af-text-color-secondary);
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

</style>
