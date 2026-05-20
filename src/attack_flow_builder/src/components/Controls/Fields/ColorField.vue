<template>
  <FocusBox
    class="text-field-control"
    pointer-event="click"
  >
    <div class="value">
      <ColorPicker
        style="width: 100%; height: 100%;"
        v-model:pure-color="value"
        format="hex"
        shape="square"
      />
    </div>
  </FocusBox>
</template>

<script lang="ts">
import { ColorPicker } from "vue3-colorpicker";
import "vue3-colorpicker/style.css";

import * as EditorCommands from "@OpenChart/DiagramEditor"
// Dependencies
import { defineComponent, type PropType, ref } from "vue";
import type { ColorProperty } from "@OpenChart/DiagramModel";
import type { SynchronousEditorCommand } from "@OpenChart/DiagramEditor";
// Components
import FocusBox from "@/components/Containers/FocusBox.vue";

export default defineComponent({
  name: "TextField",
  setup() {
    return {
      field: ref<HTMLElement | null>(null),
    };
  },
  props: {
    property: {
      type: Object as PropType<ColorProperty>,
      required: true
    }
  },
  data() {
    return {
      value: "",
      select: null as string | null,
      onResizeObserver: null as ResizeObserver | null
    }
  },
  emits: {
    execute: (cmd: SynchronousEditorCommand) => cmd
  },
  methods: {

    /**
     * Updates the field's property value.
     * @param value
     *  The property's new value.
     */
    updateProperty(value: string) {
      const v = value || null;
      if(this.property.toJson() !== v) {
        // Update property
        const cmd = EditorCommands.setColorProperty(this.property, v);
        this.$emit("execute", cmd);
      } else {
        // Refresh value
        this.refreshValue();
      }
    },

    /**
     * Updates the field's text value.
     */
    refreshValue() {
      // Update value
      this.value = this.property.toJson() ?? "#000000";
      // Update height
      this.$nextTick(() => {
        this.refreshHeight();
      });
    },

    /**
     * Updates the field's height.
     */
    refreshHeight() {
      // If no field, bail
      if(this.field === null) {
        return;
      }
    }

  },
  watch: {
    "property"() {
      // Refresh value
      this.refreshValue();
    },
    "property.value"() {
      // Refresh value
      this.refreshValue();
    },
    value() {
        this.updateProperty(this.value)
    }
  },
  mounted() {
    // Update field property value
    this.refreshValue();
  },
  unmounted() {
    // Disconnect resize observer
    this.onResizeObserver?.disconnect();
  },
  components: { FocusBox, ColorPicker }
});
</script>

<style>

/** === Main Field === */

.text-field-control {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  color: #cccccc;
  box-sizing: border-box;
}

.text-field-control:focus {
  outline: none;
}

.value {
  position: relative;
  display: flex;
  grid-area: 1 / 1;
  cursor:text
}

input {
  width: 100%;
  height: 100%;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  border: none;
  padding: 0px;
  background: none;
  overflow: hidden;
  resize: none;
}

input::placeholder {
  color: #999;
  opacity: 1;
}

input:focus {
  outline: none;
}

/** === Dropdown Options === */

.options-container {
  position: relative;
  grid-area: 1 / 1;
}

.options-list :deep(li:not(.dim) + li.dim:before)  {
  content: "";
  display: block;
  border-top: dotted 1px #4d4d4d;
}

.vc-color-wrap {
    width: 100% !important;
    height: 100% !important;
    margin-right: 0px !important;
    border-radius: 4px !important;
}
</style>
