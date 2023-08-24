<template>
  <div class="dictionary-field-control">
    <div :class="['dictionary-header-container', { collapsed }]" @click="collapsed=!collapsed">
      <div class="dictionary-header">
        <CollapseArrow class="icon" :collapsed="collapsed"/>
        <p class="text">{{ _property.toString() }}</p>
      </div>
      <slot></slot>
    </div>
    <div class="dictionary-contents" v-if="!collapsed">
      <template v-if="hasVisibleProperties">
        <DictionaryFieldContents
          :property="property"
          @change="(...args) => $emit('change', ...args)"
          @create="(...args) => $emit('create', ...args)"
          @delete="(...args) => $emit('delete', ...args)"
        />
      </template>
      <template v-else>
        <p class="no-properties">No visible properties.</p>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import { DictionaryProperty } from "@/assets/scripts/BlockDiagram";
import { defineComponent, PropType } from "vue";
// Components
import CollapseArrow from "@/components/Icons/CollapseArrow.vue";
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
     * A reactive version of the property.
     * @returns
     *  The property.
     */
    _property(): DictionaryProperty {
      let trigger = this.property.trigger.value;
      return trigger ? this.property : this.property; 
    },

    /**
     * Tests if the property has visible subproperties.
     * @returns
     *  True if the property has visible subproperties, false otherwise.
     */
    hasVisibleProperties(): boolean {
      for(let value of this._property.value.values()) {
        if(value.descriptor.is_visible_sidebar ?? true)
          return true;
      }
      return false;
    }

  },
  emits: ["change", "create", "delete"],
  components: { CollapseArrow, DictionaryFieldContents }
});
</script>

<style scoped>

/** === Main Field === */

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
