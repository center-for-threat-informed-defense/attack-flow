<template>
  <div class="dictionary-field-control">
    <div
      :class="['dictionary-header-container', { collapsed }]"
      @click="collapsed=!collapsed"
    >
      <div class="dictionary-header">
        <CollapseArrowIcon
          class="icon"
          :collapsed="collapsed"
        />
        <div class="dictionary-header-label">
          <span
            v-if="isCanvasTag"
            class="tag-color-circle"
            :style="{ backgroundColor: tagColor }"
            aria-hidden="true"
          />
          <p class="text">
            {{ property.toString() }}
          </p>
        </div>
      </div>
      <slot />
    </div>
    <div
      class="dictionary-contents"
      v-if="!collapsed"
    >
      <template v-if="hasVisibleProperties">
        <DictionaryFieldContents
          :property="property"
          @execute="cmd => $emit('execute', cmd)"
        />
      </template>
      <template v-else>
        <p class="no-properties">
          Dictionary contains no editable properties.
        </p>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import { defineComponent, type PropType } from "vue";
import type { DictionaryProperty } from "@OpenChart/DiagramModel";
import type { SynchronousEditorCommand } from "@OpenChart/DiagramEditor";
// Components
import CollapseArrowIcon from "@/components/Icons/CollapseArrowIcon.vue";
import DictionaryFieldContents from "@/components/Controls/Fields/DictionaryFieldContents.vue";

const DEFAULT_TAG_COLOR = "#000000";

export default defineComponent({
  name: "DictionaryField",
  props: {
    property: {
      type: Object as PropType<DictionaryProperty>,
      required: true
    }
  },
  data() {
    return {
      collapsed: true
    }
  },
  computed: {
    isCanvasTag(): boolean {
      // Tag entries are dictionary items nested directly under the canvas-level tags list.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (this.property as any)._parent?.id === "tags";
    },

    tagColor(): string {
      return this.property.value.get("color")?.toString() || DEFAULT_TAG_COLOR;
    },

    /**
     * Tests if the property has visible subproperties.
     * @returns
     *  True if the property has visible subproperties, false otherwise.
     */
    hasVisibleProperties(): boolean {
      for(const value of this.property.value.values()) {
        if(value.isEditable) {
          return true;
        }
      }
      return false;
    }

  },
  emits: {
    execute: (cmd: SynchronousEditorCommand) => cmd
  },
  components: { CollapseArrowIcon, DictionaryFieldContents }
});
</script>

<style scoped>

/** === Main Field === */

.dictionary-field-control {
  max-width: 100%;
}

.dictionary-header-container {
  display: flex;
}

.dictionary-header {
  flex: 1;
  display: flex;
  align-items: center;
  color: #bfbfbf;
  font-size: 10.5pt;
  user-select: none;
  padding: 7px 10px;
  border: solid 1px #3d3d3d;
  border-radius: 3px;
  overflow: hidden;
}

.dictionary-header .icon {
  margin-right: 9px;
}

.dictionary-header-label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.dictionary-header .text {
  flex: 1;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.tag-color-circle {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.dictionary-contents {
  padding: 20px 0px 20px 16px;
}

.no-properties {
  color: #818181;
  font-size: 10pt;
}

</style>
