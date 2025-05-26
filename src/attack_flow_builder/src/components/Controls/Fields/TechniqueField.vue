<template>
  <div class="technique-field-container">
    <FocusBox
      class="technique-field-control"
      pointer-event="click"
      @focusin="onFocusIn('tactic')"
      @focusout="onFocusOut('tactic')"
    >
      <div class="options-container">
        <OptionsList 
          class="options-list"
          :select="tacticSelect"
          :options="tacticSuggestions"
          :max-height="maxHeight"
          @select="updatePropertyFromSuggestion('tactic', $event)"
          v-if="tacticSelect !== null"
        />
      </div>
      <div class="value">
        <textarea
          v-model="tacticValue"
          ref="tacticField"
          placeholder="Select a tactic"
          @input="onInput('tactic')"
          @keyup.stop=""
          @keydown.stop="onKeyDown('tactic', $event)"
        />
      </div>
    </FocusBox>

    <FocusBox
      class="technique-field-control"
      pointer-event="click"
      @focusin="onFocusIn('technique')"
      @focusout="onFocusOut('technique')"
      :class="{ 'disabled': !selectedTactic }"
    >
      <div class="options-container">
        <OptionsList 
          class="options-list"
          :select="techniqueSelect"
          :options="techniqueSuggestions"
          :max-height="maxHeight"
          @select="updatePropertyFromSuggestion('technique', $event)"
          v-if="techniqueSelect !== null"
        />
      </div>
      <div class="value">
        <textarea
          v-model="techniqueValue"
          ref="techniqueField"
          placeholder="Select a technique"
          @input="onInput('technique')"
          @keyup.stop=""
          @keydown.stop="onKeyDown('technique', $event)"
          :disabled="!selectedTactic"
        />
      </div>
    </FocusBox>
  </div>
</template>

<script lang="ts">
// Dependencies
import * as EditorCommands from "@OpenChart/DiagramEditor"
import { MD5 } from "@OpenChart/Utilities";
import { defineComponent, type PropType, ref, computed } from "vue";
import type { EditorCommand } from "@OpenChart/DiagramEditor";
import type { TechniqueProperty } from "@OpenChart/DiagramModel";
// Components
import FocusBox from "@/components/Containers/FocusBox.vue";
import OptionsList from "./OptionsList.vue";

export default defineComponent({
  name: "TechniqueField",
  setup() {
    return { 
      tacticField: ref<HTMLTextAreaElement | null>(null),
      techniqueField: ref<HTMLTextAreaElement | null>(null)
    };
  },
  props: {
    property: {
      type: Object as PropType<TechniqueProperty>,
      required: true
    },
    maxHeight: {
      type: Number,
      default: 300
    }
  },
  components: { FocusBox, OptionsList },
  data() {
    return {
      tacticValue: "",
      techniqueValue: "",
      tacticSelect: null as string | null,
      techniqueSelect: null as string | null,
      onResizeObserver: null as ResizeObserver | null
    }
  },
  computed: {
    selectedTactic(): string | null {
      const tacticValue = this.property.tacticValue.value;
      if (!tacticValue) return null;
      const match = tacticValue.match(/^([^:]+):/);
      return match ? match[1].trim() : null;
    },
    tacticSuggestions(): { value: string, text: string }[] {
      const suggestions = [];
      const v = this.tacticValue.toLocaleLowerCase();
      
      for (const text of this.property.tacticValue.suggestions) {
        if (text.toLocaleLowerCase().includes(v)) {
          suggestions.push({ value: MD5(text), text });
        }
      }
      return suggestions;
    },
    techniqueSuggestions(): { value: string, text: string }[] {
      if (!this.selectedTactic) return [];
      
      const suggestions = [];
      const v = this.techniqueValue.toLocaleLowerCase();
      
      for (const text of this.property.techniqueValue.suggestions) {
        if (text.toLocaleLowerCase().includes(v)) {
          suggestions.push({ value: MD5(text), text });
        }
      }
      return suggestions;
    }
  },
  emits: {
    execute: (cmd: EditorCommand) => cmd
  },
  methods: {
    onFocusIn(field: 'tactic' | 'technique') {
      const fieldRef = field === 'tactic' ? this.tacticField : this.techniqueField;
      const value = field === 'tactic' ? this.tacticValue : this.techniqueValue;
      
      fieldRef!.focus();
      if (value === "") {
        this.promptSuggestions(field);
      }
    },

    onFocusOut(field: 'tactic' | 'technique') {
      this.stopSuggestions(field);
    },

    onInput(field: 'tactic' | 'technique') {
      this.updateProperty(field);
      this.promptSuggestions(field);
    },

    onKeyDown(field: 'tactic' | 'technique', event: KeyboardEvent) {
      const fieldRef = field === 'tactic' ? this.tacticField : this.techniqueField;
      const select = field === 'tactic' ? this.tacticSelect : this.techniqueSelect;
      const suggestions = field === 'tactic' ? this.tacticSuggestions : this.techniqueSuggestions;
      const value = field === 'tactic' ? this.tacticValue : this.techniqueValue;

      if (!fieldRef || fieldRef.selectionStart !== fieldRef.selectionEnd) {
        return;
      }

      const idx = suggestions.findIndex(o => o.value === select);
      let canAcceptSuggestion;

      switch(event.key) {
        case "Escape":
          this.stopSuggestions(field);
          event.preventDefault();
          break;
        case "ArrowUp":
          if(0 < idx) {
            if (field === 'tactic') {
              this.tacticSelect = suggestions[idx - 1].value;
            } else {
              this.techniqueSelect = suggestions[idx - 1].value;
            }
          }
          if(select !== null) {
            event.preventDefault();
          }
          break;
        case "ArrowDown":
          if(idx < suggestions.length - 1) {
            if (field === 'tactic') {
              this.tacticSelect = suggestions[idx + 1].value;
            } else {
              this.techniqueSelect = suggestions[idx + 1].value;
            }
          }
          if(select !== null) {
            event.preventDefault();
          }
          break;
        case "Tab":
          canAcceptSuggestion = idx !== -1;
          canAcceptSuggestion &&= value !== "";
          canAcceptSuggestion &&= value !== suggestions[idx].text;
          if(canAcceptSuggestion) {
            this.updatePropertyFromSuggestion(field, suggestions[idx].value);
            this.stopSuggestions(field);
            event.preventDefault();
          }
          break;
        case "Enter":
          event.preventDefault();
          if (idx !== -1 && value !== suggestions[idx].text) {
            // If there's a valid suggestion, use it
            this.updatePropertyFromSuggestion(field, suggestions[idx].value);
          } else if (value) {
            // Handle custom entry
            const match = value.match(/^([^:]+):\s*(.+)$/);
            if (match) {
              // If input matches ID:Name format
              const [_, id, name] = match;
              if (field === 'tactic') {
                this.tacticValue = `${id.trim()}: ${name.trim()}`;
              } else {
                this.techniqueValue = `${id.trim()}: ${name.trim()}`;
              }
            } else {
              // If input doesn't match format, use as name only
              if (field === 'tactic') {
                this.tacticValue = `null: ${value.trim()}`;
              } else {
                this.techniqueValue = `null: ${value.trim()}`;
              }
            }
            this.updateProperty(field);
          }
          this.stopSuggestions(field);
          break;
      }
    },

    promptSuggestions(field: 'tactic' | 'technique') {
      const suggestions = field === 'tactic' ? this.tacticSuggestions : this.techniqueSuggestions;
      const value = field === 'tactic' ? this.tacticValue : this.techniqueValue;
      const select = field === 'tactic' ? this.tacticSelect : this.techniqueSelect;

      const isExactTextMatch = value === suggestions[0]?.text;
      const isSingleSuggestion = suggestions.length === 1;
      
      if(isExactTextMatch && isSingleSuggestion) {
        if (field === 'tactic') {
          this.tacticSelect = null;
        } else {
          this.techniqueSelect = null;
        }
        return;
      }

      if (field === 'tactic') {
        this.tacticSelect = null;
      } else {
        this.techniqueSelect = null;
      }

      const v = value.toLocaleLowerCase();
      for(const s of suggestions) {
        if(s.text.toLocaleLowerCase().includes(v)) {
          if (field === 'tactic') {
            this.tacticSelect = s.value;
          } else {
            this.techniqueSelect = s.value;
          }
          return;
        }
      }
    },

    stopSuggestions(field: 'tactic' | 'technique') {
      if (field === 'tactic') {
        this.tacticSelect = null;
      } else {
        this.techniqueSelect = null;
      }
    },

    updatePropertyFromSuggestion(field: 'tactic' | 'technique', hash: string) {
      const suggestions = field === 'tactic' ? this.tacticSuggestions : this.techniqueSuggestions;
      const suggestion = suggestions.find(o => o.value === hash);
      if(suggestion) {
        if (field === 'tactic') {
          this.tacticValue = suggestion.text;
        } else {
          this.techniqueValue = suggestion.text;
        }
        this.updateProperty(field);
      }
    },

    updateProperty(field: 'tactic' | 'technique') {
      const currentValue = this.property.toJson();
      const newValue = {
        tactic: this.tacticValue,
        technique: this.techniqueValue
      };

      if (field === 'tactic') {
        // If tactic changes, clear technique
        newValue.technique = "";
        this.techniqueValue = "";
      }

      if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
        this.property.setValue(newValue);
        const cmd = EditorCommands.setStringProperty(this.property.tacticValue, newValue.tactic);
        this.$emit("execute", cmd);
        const cmd2 = EditorCommands.setStringProperty(this.property.techniqueValue, newValue.technique);
        this.$emit("execute", cmd2);
      } else {
        this.refreshValue();
      }
    },

    refreshValue() {
      const currentValue = this.property.toJson();
      if (currentValue === null) {
        this.tacticValue = "";
        this.techniqueValue = "";
      } else {
        this.tacticValue = this.property.tacticValue.value || "";
        this.techniqueValue = this.property.techniqueValue.value || "";
      }
      this.$nextTick(() => {
        this.refreshHeight();
      }); 
    },

    refreshHeight() {
      if(this.tacticField === null || this.techniqueField === null) {
        return;
      }
      // Collapse and calculate height for tactic field
      this.tacticField.style.height = "0px";
      const tacticHeight = Math.min(this.tacticField.scrollHeight, 200);
      this.tacticField.style.height = `${tacticHeight}px`;

      // Collapse and calculate height for technique field
      this.techniqueField.style.height = "0px";
      const techniqueHeight = Math.min(this.techniqueField.scrollHeight, 200);
      this.techniqueField.style.height = `${techniqueHeight}px`;
    }
  },
  mounted() {
    this.refreshValue();
    this.onResizeObserver = new ResizeObserver(() => {
      this.refreshHeight();
    });
    this.onResizeObserver.observe(this.tacticField!);
    this.onResizeObserver.observe(this.techniqueField!);
  },
  beforeUnmount() {
    if(this.onResizeObserver) {
      this.onResizeObserver.disconnect();
    }
  }
});
</script>

<style scoped>
.technique-field-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.technique-field-control {
  position: relative;
  width: 100%;
  min-height: 24px;
  border-radius: 4px;
  transition: border-color 0.2s;
  background: #2e2e2e;
  box-sizing: border-box;
  color: #cccccc;
}

.technique-field-control.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.technique-field-control:hover:not(.disabled) {
  border-color: #4d4d4d;
}

.technique-field-control:focus-within:not(.disabled) {
  border-color: #726de2;
}

.technique-field-control .value {
  position: relative;
  width: 100%;
  min-height: 24px;
  display: flex;
  cursor: text;
}

.technique-field-control .value textarea {
  display: block;
  width: 100%;
  min-height: 16px;
  max-height: 200px;
  margin: 6px 12px;
  border: none;
  padding: 0;
  background: none;
  outline: none;
  resize: none;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  overflow: hidden;
}

.technique-field-control .value textarea:disabled {
  cursor: not-allowed;
  color: #999;
}

.technique-field-control .value textarea::placeholder {
  color: #999;
  opacity: 1;
}

.technique-field-control .value textarea:focus {
  outline: none;
}

.technique-field-control .options-container {
  position: absolute;
  top: calc(100% + 3px);
  left: 0;
  right: 0;
  z-index: 1;
  border-radius: 4px;
  box-shadow: 0px 5px 5px -2px rgb(0 0 0 / 20%);
  color: #cccccc;
}

.technique-field-control .options-list {
  padding: 6px 5px;
  color: #cccccc;
}

.technique-field-control .options-list li {
  list-style: none;
  font-size: 10pt;
  user-select: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 5px 12px;
  overflow: hidden;
  color: #cccccc;
}

.technique-field-control .options-list li.active {
  color: #fff;
  background: #726de2;
}

.technique-field-control .options-list li.null {
  color: #999;
}

.technique-field-control .no-options {
  color: #999;
  user-select: none;
  padding: 8px 12px;
}

/* Ensure text color is correct in the dropdown */
:deep(.options-list-field-control) {
  color: #cccccc;
}

:deep(.options-list-field-control .options) {
  color: #cccccc;
}

:deep(.options-list-field-control .options li) {
  color: #cccccc;
}

:deep(.options-list-field-control .options li.active) {
  color: #fff;
  background: #726de2;
}
</style> 
