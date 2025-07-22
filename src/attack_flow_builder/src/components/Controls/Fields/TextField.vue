<template>
  <FocusBox
    class="text-field-control"
    pointer-event="click"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <div class="options-container">
      <OptionsList
        ref="optionsList" 
        class="options-list"
        :option="select"
        :options="options"
        :max-height="maxHeight"
        @select="updatePropertyFromSuggestion"
        @hover="value => select = value"
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
      />
    </div>
  </FocusBox>
</template>

<script lang="ts">
import * as EditorCommands from "@OpenChart/DiagramEditor"
// Dependencies
import { unsignedMod } from "@/assets/scripts/Browser";
import { defineComponent, type PropType, ref } from "vue";
import type { OptionItem } from "@/assets/scripts/Browser";
import type { StringProperty } from "@OpenChart/DiagramModel";
import type { SynchronousEditorCommand } from "@OpenChart/DiagramEditor";
// Components
import FocusBox from "@/components/Containers/FocusBox.vue";
import OptionsList from "./OptionsList.vue";

export default defineComponent({
  name: "TextField",
  setup() {
    return { 
      field: ref<HTMLElement | null>(null),
      optionsList: ref<HTMLElement | null>(null)
    };
  },
  props: {
    property: {
      type: Object as PropType<StringProperty>,
      required: true
    },
    maxHeight: {
      type: Number,
      default: 300
    },
    featuredOptions: {
      type: Set as PropType<Set<string>>,
      required: false
    }
  },
  data() {
    return {
      value: "",
      select: null as string | null,
      onResizeObserver: null as ResizeObserver | null
    }
  },
  computed: {

    /**
     * Returns the field's suggested options.
     * @returns
     *  The field's suggested options.
     */
    options(): OptionItem<string>[] {
      const optionsProp = this.property.options;
      if(!optionsProp) {
        return [];
      }
      const options: OptionItem<string>[] = [];
      // Create suggestions
      const fo = this.featuredOptions;
      const v = this.value.toLocaleLowerCase();
      for(const [value, prop] of optionsProp.value) {
        const text = prop.toString();
        const feat = fo ? fo.has(value) : true;
        if(text.toLocaleLowerCase().includes(v)) {
          options.push({ value, text, feature: feat });
        }
      }
      // Sort suggestions
      options.sort((a,b) => {
        if(a.feature && !b.feature) {
          return -1;
        } else if(!a.feature && b.feature) {
          return 1;
        } else {
          return 0;
        }
      });
      return options;
    },

  },
  emits: {
    execute: (cmd: SynchronousEditorCommand) => cmd
  },
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
      const options = this.options;
      const optionsList = this.$refs.optionsList as any;
      let canAcceptSuggestion;
      let idx = options.findIndex(o => o.value === this.select);
      switch(event.key) {
        case "Escape":
          this.stopSuggestions();
          event.preventDefault();
          break;
        case "ArrowUp":
          if(!options.length) {
            return;
          }
          event.preventDefault();
          // Resolve index
          idx = unsignedMod(idx - 1, options.length);
          // Update selection
          this.select = options[idx].value;
          optionsList?.bringItemIntoFocus(this.select);
          break;
        case "ArrowDown":
          if(!options.length) {
            return;
          }
          event.preventDefault();
          // Resolve index
          idx = unsignedMod(idx + 1, options.length);
          // Update selection
          this.select = options[idx].value;
          optionsList?.bringItemIntoFocus(this.select);
          break;
        case "Tab":
          canAcceptSuggestion = idx !== -1;
          canAcceptSuggestion &&= this.value !== "";
          canAcceptSuggestion &&= this.value !== options[idx].text;
          if(canAcceptSuggestion) {
            this.updatePropertyFromSuggestion(options[idx].value);
            this.stopSuggestions();
            event.preventDefault();
          }
          break;
        case "Enter":
          canAcceptSuggestion = idx !== -1;
          canAcceptSuggestion &&= this.value !== options[idx].text;
          if(canAcceptSuggestion) {
            this.updatePropertyFromSuggestion(options[idx].value);
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
      const isExactTextMatch = this.value === this.options[0]?.text;
      const isSingleSuggestion = this.options.length === 1;
      if(isExactTextMatch && isSingleSuggestion) {
        this.select = null;
        return;
      }
      this.select = null;
      const v = this.value.toLocaleLowerCase();
      for(const o of this.options) {
        if(o.text.toLocaleLowerCase().includes(v)) {
          this.select = o.value;
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
      const option = this.options.find(o => o.value === hash);
      if(option) {
        this.updateProperty(option.value);
      }
    },

    /**
     * Updates the field's property value.
     * @param value
     *  The property's new value.
     */
    updateProperty(value: string) {
      const v = value || null;
      if(this.property.toJson() !== v) {
        // Update property
        const cmd = EditorCommands.setStringProperty(this.property, v);
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
      this.value = this.property.toJson() ?? "";
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
      // Refresh value
      this.refreshValue();
    },
    "property.value"() {
      // Refresh value
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
    this.onResizeObserver?.disconnect();
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

/** === Dropdown Options === */

.options-container {
  position: relative;
  grid-area: 1 / 1;
}

.options-list :deep(li:not(.dim) + li.dim:before)  {
  content: "";
  display: block;
  border-top: dotted 1px #4d4d4d;
  margin: 3px 6px;
}

</style>
