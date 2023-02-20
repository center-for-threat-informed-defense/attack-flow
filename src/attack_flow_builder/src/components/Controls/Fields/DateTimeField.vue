<template>
  <div :class="['datetime-field-control', { disabled }]" :tabindex="tabIndex" @focus="enterEditMode()">
    <div class="grid-container">
      <div class="value" v-show="!showEditor">
        <p v-if="value === null" class="null-value">
          Null
        </p>
        <p v-else class="date-value">
          {{ prop_M }} {{ prop_D }}, {{ prop_Y }}
          -
          {{ prop_H }}:{{ prop_m }}:{{ prop_s }}
        </p>
      </div>
      <div class="editor" v-show="showEditor">
        <input 
          type="text" maxlength="2" segment="M" ref="M" class="M" placeholder="MM"
          @blur="onBlur" @keydown="onKeyDown" v-model="value_M"
        />
        <span>/</span>
        <input 
          type="text" maxlength="2" segment="D" ref="D" class="D" placeholder="DD"
          @blur="onBlur" @keydown="onKeyDown" v-model="value_D" 
        />
        <span>/</span>
        <input
          type="text" maxlength="4" segment="Y" ref="Y" class="Y" placeholder="YYYY"
          @blur="onBlur" @keydown="onKeyDown" v-model="value_Y" 
        />
        <span class="space"></span>
        <input
          type="text" maxlength="2" segment="H" ref="H" class="H" placeholder="HH"
          @blur="onBlur" @keydown="onKeyDown" v-model="value_H" 
        />
        <span>:</span>
        <input
          type="text" maxlength="2" segment="m" ref="m" class="m" placeholder="mm"
          @blur="onBlur" @keydown="onKeyDown" v-model="value_m"   
        />
        <span>:</span>
        <input
          type="text" maxlength="2" segment="s" ref="s" class="s" placeholder="ss"
          @blur="onBlur" @keydown="onKeyDown" v-model="value_s" 
        />
        <span class="timezone">Z</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { DateProperty } from "@/assets/scripts/BlockDiagram";
import { defineComponent, markRaw, PropType, ref } from "vue";

const Segment = [
  "M", "D", "Y",
  "H", "m", "s"
]

const Months = [
  "Jan", "Feb", "Mar", 
  "Apr", "May", "Jun",
  "Jul", "Aug", "Sep",
  "Oct", "Nov", "Dec"
]

export default defineComponent({
  name: "DateTimeField",
  setup() {
    return { 
      M: ref<HTMLInputElement | null>(null),
      D: ref<HTMLInputElement | null>(null),
      Y: ref<HTMLInputElement | null>(null),
      H: ref<HTMLInputElement | null>(null),
      m: ref<HTMLInputElement | null>(null),
      s: ref<HTMLInputElement | null>(null),
    };
  },
  props: {
    property: {
      type: Object as PropType<DateProperty>,
      required: true
    }
  },
  data() {
    return {
      value_M: "",
      value_D: "",
      value_Y: "",
      value_H: "",
      value_m: "",
      value_s: "",
      showEditor: false,
      activeProperty: markRaw(this.property)
    }
  },
  computed: {

    /**
     * A reactive version of the property.
     * @returns
     *  The property.
     */
    _property(): DateProperty {
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
    },

    /**
     * The property's raw value.
     * @returns
     *  the property's raw value.
     */
    value(): Date | null {
      let value = this._property.toRawValue();
      return value !== null ? new Date(value) : value;
    },

    /**
     * Returns the currently configured month.
     * @returns
     *  The currently configured month.
     */
    prop_M(): string {
      let v = this.value;
      return v ? Months[v.getUTCMonth()] : "Null";
    },

    /**
     * Returns the currently configured day.
     * @returns
     *  The currently configured day.
     */
    prop_D(): string {
      let v = this.value;
      return `${ v?.getUTCDate() ?? 'Null' }`;
    },
    
    /**
     * Returns the currently configured year.
     * @returns
     *  The currently configured year.
     */
    prop_Y(): string {
      let v = this.value;
      return `${ v?.getUTCFullYear() ?? 'Null' }`;
    },

    /**
     * Returns the currently configured hour.
     * @returns
     *  The currently configured hour.
     */
    prop_H(): string {
      let v = this.value;
      return v ? `${ v.getUTCHours() }`.padStart(2, '0') : "Null";
    },

    /**
     * Returns the currently configured minute.
     * @returns
     *  The currently configured minute.
     */
    prop_m(): string {
      let v = this.value;
      return v ? `${ v.getUTCMinutes() }`.padStart(2, '0') : "Null";
    },

    /**
     * Returns the currently configured second.
     * @returns
     *  The currently configured second.
     */
    prop_s(): string {
      let v = this.value;
      return v ? `${ v.getUTCSeconds() }`.padStart(2, '0') : "Null";
    }

  },
  methods: {

    /**
     * Field segment blur behavior.
     * @param event
     *  The blur event.
     */
    onBlur(event: FocusEvent) {
      if(!this.$el.contains(event.relatedTarget)) {
        this.exitEditMode();
      }
    },

    /**
     * Field segment keydown behavior.
     * @param event
     *  The keydown event.
     */
    onKeyDown(event: KeyboardEvent) {
      let field = event.target as HTMLInputElement;
      if(field.selectionStart !== field.selectionEnd) {
        return;
      }
      switch(event.key) {
        case "Backspace":
          if(field.selectionEnd === 0) {
            this.shiftFocus(-1, false);
          }
          break;
        case "ArrowLeft":
          if(field.selectionEnd === 0) {
            this.shiftFocus(-1, false);
            event.preventDefault();
          }
          break;
        case "ArrowRight":
          if(field.selectionEnd === field.maxLength) {
            this.shiftFocus(+1, true);
            event.preventDefault();
          }
          break;
        default:
          if(field.selectionEnd === field.maxLength) {
            this.shiftFocus(+1, true);
          }
      }
    },

    /**
     * Enters edit mode.
     */
    enterEditMode() {
      if(this.disabled) {
        return;
      }
      this.showEditor = true;
      this.$nextTick(() => {
        // Select field
        let field: HTMLInputElement;
        for(let s of Segment) {
          field = (this as any)[s];
          if(!field.value) break;
        }
        // Focus field
        field!.focus();
        // Position caret
        field!.selectionEnd = field!.value.length;
      })
    },

    /**
     * Exits edit mode.
     */
    exitEditMode() {
      this.updateProperty();
      this.showEditor = false;
    },

    /**
     * Shifts focus from the current segment to an adjacent segment.
     * @param delta
     *  The number of segments to shift over.
     * @param start
     *  [true]
     *   Position caret at the start of the segment.
     *  [false]
     *   Position caret at the end of the segment.
     *  (Default: true)
     */
    shiftFocus(delta: number, start: boolean = true) {
      let field = document.activeElement as HTMLInputElement;
      let index = Segment.indexOf(field.getAttribute("segment")!) + delta;
      if(0 <= index && index < Segment.length) {
        this.$nextTick(() => {
          // Get adjacent segment
          let adj: HTMLInputElement = (this as any)[Segment[index]];
          // Focus adjacent segment
          adj.focus();
          // Position caret
          adj.selectionEnd = start ? 0 : adj.value.length;
        });
      }
    },

    /**
     * Updates the field's property value.
     */
    updateProperty() {
      // Parse date
      let ISO8601 = `${ 
        this.value_Y.padStart(4, "0")
      }-${
        this.value_M.padStart(2, "0")
      }-${
        this.value_D.padStart(2, "0")
      }T${
        this.value_H.padStart(2, "0")
      }:${
        this.value_m.padStart(2, "0")
      }:${
        this.value_s.padStart(2, "0")
      }.000Z`;
      let date = new Date(ISO8601);
      // Parse value
      let value;
      if(ISO8601 === "0000-00-00T00:00:00.000Z") {
        value = null;
      } else if(Number.isNaN(date.getTime())) {
        value = null;
      } else {
        value = date;
      }
      if(this.value?.getTime() !== value?.getTime()) {
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
      // Parse date
      let date = this.value?.toISOString() ?? "--T::";
      let [ Y, M, D, H, m, s ] = date.split(/[-T:\.]/);
      // Update values
      this.value_Y = Y;
      this.value_M = M;
      this.value_D = D;
      this.value_H = H;
      this.value_m = m;
      this.value_s = s;
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

.datetime-field-control {
  display: flex;
  align-items: center;
  color: #cccccc;
  cursor: text;
  overflow: hidden;
}

.datetime-field-control.disabled {
  cursor: inherit;
}

.datetime-field-control:focus {
  outline: none;
}

.grid-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  width: 100%;
}

/** === Editor === */

.editor {
  grid-area: 1 / 1;
  display: flex;
  width: 100%;
  padding: 6px 12px;
  border: none;
  box-sizing: border-box;
}

input {
  color: inherit;
  font-size: 10pt;
  font-family: "Roboto Mono";
  padding: 0;
  border: none;
  background: none;
}

input::placeholder {
  color: #999;
  opacity: 1;
}

input:focus {
  outline: none;
}

.editor span {
  color: #999;
  font-size: 10pt;
  font-family: "Roboto Mono";
  margin: 0px 3px;
}

.editor span.space {
  margin: 0px 3px;
}

.editor span.timezone {
  margin-left: 6px;
}

.M, .D, .H, .m, .s {
  width: 16px;
}

.Y {
  width: 32px;
}

/** === Value === */

.value {
  grid-area: 1 / 1;
  padding: 6px 12px;
}

.null-value {
  color: #999;
}

.date-value {
  color: #89a0ec;
  font-weight: 500;
}

</style>
