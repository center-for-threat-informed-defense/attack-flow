<template>
  <select
    name="llm-provider-type"
    v-model="model"
    :class="model === '' ? 'empty' : ''"
  >
    <option
      disabled
      selected
      hidden
      value=""
      key="placeholder"
    >
      Provider type
    </option>
    <option
      value=""
      key="none"
    >
      (none)
    </option>
    <option
      v-for="providerType in providerTypes"
      :key="providerType"
      :value="providerType"
    >
      {{ providerType }}
    </option>
  </select>
</template>
<script setup lang="ts">
import { SUPPORTED_RUNTIME_PROVIDER_TYPES } from "@/assets/scripts/Application/Configuration";

withDefaults(defineProps<{
    providerTypes?: readonly string[];
}>(), {
    providerTypes: () => SUPPORTED_RUNTIME_PROVIDER_TYPES
});

const model = defineModel<string>();

</script>
<style scoped>
select {
    background: var(--af-bg-color-primary);
    border: 1px solid var(--af-border-color-primary);
    border-radius: 5px;
    color: var(--af-text-color-primary);
    padding: 5px;
}

select.empty {
    color: var(--af-text-color-placeholder)
}
</style>
