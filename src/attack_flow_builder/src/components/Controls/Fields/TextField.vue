<template>
  <div :class="['text-field-control', { disabled }]" :tabindex="tabIndex" @focus="onFocus()">
    <textarea
      v-model="value"
      ref="field"
      placeholder="Null"
      @input="onInput"
      @keyup.stop=""
      @keydown.stop=""
      @blur="onBlur"
      :disabled="disabled"
    ></textarea>
  </div>
</template>

<script lang="ts">
import { StringProperty } from "@/assets/scripts/BlockDiagram";
import { defineComponent, markRaw, PropType, ref } from "vue";

export default defineComponent({
  name: "TextField",
  setup() {
    return { field: ref<HTMLElement | null>(null) };
  },
  props: {
    property: {
      type: Object as PropType<StringProperty>,
      required: true
    },
    updateTimeout: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      sto: 0,
      value: "",
      activeProperty: markRaw(this.property),
      onResizeObserver: null as ResizeObserver | null
    }
  },
  computed: {

    /**
     * A reactive version of the property.
     * @returns
     *  The property.
     */
    _property(): StringProperty {
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
      // Set focus
      this.$nextTick(() => {
        this.field!.focus();
      });
    },

    /**
     * Field input behavior.
     */
    onInput() {
      // Clear timeout
      clearTimeout(this.sto);
      // Configure timeout
      this.sto = setTimeout(() => {
        this.updateProperty();
      }, this.updateTimeout);
      // Update height
      this.$nextTick(() => {
        this.refreshHeight();
      });
    },

    /**
     * Field blur behavior.
     */
    onBlur() {
      // Clear timeout
      clearTimeout(this.sto);
      // Update property
      this.updateProperty();
    },

    /**
     * Updates the field's property value.
     */
    updateProperty() {
      let value = this.value || null;
      if(this._property.toRawValue() !== value) {
        // Update property
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
      // Update value
      this.value = this._property.toRawValue() ?? "";
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
      // Collapse and calculate height
      this.field.style.height = "0px";
      this.field.style.height = `${ this.field.scrollHeight }px`
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
    // Configure resize observer
    this.onResizeObserver = new ResizeObserver(() => this.refreshHeight());
    this.onResizeObserver.observe(this.field!);
    // Update field property value
    this.refreshValue();
  },
  unmounted() {
    // Disconnect resize observer
    this.onResizeObserver!.disconnect();
    // Update property
    this.updateProperty();
  }
});
</script>

<style scoped>

/** === Main Field === */

.text-field-control {
  display: flex;
  align-items: center;
  color: #cccccc;
  cursor: text;
  overflow: hidden;
}

.text-field-control.disabled {
  cursor: inherit;
}

.text-field-control:focus {
  outline: none;
}

textarea {
  display: block;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  width: 100%;
  margin: 6px 12px;
  border: none;
  padding: 0px;
  background: none;
  overflow: hidden;
  resize: none;
}

textarea::placeholder {
  color: #999;
  opacity: 1;
}

textarea:focus {
  outline: none;
}

</style>
