<template>
  <div class="dictionary-field-contents-control">
    <div
      class="field-item"
      v-for="[key, value] in fields"
      :key="key"
    >
      <p class="field-name">
        {{ value.name }}
      </p>
      <component
        class="field-value"
        :is="getField(value)"
        :property="value"
        @execute="(cmd: SynchronousEditorCommand) => $emit('execute', cmd)"
      />
    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import { defineAsyncComponent, defineComponent, type PropType } from "vue";
import { 
  DateProperty, DictionaryProperty, EnumProperty, 
  FloatProperty, IntProperty, ListProperty, StringProperty,
  TupleProperty
} from "@OpenChart/DiagramModel";
import type { Property } from "@OpenChart/DiagramModel";
import type { SynchronousEditorCommand } from "@OpenChart/DiagramEditor";
// Components
import TextField from "./TextField.vue";
import ListField from "./ListField.vue";
import EnumField from "./EnumField.vue";
import TupleField from "./TupleField.vue";
import NumberField from "./NumberField.vue";
import DateTimeField from "./DateTimeField.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DictionaryField = defineAsyncComponent(() => import("./DictionaryField.vue")) as any;

export default defineComponent({
  name: "DictionaryFieldContents",
  props: {
    property: {
      type: Object as PropType<DictionaryProperty>,
      required: true
    }
  },
  computed: {
    
    /**
     * The set of visible properties.
     * @returns
     *  The set of visible properties.
     */
    fields(): [string, Property][] {
      return [...this.property.value.entries()].filter(
        o => o[1].isEditable ?? true
      );
    }

  },
  emits: {
    execute: (cmd: SynchronousEditorCommand) => cmd
  },
  methods: {
   
    /**
     * Returns a field's component type.
     * @param type
     *  The type of field.
     * @returns
     *  The field's component type.
     */
    getField(type: Property): string | undefined {
      switch(type.constructor.name) {
        case StringProperty.name:
          return "TextField";
        case IntProperty.name:
        case FloatProperty.name:
          return "NumberField";
        case DateProperty.name:
          return "DateTimeField";
        case EnumProperty.name:
          return "EnumField";
        case ListProperty.name:
          return "ListField";
        case TupleProperty.name:
          return "TupleField";
        case DictionaryProperty.name:
          return "DictionaryField";
      }
    }

  },
  components: {
    TextField,
    ListField,
    EnumField,
    TupleField,
    NumberField,
    DateTimeField,
    DictionaryField
  }
});
</script>

<style scoped>

/** === Main Field === */

.field-item {
  margin-bottom: 14px;
}

.field-item:last-child {
  margin-bottom: 0px;
}

.field-name {
  color: #a6a6a6;
  font-size: 9.5pt;
  font-weight: 500;
  margin-bottom: 6px;
}

.field-value {
  font-size: 10.5pt;
}

.text-field-control,
.enum-field-control,
.number-field-control,
.datetime-field-control,
.tuple-field-control {
  min-height: 30px;
  border-radius: 4px;
  background: #2e2e2e;
}

</style>
