<template>
  <dialog
    ref="dialog"
    @close="closeModal"
    @cancel.prevent="closeModal"
  >
    <div class="title-bar">
      {{ visTitle }}
      <div class="controls">
        <button
          type="button"
          @click="exportVis"
          title="Download Image"
        >
          <DownloadIcon
            :width="iconSize"
            :height="iconSize"
            :color="iconColor"
          />
        </button>
        <button
          type="button"
          @click="closeModal"
          title="Close"
        >
          <CloseIcon
            :width="iconSize"
            :height="iconSize"
            :color="iconColor"
          />
        </button>
      </div>
    </div>
    <div
      ref="vis-container"
      class="modal-body"
    >
      <component
        :is="activeVisualization?.component"
        v-if="activeVisualization"
      />
    </div>
  </dialog>
</template>
<script setup lang="ts">
import { exportVisualization } from "@/assets/scripts/Application";
import type { VisualizationRegistration } from "@/assets/scripts/Application/Visualization";
import { useApplicationStore } from "@/stores/ApplicationStore";
import { computed, onMounted, useTemplateRef, watch } from "vue";
import CloseIcon from "../Icons/CloseIcon.vue";
import DownloadIcon from "../Icons/DownloadIcon.vue";

const dialog = useTemplateRef('dialog');
const visContainer = useTemplateRef('vis-container');

const app = useApplicationStore();

const iconSize = 20;

const iconColor = computed<string>(() => {
    let result = "#737373";
    const theme_id = app.activeEditor.file.factory.theme.id;
    switch (theme_id) {
        case "dark_theme":
            result = "#cccccc";
            break;
        case "light_theme":
        case "blog_theme":
            result = "#555555";
            break;
    }
    return result;
});

const activeVisualization = computed<VisualizationRegistration | undefined>(() => {
    return app.activeVisualizationModal.activeVisualization;
});

const visTitle = computed<string>(() => {
    return activeVisualization.value?.title || "Visualization";
});

function closeModal() {
    app.activeVisualizationModal.close();
}

async function exportVis() {
    const root = visContainer.value;
    const visualization = activeVisualization.value;
    if (!root || !visualization) {
        return;
    }
    await exportVisualization({
        app,
        visualization,
        root
    });
}

function updateModalDisplay() {
    if (dialog.value) {
        if (app.activeVisualizationModal.active && !dialog.value.open) {
            dialog.value.showModal();
        } else if (!app.activeVisualizationModal.active && dialog.value.open) {
            dialog.value.close();
        }
    }
}

onMounted(() => {
    updateModalDisplay();
});

watch(() => app.activeVisualizationModal.active, () => {
    updateModalDisplay();
});
</script>
<style scoped>
dialog[open] {
    background-color: var(--af-bg-color-tertiary);
    border: 1px solid var(--af-border-color-primary);
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
    padding: 5px;
    width: 80vw;
    height: 80vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

dialog::backdrop {
    backdrop-filter: blur(2px);
    background-color: rgba(0, 0, 0, 0.3);
}

.controls {
    display: flex;
    gap: 10px;
    align-items: center;
}

dialog button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
}

dialog .title-bar {
    display: flex;
    justify-content: space-between;
    color: var(--af-text-color-tertiary);
    padding: 5px;
    font-weight: 600;
}

dialog .modal-body {
    background-color: var(--af-bg-color-primary);
    flex: 1;
    overflow: auto;
}
</style>
