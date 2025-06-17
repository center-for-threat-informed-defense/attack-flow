<template>
  <div
    class="datetime-field-control"
    tabindex="0"
    @focus="enterEditMode()"
  >
    <div class="grid-container">
      <div
        class="value"
        v-show="!showEditor"
      >
        <p
          v-if="value === null"
          class="null-value"
        >
          None
        </p>
        <p
          v-else
          class="date-value"
        >
          {{ `${value.toLocaleString({
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          })} ${value.toFormat("ZZZZ")}` }}
        </p>
      </div>
      <div
        class="editor"
        v-show="showEditor"
      >
        <div class="date-wrapper">
          <input type="date" maxlength="10" segment="Date" ref="Date" class="Date" @blur="onBlur" v-model="value_Date">
        </div>
        <div class="time-wrapper">
          <input type="time" segment="Time" ref="Time" class="Time" step="0.01" value="00:00:00" @blur="onBlur"
            v-model="value_Time">
          <span class="space" />
          <input type="text" segment="Offset" ref="Offset" class="Offset" list="all_offsets" @blur="onBlur"
            v-model="value_Offset">
          <datalist id="all_offsets">
            <option v-for="[offsetName, offsetValue] in supportedOffsets" :value="offsetValue" :key="offsetName">
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
import { defineComponent, type PropType, ref } from "vue";
import { DateTime } from "luxon";
import { useApplicationStore } from "@/stores/ApplicationStore";

type Segments =
  "Date" | "Time" | "Zone";
const Segment = [
  "Date", "Time", "Zone"
] as Segments[]

const timezoneOptions = Intl.supportedValuesOf('timeZone');

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
      application: useApplicationStore(),
      value_Date: "",
      value_Time: "00:00:00",
      value_Offset: "",
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
      const nameToOffsetMap = timezoneOptions.reduce((o: Map<string, string>, n: string) => {
        // evaluate this datetime in each known timezone
        let d = DateTime.fromISO(this.value_Date + "T" + this.value_Time + "Z")?.setZone(n);
        // or evaluate the user's local datetime in each timezone
        if (!d.isValid) {
          d = DateTime.local({ 'zone': this.application.stickyTimezone });
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
      return v?.zone.name || this.application.stickyTimezone;
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
     * Updates the field's property value.
     */
    updateProperty() {
      // Parse date
      const ISO8601 = `${this.value_Date
        }T${this.value_Time
        }${this.value_Offset
        }`;

      const date = DateTime.fromISO(ISO8601, { setZone: true });
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
        this.property.setValue(value);
        // Update value
        const cmd = EditorCommands.setDateProperty(this.property, value);
        this.$emit("execute", cmd);
        // update store's sticky timezone
        if (this.value_Offset !== this.application.stickyTimezone) {
          this.application.setStickyTimezone(this.value_Offset);
        }
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
      const offset = this.value?.toFormat("ZZ") || this.application.stickyTimezone;
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
  height: auto;
  /* 60px high when editing, 30px (17px without padding) when displaying the value */
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
  padding: 3px 3px;
  border: none;
  box-sizing: border-box;
  height: 60px;
}

input {
  color: inherit;
  font-size: 10pt;
  font-family: inherit;
  padding: 0;
  border: none;
  background: none;
}

input::placeholder {
  color: #999;
  opacity: 1;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  color-scheme: dark;
}

input[type="time"]::-webkit-calendar-picker-indicator {
  display: none;
}

input:focus {
  outline: none;
}

.editor span {
  color: #999;
  font-size: 10pt;
  margin: 0px 3px;
}

.editor span.space {
  margin: 0px 3px;
}

.editor span.offset {
  margin-left: auto;
  margin-top: -30px;
}

.Offset {
  width: 90%;
}

/** === Value === */

.value {
  grid-area: 1 / 1;
  padding: 6px 12px;
  height: 17px;
}

.null-value {
  color: #999;
}

.date-value {
  color: #89a0ec;
  font-weight: 500;
}

.date-wrapper,
.time-wrapper {
  padding: 4px 4px;
}

.date-wrapper {
  border-right: thin #242424 solid;
}
</style>
