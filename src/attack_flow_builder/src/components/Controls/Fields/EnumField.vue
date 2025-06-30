<template>
  <FocusBox
    class="enum-field-control"
    tab-index="0"
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
        @select="updateProperty"
        @hover="value => select = value"
        v-if="showMenu"
      />
    </div>
    <div class="value-container">
      <div 
        :class="['value-text', { 'is-null': isNull }]"
        v-show="!showSearch"
      >
        {{ selectText }}
      </div>
      <input 
        type="text" 
        ref="search"
        class="value-search"
        placeholder="Search"
        @input="onSearchInput"
        @keyup.stop=""
        @keydown.stop="onSearchKeyDown"
        v-model="searchTerm"
        v-show="showSearch"
      >
      <div class="dropdown-arrow">
        ▼
      </div>
    </div>
  </FocusBox>
</template>

<script lang="ts">
// Dependencies
import * as EditorCommands from "@OpenChart/DiagramEditor";
import { defineComponent, type PropType, ref } from "vue";
// Components
import FocusBox from "@/components/Containers/FocusBox.vue";
import OptionsList from "./OptionsList.vue";
import type { EnumProperty } from "@OpenChart/DiagramModel";
import type { EditorCommand } from "@OpenChart/DiagramEditor";
import { unsignedMod } from "@/assets/scripts/Browser";

export default defineComponent({
  name: "EnumField",
  setup() {
    return { search: ref<HTMLElement | null>(null) };
  },
  props: {
    property: {
      type: Object as PropType<EnumProperty>,
      required: true
    },
    maxHeight: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      select: this.property.toJson(),
      showMenu: false,
      showSearch: false,
      searchTerm: ""
    }
  },
  computed: {

    /**
     * Tests if the null option is selected.
     * @returns
     *  True if the null option is selected, false otherwise.
     */
    isNull(): boolean {
      return this.property.toJson() === null;
    },
    
    /**
     * Returns the enum's options.
     * @returns
     *  The enum's options.
     */
    options(): { value: string | null, text: string }[] {
      const options: { value: string | null, text: string }[] = [];
      if(this.searchTerm === "") {
        options.push({ value: null, text: "None" });
      }
      const st = this.searchTerm.toLocaleLowerCase();
      for(const [value, prop] of this.property.options.value) {
        const text = prop.toString();
        if(st === "" || text.toLocaleLowerCase().includes(st)) {
          options.push({ value, text });
        }
      }
      return options;
    },

    /**
     * Returns the enum's current selection text.
     * @returns
     *  The enum's current selection text.
     */
    selectText(): string {
      if(this.select !== null) {
        const prop = this.property.options.value.get(this.select)!;
        return prop.toString();
      } else {
        return "None";
      }
    },

    /**
     * Returns the scrollbox's style.
     * @returns
     *  The scrollbox's style.
     */
    style(): { maxHeight: string } {
      return { maxHeight: `${ this.maxHeight }px` };
    }

  },
  emits: {
    execute: (cmd: EditorCommand) => cmd
  },
  methods: {

    /**
     * Field focus in behavior.
     */
    onFocusIn() {
      // Open menu
      this.showMenu = true;
      // Show search
      this.showSearch = true;
      // Focus search
      setTimeout(() => {
        this.search?.focus();
      }, 0);
    },

    /**
     * Field focus out behavior.
     */
    onFocusOut() {
      // Close menu
      this.showMenu = false;
      // Hide search
      this.showSearch = false;
      this.searchTerm = "";
      // Refresh value
      this.refreshValue();
    },

    /**
     * Search field input behavior.
     */
    onSearchInput() {
      const optionAvailable = this.options.find(
        o => o.value === this.select
      );
      // Update select
      if(this.searchTerm === "") {
        this.select = this.property.value;
      } else if(optionAvailable) {
        // Retain current value
      } else if(this.options.length) {
        this.select = this.options[0].value;
      } else {
        this.select = null;
      }
      // Focus selection
      let optionsList = this.$refs.optionsList as any;
      if(optionsList.flip) {
        optionsList?.bringItemIntoFocus(this.select, "bottom");
      } else {
        optionsList?.bringItemIntoFocus(this.select, "top");
      }
    },

    /**
     * Search field keydown behavior.
     * @param event
     *  The keydown event.
     */
    onSearchKeyDown(event: KeyboardEvent) {
      const field = event.target as HTMLInputElement;
      if(field.selectionStart !== field.selectionEnd) {
        return;
      }
      let idx;
      let options = this.options;
      let optionsList = this.$refs.optionsList as any;
      switch(event.key) {
        case "ArrowUp":
          if(!options.length) {
            return;
          }
          event.preventDefault();
          // Resolve index
          idx = options.findIndex(o => o.value === this.select);
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
          idx = options.findIndex(o => o.value === this.select);
          idx = unsignedMod(idx + 1, options.length);
          // Update selection
          this.select = options[idx].value;
          optionsList?.bringItemIntoFocus(this.select);
          break;
        case "Tab":
        case "Enter":
          this.updateProperty(this.select);
          // Force search field out of focus
          this.search!.blur();
          break;
      }
    },

    /**
     * Updates the field's property value.
     * @param value
     *  The property's new value.
     */
    updateProperty(value: string | null) {
      const v = value || null;
      if(this.property.toJson() !== v) {
        // Update property
        const cmd = EditorCommands.setEnumProperty(this.property, v);
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
      this.select = this.property.toJson()
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
    // Update field property value
    this.refreshValue();
  },
  components: { FocusBox, OptionsList }
});
</script>

<style scoped>

/** === Main Field === */

.enum-field-control {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  color: #cccccc;
  box-sizing: border-box;
  background: #2e2e2e;
  cursor: pointer;
}

/** === Value Text === */

.value-container {
  position: relative;
  grid-area: 1 / 1;
  display: flex;
  align-items: center;
}

.value-text {
  flex: 1;
  user-select: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 6px 12px;
  overflow: hidden;
}

.value-text.is-null {
  color: #999;
}

.value-text:not(.is-null) {
  color: #89a0ec;
  font-weight: 500;
}

.value-search {
  flex: 1;
  height: 100%;
  min-width: 0px;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  padding: 6px 8px 6px 12px;
  border: none;
  box-sizing: border-box;
  background: none;
}

.value-search::placeholder {
  color: #999;
  opacity: 1;
}

.value-search:focus {
  outline: none;
}

.dropdown-arrow {
  color: #666666;
  font-size: 6pt;
  font-family: "Inter", sans-serif;
  text-align: center;
  user-select: none;
  width: 16px;
  padding-right: 8px;
}

/** === Dropdown Options === */

.options-container {
  position: relative;
  grid-area: 1 / 1;
}

</style>
