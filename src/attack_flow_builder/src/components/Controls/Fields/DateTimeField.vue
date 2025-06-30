<template>
  <div class="datetime-field-control">
    <div class="datetime-segment" tabindex="0" @focus="enterEditMode()">
      <ClockIcon class="clock-icon"></ClockIcon>
      <div class="grid-container">
        <div class="value" v-show="!showEditor">
          <p v-if="time === null" class="null-value">
            None
          </p>
          <p v-else class="date-value">{{ timeString }}</p>
        </div>
        <div ref="editorDiv" class="editor" v-show="showEditor">
          <input
            ref="dateInput"  
            type="date"
            class="date-field"
            @blur="onBlur"
            v-model="valueDate"
          >
          <input
            ref="timeInput"  
            type="time"
            class="time-field"
            step="0.01"
            value="00:00:00"
            @blur="onBlur"
            v-model="valueTime"
          >
        </div>
      </div>
    </div>
    <div class="separator horizontal"></div>
    <div class="timezone-segment">
      <TimezoneIcon class="timezone-icon"></TimezoneIcon>
      <EnumField
        class="timezone-field"
        :property="property.timezone"
        @execute="updateTimezoneProperty"
      />
    </div>
    
  </div>
</template>

<script lang="ts">
import * as EditorCommands from "@OpenChart/DiagramEditor";
// Dependencies
import { DateTime } from "luxon";
import { SetEnumProperty } from "@OpenChart/DiagramEditor/Commands/index.commands";
import { defineComponent, type PropType, ref } from "vue";
import type { DateProperty } from "@OpenChart/DiagramModel";
import type { EditorCommand } from "@OpenChart/DiagramEditor";
// Components
import EnumField from "./EnumField.vue";
import ClockIcon from "@/components/Icons/ClockIcon.vue";
import TimezoneIcon from "@/components/Icons/TimezoneIcon.vue";

export default defineComponent({
  name: "DateTimeField",
  setup() {
    return {
      editorDiv: ref<HTMLInputElement | null>(null),
      dateInput: ref<HTMLInputElement | null>(null),
      timeInput: ref<HTMLInputElement | null>(null)
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
      valueDate: "",
      valueTime: "00:00:00",
      showEditor: false
    }
  },
  computed: {
    
    /**
     * Returns the currently set datetime as a string.
     */
    timeString(): string {
      return this.time?.toLocaleString({
        year   : 'numeric',
        month  : 'numeric',
        day    : 'numeric',
        hour   : 'numeric',
        minute : 'numeric'
      }) ?? "None"
    },

    /**
     * Returns the currently set datetime.
     */
    time(): DateTime | null {
      return this.property.time;
    }

  },
  methods: {

    /**
     * Field segment blur behavior.
     * @param event
     *  The blur event.
     */
    onBlur(event: FocusEvent) {
      const target = event.relatedTarget as Node | null;
      if (!this.editorDiv?.contains(target)) {
        this.exitEditMode();
      }
    },

    /**
     * Enters edit mode.
     */
    enterEditMode() {
      this.showEditor = true;
      this.$nextTick(() => {
        // Select date field
        this.dateInput?.focus();
      });
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
      const ISO8601 = `${
        this.valueDate
      }T${
        this.valueTime
      }`;

      // Parse value
      const date = DateTime.fromISO(ISO8601);
      let value;
      if (ISO8601 === "0000-00-00T00:00:00.000") {
        value = null;
      } else if (!date.isValid) {
        value = null;
      } else {
        value = date;
      }

      if (this.property.time?.toISO() !== value?.toISO()) {
        // Update value
        const cmd = EditorCommands.setDatePropertyTime(this.property, value);
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
      const date = this.time?.toISODate();
      const time = this.time?.toISOTime({
        includeOffset: false
      });
      // Update values
      this.valueDate = date ?? "";
      this.valueTime = time ?? "00:00:00.000";
    },

    /**
     * Updates the field's timezone property.
     * @param command
     *  The `SetEnumProperty` command.
     */
    updateTimezoneProperty(command: EditorCommand) {
      if(!(command instanceof SetEnumProperty)) {
        return;  
      }
      // Augment command
      const tz = command.nextValue;
      const cmd = EditorCommands.setDatePropertyTimezone(this.property, tz);
      // Update value
      this.$emit("execute", cmd);
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
  },
  components: { ClockIcon, TimezoneIcon, EnumField }
});
</script>

<style scoped>

/** === Main Field === */

.datetime-field-control {
  display: flex;
  flex-direction: column;
}

.datetime-segment {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #cccccc;
  cursor: text;
  min-height: 30px;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  padding-left: 6px;
  background: #2e2e2e;
}

.datetime-segment:focus {
  outline: none;
}

.timezone-segment {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  padding-left: 6px;
  background: #2e2e2e;
}

.clock-icon,
.timezone-icon {
  height: 17px;
}

.timezone-field {
  flex: 1;
  height: 32px;
  border-radius: inherit;
}

.separator {
  border-color: #242424;
}
.separator.horizontal {
  border-bottom-width: 1px;
  border-bottom-style: solid;
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
  height: 32px;
  padding: 0px 12px;
  border: none;
  box-sizing: border-box;
  overflow: hidden;
}

input {
  color-scheme: dark;
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

.date-field {
  flex: 1;
  min-width: 105px;
}

.time-field {
  flex: 1;
  min-width: 148px;
  padding-left: 10px;
  border-left: solid 1px #242424;
  margin-left: 10px;
}

/** === Value === */

.value {
  grid-area: 1 / 1;
  display: flex;
  align-items: center;
  padding: 6px 12px;
  height: 20px;
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
