<template>
  <div class="datetime-field-control" tabindex="0" @focus="enterEditMode()">
    <div class="grid-container">
      <div class="value" v-show="!showEditor">
        <p v-if="value === null" class="null-value">
          <span style="display:none;">
            <!-- {{ _property.trigger }} -->
          </span>
          None
        </p>
        <p v-else class="date-value">
          <span style="display:none;">
            <!-- {{ _property.trigger }} -->
          </span>
          {{ `${value.toLocaleString({
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          })} ${value.toFormat("ZZZZ")}` }}
        </p>
      </div>
      <div class="editor" v-show="showEditor">
        <div style="display: none;">
          <!-- {{ _property.trigger }} -->
        </div>
        <div class="date-wrapper">
          <input type="date" maxlength="10" segment="Date" ref="Date" class="Date" @blur="onBlur" @keydown="onKeyDown"
            v-model="value_Date">
        </div>
        <div class="time-wrapper">
          <input type="time" segment="Time" ref="Time" class="Time" step="0.01" value="00:00:00" @blur="onBlur"
            @keydown="onKeyDown" v-model="value_Time">
          <span class="space" />
          <input type="text" segment="Offset" ref="Offset" class="Offset" list="all_offsets" @blur="onBlur"
            @keydown="onKeyDown" v-model="value_Offset">
          <datalist id="all_offsets">
            <option v-for="[offsetName, offsetValue] in supportedOffsets" :value="offsetValue" :key="offsetValue">
              {{ offsetName }}
            </option>
          </datalist>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as EditorCommands from "@OpenChart/DiagramEditor"
import type { DateProperty } from "@OpenChart/DiagramModel";
import type { EditorCommand } from "@OpenChart/DiagramEditor";
import { defineComponent, markRaw, type PropType, ref } from "vue";
import { DateTime } from "luxon";

type Segments =
  "Date" | "Time" | "Zone";
const Segment = [
  "Date", "Time", "Zone"
] as Segments[]

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
      Date: ref<HTMLInputElement | null>(null),
      Time: ref<HTMLInputElement | null>(null),
      Zone: ref<HTMLInputElement | null>(null),
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
      value_Date: "",
      value_Time: "00:00:00",
      value_Offset: DateTime.local().toFormat("ZZ"),
      showEditor: false
    }
  },
  computed: {
    /**
        * Gets all system-known offsets that could apply to this control's datetime
        * (or to the system's date/time, if the control isn't filled in yet).
        * @returns
        *   An array of [offsetName, offsetValue] string arrays
        */
    supportedOffsets(): Array<Array<string>> {
      const nameToOffsetMap = Intl.supportedValuesOf('timeZone').reduce((o: Map<string, string>, n: string) => {
        // evaluate this datetime in each known timezone
        let d = DateTime.fromISO(this.value_Date + "T" + this.value_Time + "Z")?.setZone(n);
        // or evaluate the user's local datetime in each timezone
        if (!d.isValid) {
          d = DateTime.local({ 'zone': n });
        }
        // put the +0x00 offset string in the Map, using the offset name as key
        return o.set(d.toFormat("ZZZZZ '('ZZZZ')'"), d.toFormat("ZZ"));
      }, new Map());
      // serialize Map key-value pairs to array of arrays
      return Array.from(nameToOffsetMap);
    },
    /**
     * The property's raw value.
     * @returns
     *  the property's raw value.
     */
    value(): DateTime | null {
      const value = this.property.toJson();
      return value !== null ? DateTime.fromISO(value, { setZone: true }) : value;
    },
    /**
         * Returns the currently configured date.
         * @returns
         *  The currently configured date in ISO.
         */
    prop_Date(): string {
      const v = this.value;
      return v?.toISODate() || "None";
    },
    /**
     * Returns the currently configured time.
     * @returns
     *  The currently configured time.
     */
    prop_Time(): string {
      const v = this.value;
      return v?.toISOTime() || "None";
    },
    /**
     * Returns the currently configured time.
     * @returns
     *  The currently configured time.
     */
    prop_Zone(): string {
      const v = this.value;
      return v?.zone.name || DateTime.local().zone.name;
    }
  },
  methods: {

    /**
     * Field segment blur behavior.
     * @param event
     *  The blur event.
     */
    onBlur(event: FocusEvent) {
      if (!this.$el.contains(event.relatedTarget)) {
        this.exitEditMode();
      }
    },

    /**
     * Field segment keydown behavior.
     * @param event
     *  The keydown event.
     */
    onKeyDown(event: KeyboardEvent) {
      const field = event.target as HTMLInputElement;
      if (field.selectionStart !== field.selectionEnd) {
        return;
      }
      switch (event.key) {
        case "Backspace":
          //if(field.selectionEnd === 0) {
          //  this.shiftFocus(-1, false);
          //}
          break;
        case "ArrowLeft":
          if (field.selectionEnd === 0) {
            this.shiftFocus(-1);
            event.preventDefault();
          }
          break;
        case "ArrowRight":
          if (field.selectionEnd === field.maxLength) {
            this.shiftFocus(+1);
            event.preventDefault();
          }
          break;
        default:
          // if the value is a full YYYY-MM-DD string
          if (field.value?.match(/^[^0]\d\d\d/)) {
            this.shiftFocus(+1);
          }
      }
    },

    /**
     * Enters edit mode.
     */
    enterEditMode() {
      this.showEditor = true;
      this.$nextTick(() => {
        // Select field
        let field: HTMLInputElement;
        for (const s of Segment) {
          field = this[s]!;
          if (!field.value) break;
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
    shiftFocus(delta: number) {
      const field = document.activeElement as HTMLInputElement;
      const attr = field.getAttribute("segment")! as Segments;
      const index = Segment.indexOf(attr) + delta;
      if (0 <= index && index < Segment.length) {
        this.$nextTick(() => {
          // Get adjacent segment
          const adj: HTMLInputElement = this[Segment[index]]!;
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
      const ISO8601 = `${this.value_Date
        }T${this.value_Time
        }${this.value_Offset
        }`;
      //this.value_Zone = DateTime.local().setZone(this.value_Zone).zone.name;
      const date = DateTime.fromISO(ISO8601, { setZone: true }); //DateTime.fromFormat(ISO8601, "yyyy-MM-dd'T'HH:mm:ssZZ");
      console.log("update", date);
      // Parse value
      let value;
      if (ISO8601.startsWith("0000-00-00T00:00:00.000")) {
        value = null;
      } else if (!date.isValid) {
        value = null;
      } else {
        value = date;
      }
      if (this.value?.toISO() !== value?.toISO()) {
        console.log("updating value", this.property, value);
        this.property.setValue(value);
        // Update value
        const cmd = EditorCommands.setDateProperty(this.property, value);
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
      // Parse date
      const date = this.value?.toISODate();
      const time = this.value?.toISOTime({ suppressMilliseconds: true, includeOffset: false }) || "00:00:00.000";
      const offset = this.value?.toFormat("ZZ") || this.property.getSiblingOffsets()[0] || DateTime.local().toFormat("ZZ");
      // Update values
      this.value_Date = String(date);
      this.value_Time = String(time);
      this.value_Offset = String(offset);
    }

  },
  emits: {
    execute: (cmd: EditorCommand) => cmd
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

.M,
.D,
.H,
.m,
.s {
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
