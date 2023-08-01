<template>
  <FocusBox
    :class="['enum-field-control', { disabled }]"
    :tabindex="tabIndex"
    pointerEvent="click"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <div class="options-container">
      <OptionsList 
        class="options-list"
        :select="select"
        :options="options"
        :maxHeight="maxHeight"
        @select="updateProperty"
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
        />
      <div class="dropdown-arrow" v-if="!disabled">▼</div>
    </div>
  </FocusBox>
</template>

<script lang="ts">

// Dependencies
import { EnumProperty } from "@/assets/scripts/BlockDiagram";
import { defineComponent, PropType, ref } from "vue";
// Components
import FocusBox from "@/components/Containers/FocusBox.vue";
import OptionsList from "./OptionsList.vue";

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
      select: this.property.toRawValue(),
      showMenu: false,
      showSearch: false,
      searchTerm: ""
    }
  },
  computed: {

    /**
     * A reactive version of the property.
     * @returns
     *  The property.
     */
    _property(): EnumProperty {
      let trigger = this.property.trigger.value;
      return trigger ? this.property : this.property; 
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
    },

    /**
     * Tests if the null option is selected.
     * @returns
     *  True if the null option is selected, false otherwise.
     */
    isNull(): boolean {
      return this._property.toRawValue() === null;
    },
    
    /**
     * Returns the enum's options.
     * @returns
     *  The enum's options.
     */
    options(): { value: string | null, text: string }[] {
      let options: { value: string | null, text: string }[] = [];
      if(this.searchTerm === "") {
        options.push({ value: null, text: "Null" });
      }
      let st = this.searchTerm.toLocaleLowerCase();
      for(let [value, prop] of this._property.options.value) {
        let text = prop.toString();
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
        let prop = this._property.options.value.get(this.select)!;
        return prop.toString();
      } else {
        return "Null";
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
  emits: ["change"],
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
      this.select = null;
      if(this.searchTerm === "") {
        this.select = this._property.toRawValue();
        return;
      }
      let st = this.searchTerm.toLocaleLowerCase();
      for(let [value, prop] of this._property.options.value) {
        let text = prop.toString();
        if(text.toLocaleLowerCase().includes(st)) {
          this.select = value;
          return;
        }
      }
    },

    /**
     * Search field keydown behavior.
     * @param event
     *  The keydown event.
     */
    onSearchKeyDown(event: KeyboardEvent) {
      let field = event.target as HTMLInputElement;
      if(field.selectionStart !== field.selectionEnd) {
        return;
      }
      let idx;
      let options = this.options;
      switch(event.key) {
        case "ArrowUp":
          idx = options.findIndex(o => o.value === this.select);
          if(0 < idx) {
            this.select = options[idx - 1].value;
          }
          break;
        case "ArrowDown":
          idx = options.findIndex(o => o.value === this.select);
          if(idx < options.length - 1) {
            this.select = options[idx + 1].value;
          }
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
      this.select = this._property.toRawValue()
    }
    
  },
  watch: {
    "_property.trigger.value"() {
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
