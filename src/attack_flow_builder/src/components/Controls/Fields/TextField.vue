<template>
  <div :class="['text-field-control', { disabled: !isEditable }]" tabindex="0" @focus="onFocus()">
    <div class="grid-container">
      <p class="placeholder" v-show="showPlaceholder">
        Null
      </p>
      <div 
        ref="field"
        class="field"
        @input="onInput"
        @keyup.stop=""
        @keydown.stop=""
        @blur="onBlur"
        :contenteditable="isEditable"
      >
        {{ this.value }}
      </div>
    </div>
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
      showPlaceholder: true,
      activeProperty: markRaw(this.property)
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
     * Tests if the property is editable.
     * @returns
     *  True if the property is editable, false otherwise. 
     */
    isEditable(): boolean {
      return this._property.descriptor.is_editable ?? true;
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
      // Clear timeout
      clearTimeout(this.sto)
      // Update cached value
      this.value = this.field!.innerText;
      // Configure timeout
      this.sto = setTimeout(() => {
        this.updateProperty();
      }, this.updateTimeout);
      // Update placeholder
      this.showPlaceholder = this.field!.innerText === "";
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
      this.value = this._property.toRawValue() || "";
      this.showPlaceholder = this.value === "";
    }

  },
  emits: ["change"],
  watch: {
    "property"() {
        this.updateProperty();
        this.activeProperty = markRaw(this.property);
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

.grid-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  width: 100%;
}

.field {
  grid-area: 1 / 1;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  width: 100%;
  padding: 6px 12px;
  border: none;
  box-sizing: border-box;
}

.field:focus {
  outline: none;
}

.placeholder {
  grid-area: 1 / 1;
  color: #999;
  user-select: none;
  padding: 6px 12px;
}

</style>
