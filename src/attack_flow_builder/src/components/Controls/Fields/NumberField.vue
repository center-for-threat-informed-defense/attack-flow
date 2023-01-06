<template>
  <div :class="['number-field-control', { disabled }]" :tabindex="tabIndex" @focus="onFocus()">
    <input
      v-model="value"
      type="text"
      ref="field"
      placeholder="Null"
      @input="onInput"
      @keydown="onKeyDown"
      @blur="onBlur"
      :disabled="disabled"
    />
    <div class="increment-arrows" v-if="!disabled">
      <div class="up-arrow" @click="updateProperty(+1)">▲</div>
      <div class="down-arrow" @click="updateProperty(-1)">▼</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, PropType, ref } from "vue";
import { clamp, NumberProperty, PropertyType } from "@/assets/scripts/BlockDiagram";

export default defineComponent({
  name: "NumberField",
  setup() {
    return {
      field: ref<HTMLInputElement | null>(null)
    };
  },
  props: {
    property: {
      type: Object as PropType<NumberProperty>,
      required: true
    }
  },
  data() {
    return {
      value: "",
      activeProperty: markRaw(this.property)
    }
  },
  computed: {

    /**
     * A reactive version of the property.
     * @returns
     *  The property.
     */
    _property(): NumberProperty {
      let trigger = this.activeProperty.trigger.value;
      return trigger ? this.activeProperty : this.activeProperty; 
    },

    /**
     * Returns the field's tab index.
     * @returns
     *  The field's tab index.
     */
    tabIndex(): null | "0" {
      return this.disabled ? null: "0";
    },

    /**
     * Tests if the property is disabled.
     * @returns
     *  True if the property is disabled, false otherwise. 
     */
    disabled(): boolean {
      return !(this._property.descriptor.is_editable ?? true);
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
        let { min, max } = this._property;
        value = clamp(value, min, max); 
        // Bound type
        if(this._property.type === PropertyType.Int) {
          value = Math.round(value);
        }
      }
      if(this._property.toRawValue() !== value) {
        // Update value
        this.$emit("change", this._property, value);
      } else {
        // Refresh value
        this.refreshValue();
      }  
    },

    /**
     * Updates the field's text value.
     */
    refreshValue() {
      this.value = `${ this._property.toRawValue() ?? "" }`
    }
    
  },
  emits: ["change"],
  watch: {
    "property"() {
      // Update existing property before switching
      this.updateProperty();
      // Switch property
      this.activeProperty = markRaw(this.property);
      // Refresh value
      this.refreshValue();
    },
    "_property.trigger.value"() {
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

.number-field-control.disabled {
  cursor: inherit;
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
