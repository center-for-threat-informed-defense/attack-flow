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
        <p class="text">
          {{ property.toString() }}
        </p>
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

.dictionary-header .text {
  flex: 1;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.dictionary-contents {
  padding: 20px 0px 20px 16px;
}

.no-properties {
  color: #818181;
  font-size: 10pt;
}

</style>
