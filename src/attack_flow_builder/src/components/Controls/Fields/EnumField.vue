<template>
  <FocusBox
    :class="['enum-field-control', { disabled, open: showMenu }]"
    @focus="openMenu"
    @unfocus="closeMenu"
  >
    <div class="grid-container">
      <!-- Value Text -->
      <div class="value-container">
        <div :class="['value-text', { 'is-null': isNull }]">
          {{ _property.toString() }}
        </div>
        <div class="dropdown-arrow" v-if="!disabled">▼</div>
      </div>
      <!-- Dropdown Options -->
      <ScrollBox :propagateScroll="false" :style="style" v-if="showMenu">
        <ul class="dropdown-options">
          <li 
            :class="[{ active: hovered === 'null' }, 'null']"
            @mouseenter="hovered = 'null'"
            @click.stop="updateProperty(null)"
          >
            Null
          </li>
          <li 
            v-for="[k, v] in options" :key="k"
            :class="{ active: hovered === k }"
            @mouseenter="hovered = k"
            @click.stop="updateProperty(k)"
          >
            {{ v.toString() }}
          </li>
        </ul>
      </ScrollBox>
    </div>
  </FocusBox>
</template>

<script lang="ts">
// Dependencies
import { EnumProperty, Property } from "@/assets/scripts/BlockDiagram";
import { defineComponent, PropType } from "vue";
// Components
import FocusBox from "@/components/Containers/FocusBox.vue";
import ScrollBox from "@/components/Containers/ScrollBox.vue";

export default defineComponent({
  name: "EnumField",
  props: {
    property: {
      type: Object as PropType<EnumProperty>,
      required: true
    },
    maxHeight: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      hovered: "",
      showMenu: false
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
     * Tests if the property is disabled.
     * @returns
     *  True if the property is disabled, false otherwise. 
     */
    disabled(): boolean {
      return !(this._property.descriptor.is_editable ?? true);
    },

    /**
     * Returns the property's set of options.
     * @returns
     *  The property's set of options.
     */
    options(): Map<string, Property> {
      return this._property.options.value;
    },

    /**
     * Tests if the property's value is null.
     * @returns
     *  True if the property's value is null, false otherwise.
     */
    isNull(): boolean {
      return this._property.toRawValue() === null;
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
  methods: {
    
    /**
     * Opens the options menu.
     */
    openMenu() {
      if(this.disabled) {
        return;
      }
      this.showMenu = true;      
    },

    /**
     * Closes the options menu.
     */
    closeMenu() {
      // Close menu
      this.showMenu = false;
      // Refresh value
      this.refreshValue();
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
      // Close menu
      this.showMenu = false;
    },

    /**
     * Updates the field's text value.
     */
    refreshValue() {
      this.hovered = this._property.toRawValue() ?? "null"
    }
    
  },
  emits: ["change"],
  watch: {
    "_property.trigger.value"() {
      this.refreshValue();
    }
  },
  mounted() {
    this.refreshValue();
  },
  components: { FocusBox, ScrollBox }
});
</script>

<style scoped>

/** === Main Field === */

.enum-field-control {
  display: flex;
  align-items: center;
  color: #cccccc;
}

.enum-field-control.open {
  border: solid 1px #3d3d3d;
}

.grid-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) minmax(0, auto);
  width: 100%;
}

/** === Value Text === */

.value-container {
  grid-area: 1 / 1;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.disabled .value-container {
  cursor: inherit;
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

.scrollbox-container {
  grid-area: 2 / 1;
  border-top: dotted 1px #3d3d3d;;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  box-sizing: border-box;
  background: #242424;
}

.dropdown-options {
  padding: 6px 5px;
}

.dropdown-options li {
  list-style: none;
  font-size: 10pt;
  user-select: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 5px 12px;
  overflow: hidden;
}

.dropdown-options li.active,
.dropdown-options li.active.null {
  color: #fff;
  background: #726de2;
}

.dropdown-options li.null {
  color: #999;
}

</style>
