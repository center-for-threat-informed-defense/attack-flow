<template>
  <FocusBox
    :class="['text-field-control', { disabled }]"
    :tab-index="tabIndex"
    pointer-event="click"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <div class="options-container">
      <OptionsList 
        class="options-list"
        :select="select"
        :options="suggestions"
        :max-height="maxHeight"
        @select="updatePropertyFromSuggestion"
        v-if="select !== null"
      />
    </div>
    <div class="value">
      <textarea
        v-model="value"
        ref="field"
        placeholder="None"
        @input="onInput"
        @keyup.stop=""
        @keydown.stop="onKeyDown"
        :disabled="disabled"
      />
    </div>
  </FocusBox>
</template>

<script lang="ts">

// Dependencies
import { MD5 } from "@OpenChart/Utilities";
import { defineComponent, markRaw, type PropType, ref } from "vue";
import type { StringProperty } from "@OpenChart/DiagramModel";
// Components
import FocusBox from "@/components/Containers/FocusBox.vue";
import OptionsList from "./OptionsList.vue";

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
    maxHeight: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      value: "",
      select: null as string | null,
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
      const trigger = this.activeProperty.trigger.value;
      return trigger ? this.activeProperty : this.activeProperty; 
    },

    /**
     * Returns the field's tab index.
     * @returns
     *  The field's tab index.
     */
    tabIndex(): undefined | "0" {
      return this.disabled ? undefined: "0";
    },

    /**
     * Tests if the property is disabled.
     * @returns
     *  True if the property is disabled, false otherwise. 
     */
    disabled(): boolean {
      return !(this._property.descriptor.is_editable ?? true);
    },

    /**
     * Returns the field's suggestions.
     * @returns
     *  The field's suggestions.
     */
    suggestions(): { value: string, text: string }[] {
      const suggestions = [];
      const v = this.value.toLocaleLowerCase();
      for(let i = 0; i < this._property.suggestions.length; i++) {
        const text = this._property.suggestions[i];
        if(text.toLocaleLowerCase().includes(v)) {
          suggestions.push({ value: MD5(text), text });
        }
      }
      return suggestions;
    }

  },
  emits: ["change"],
  methods: {
    
    /**
     * Field focus in behavior.
     */
    onFocusIn() {
      // Focus field
      this.field!.focus();
      // Prompt suggestions
      if(this.value === "") {
        this.promptSuggestions();
      }
    },

    /**
     * Field focus out behavior.
     */
    onFocusOut() {
      // Stop suggestions
      this.stopSuggestions();
    },

    /**
     * Field input behavior.
     */
    onInput() {
      this.updateProperty(this.value);
      this.promptSuggestions();
    },

    /**
     * Field keydown behavior.
     * @param event
     *  The keydown event.
     */
    onKeyDown(event: KeyboardEvent) {
      const field = event.target as HTMLInputElement;
      if(field.selectionStart !== field.selectionEnd) {
        return;
      }
      const s = this.suggestions;
      const idx = s.findIndex(o => o.value === this.select);
      let canAcceptSuggestion;
      switch(event.key) {
        case "Escape":
          this.stopSuggestions();
          event.preventDefault();
          break;
        case "ArrowUp":
          if(0 < idx) {
            this.select = s[idx - 1].value;
          }
          if(this.select !== null) {
            event.preventDefault();
          }
          break;
        case "ArrowDown":
          if(idx < s.length - 1) {
            this.select = s[idx + 1].value;
          }
          if(this.select !== null) {
            event.preventDefault();
          }
          break;
        case "Tab":
          canAcceptSuggestion = idx !== -1;
          canAcceptSuggestion &&= this.value !== "";
          canAcceptSuggestion &&= this.value !== s[idx].text;
          if(canAcceptSuggestion) {
            this.updatePropertyFromSuggestion(s[idx].value);
            this.stopSuggestions();
            event.preventDefault();
          }
          break;
        case "Enter":
          canAcceptSuggestion = idx !== -1;
          canAcceptSuggestion &&= this.value !== s[idx].text;
          if(canAcceptSuggestion) {
            this.updatePropertyFromSuggestion(s[idx].value);
            this.stopSuggestions();
            event.preventDefault();
          }
          break;
      }
    },

    /**
     * Prompts zero or more suggestions.
     */
    promptSuggestions() {
      const isExactTextMatch = this.value === this.suggestions[0]?.text;
      const isSingleSuggestion = this.suggestions.length === 1;
      if(isExactTextMatch && isSingleSuggestion) {
        this.select = null;
        return;
      }
      this.select = null;
      const v = this.value.toLocaleLowerCase();
      for(const s of this.suggestions) {
        if(s.text.toLocaleLowerCase().includes(v)) {
          this.select = s.value;
          return;
        }
      }
    },

    /**
     * Stops the suggestion prompt.
     */
    stopSuggestions() {
      this.select = null;
    },

    /**
     * Updates the field's property value from a suggestion.
     * @param hash
     *  The suggestion's hash.
     */
    updatePropertyFromSuggestion(hash: string) {
      const suggestion = this.suggestions.find(o => o.value === hash);
      if(suggestion) {
        this.updateProperty(suggestion.text);
      }
    },

    /**
     * Updates the field's property value.
     * @param value
     *  The property's new value.
     */
    updateProperty(value: string) {
      const v = value || null;
      if(this._property.toRawValue() !== v) {
        // Update property
        this.$emit("change", this._property, v);
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
      this.value = this.property.toRawValue() ?? "";
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
  watch: {
    "property"() {
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
    this.onResizeObserver = new ResizeObserver(() => {
      this.refreshHeight()
    });
    this.onResizeObserver.observe(this.field!);
    // Update field property value
    this.refreshValue();
  },
  unmounted() {
    // Disconnect resize observer
    this.onResizeObserver!.disconnect();
  },
  components: { FocusBox, OptionsList }
});
</script>

<style scoped>

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

textarea {
  display: block;
  width: 100%;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
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

.options-container {
  position: relative;
  grid-area: 1 / 1;
}

</style>
