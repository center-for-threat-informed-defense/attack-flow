<template>
  <div
    class="number-field-control"
    tabindex="0"
    @focus="onFocus()"
  >
    <input
      v-model="value"
      type="text"
      ref="field"
      placeholder="None"
      @input="onInput"
      @keydown="onKeyDown"
      @blur="onBlur"
    >
    <div class="increment-arrows">
      <div
        class="up-arrow"
        @click="updateProperty(+1)"
      >
        ▲
      </div>
      <div
        class="down-arrow"
        @click="updateProperty(-1)"
      >
        ▼
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as EditorCommands from "@OpenChart/DiagramEditor";
// Dependencies
import { clamp } from "@OpenChart/Utilities";
import { IntProperty } from "@OpenChart/DiagramModel";
import { defineComponent, type PropType, ref } from "vue";
import type { SynchronousEditorCommand } from "@OpenChart/DiagramEditor";

export default defineComponent({
  name: "NumberField",
  setup() {
    return {
      field: ref<HTMLInputElement | null>(null)
    };
  },
  props: {
    property: {
      type: Object as PropType<IntProperty>,
      required: true
    }
  },
  data() {
    return {
      value: ""
    }
  },
  methods: {

    /**
     * Field focus behavior.
     */
    onFocus() {
      this.$nextTick(() => {
        this.field!.focus();
      });
    },

    /**
     * Field input behavior.
     */
    onInput() {
      if(this.value === "") {
        this.updateProperty(0);
      }
    },

    /**
     * Field blur behavior.
     */
    onBlur() {
      this.updateProperty(0);
    },

    /**
     * Field keydown behavior.
     * @param event
     *  The keydown event.
     */
    onKeyDown(event: KeyboardEvent) {
      switch(event.key) {
        case "ArrowUp":
          event.preventDefault();
          this.updateProperty(+1);
          break;
        case "ArrowDown":
          event.preventDefault();
          this.updateProperty(-1);
          break;
      }
    },

    /**
     * Updates the field's property value.
     * @param delta
     *  The amount to add to the parsed value.
     *  (Default: 0)
     */
    updateProperty(delta: number = 0) {
      let value;
      if(this.value === "" && delta === 0) {
        // Parse null
        value = null;
      } else {
        // Parse value
        value = parseFloat(this.value);
        if(Number.isNaN(value)) {
          value = 0;
        } else {
          value += delta;
        }
        // Bound value
        const { min, max } = this.property;
        value = clamp(value, min, max); 
        // Bound type
        if(this.property instanceof IntProperty) {
          value = Math.round(value);
        }
      }
      if(this.property.toJson() !== value) {
        // Update property
        const cmd = EditorCommands.setNumberProperty(this.property, value);
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
      this.value = `${ this.property.toJson() ?? "" }`
    }
    
  },
  emits: {
    execute: (cmd: SynchronousEditorCommand) => cmd
  },
  watch: {
    "property"() {
      // Refresh value
      this.refreshValue();
    },
    "property.value"() {
      // Refresh value
      this.refreshValue();
    }
  },
  mounted() {
    this.refreshValue();
  },
  unmounted() {
    this.updateProperty();
  }
});
</script>

<style scoped>

/** === Main Field === */

.number-field-control {
  display: flex; 
  align-items: center;
  color: #cccccc;
  cursor: text;
  overflow: hidden;
}

.number-field-control:focus {
  outline: none;
}

input {
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  width: 100%;
  height: 100%;
  padding: 6px 8px 6px 12px;
  border: none;
  box-sizing: border-box;
  background: none;
}

input::placeholder {
  color: #999;
  opacity: 1;
}

input:focus {
  outline: none;
}

/** === Arrows === */

.increment-arrows {
  display: flex;
  flex-direction: column;
  color: #666666;
  font-size: 5pt;
  font-family: "Inter", sans-serif;
  user-select: none;
  width: 16px;
  padding-right: 8px;
}

.up-arrow, .down-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 10px;
  border-radius: 2px;
  cursor: pointer;
}

.up-arrow:hover, .down-arrow:hover {
  color: #bfbfbf;
}

</style>
