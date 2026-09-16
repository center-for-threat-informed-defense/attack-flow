<template>
  <div
    class="provider-settings"
    :class="layout"
  >
    <div class="provider-primary-fields">
      <label class="provider-field provider-type-field">
        <span>Provider type:</span>
        <AIGenerationProviderType
          :model-value="providerType"
          :provider-types="providerTypes"
          @update:model-value="emit('update:providerType', $event)"
        />
      </label>
      <label class="provider-field">
        <span>Endpoint:</span>
        <input
          :value="endpoint"
          type="text"
          @input="emit('update:endpoint', ($event.target as HTMLInputElement).value)"
          @keydown.stop
        >
      </label>
      <label class="provider-field">
        <span>Token:</span>
        <input
          :value="token"
          type="password"
          @input="emit('update:token', ($event.target as HTMLInputElement).value)"
          @keydown.stop
        >
      </label>
    </div>
    <div class="provider-secondary-fields">
      <template v-if="apiOverride && providerType === 'azure_openai'">
        <label class="provider-field">
          <span>AZURE DEPLOYMENT:</span>
          <input
            :value="azureDeployment"
            type="text"
            @input="emit('update:azureDeployment', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          >
        </label>
        <label class="provider-field">
          <span>AZURE API VERSION:</span>
          <input
            :value="azureApiVersion"
            type="text"
            placeholder="2025-04-01-preview"
            @input="emit('update:azureApiVersion', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          >
        </label>
      </template>
      <template v-else>
        <label class="provider-field">
          <span>{{ apiOverride ? "MODEL:" : "Model / deployment:" }}</span>
          <input
            :value="model"
            type="text"
            placeholder="gpt-4o-mini"
            @input="emit('update:model', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          >
        </label>
        <label
          v-if="!apiOverride && providerType === 'openai_compatible'"
          class="provider-field"
        >
          <span>Use Azure settings:</span>
          <input
            :checked="useAzure"
            type="checkbox"
            @change="emit('update:useAzure', ($event.target as HTMLInputElement).checked)"
          >
        </label>
        <label
          v-if="!apiOverride && providerType === 'openai_compatible' && useAzure"
          class="provider-field"
        >
          <span>Azure API version:</span>
          <input
            :value="azureApiVersion"
            type="text"
            placeholder="2025-04-01-preview"
            @input="emit('update:azureApiVersion', ($event.target as HTMLInputElement).value)"
            @keydown.stop
          >
        </label>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import AIGenerationProviderType from "./AIGenerationProviderType.vue";

withDefaults(defineProps<{
  providerType?: string;
  providerTypes: readonly string[];
  endpoint: string;
  token: string;
  model: string;
  useAzure?: boolean;
  azureDeployment?: string;
  azureApiVersion?: string;
  apiOverride?: boolean;
  layout?: "stacked" | "splash-override";
}>(), {
  providerType: "",
  useAzure: false,
  azureDeployment: "",
  azureApiVersion: "",
  apiOverride: false,
  layout: "stacked"
});

const emit = defineEmits([
  "update:providerType",
  "update:endpoint",
  "update:token",
  "update:model",
  "update:useAzure",
  "update:azureDeployment",
  "update:azureApiVersion"
]);
</script>

<style scoped>
.provider-settings { display: grid; width: 100%; gap: 12px; }
.provider-primary-fields, .provider-secondary-fields { display: grid; gap: 12px; }
.provider-field { display: flex; flex-direction: column; gap: 6px; color: var(--af-text-color-secondary); font-size: 9.5pt; font-weight: 500; }
.provider-field input { height: 28px; padding: 4px 8px; color: var(--af-text-color-primary); font: inherit; border: solid 1px var(--af-border-color-primary); border-radius: 5px; box-sizing: border-box; background: var(--af-bg-color-primary); }
.provider-field input[type="checkbox"] { width: 16px; }

.splash-override .provider-primary-fields,
.splash-override .provider-secondary-fields { display: flex; gap: 28px; }
.splash-override .provider-field { flex: 2; }
.splash-override .provider-type-field { flex: 1; }
</style>
