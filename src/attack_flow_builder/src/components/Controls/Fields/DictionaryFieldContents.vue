<template>
  <div class="dictionary-field-contents-control">
    <div class="field-item" v-for="[key, value] in fields" :key="key">
      <p class="field-name">
        {{ titleCase(key) }}
      </p>
      <component
        class="field-value"
        :is="getField(value.type)"
        :property="value"
        @change="(...args) => $emit('change', ...args)"
        @create="(...args) => $emit('create', ...args)"
        @delete="(...args) => $emit('delete', ...args)"
      />
    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import { defineAsyncComponent, defineComponent, PropType } from "vue";
import { DictionaryProperty, Property, PropertyType, titleCase } from "@/assets/scripts/BlockDiagram";
// Components
import TextField from "./TextField.vue";
import ListField from "./ListField.vue";
import EnumField from "./EnumField.vue";
import NumberField from "./NumberField.vue";
import DateTimeField from "./DateTimeField.vue";
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
        o => o[1].descriptor.is_visible_sidebar ?? true
      );
    }

  },
  methods: {
   
    /**
     * Returns a field's component type.
     * @param type
     *  The type of field.
     * @returns
     *  The field's component type.
     */
    getField(type: PropertyType): string | undefined {
      switch(type) {
        case PropertyType.String:
          return "TextField";
        case PropertyType.Int:
        case PropertyType.Float:
          return "NumberField";
        case PropertyType.Date:
          return "DateTimeField";
        case PropertyType.Enum:
          return "EnumField";
        case PropertyType.List:
          return "ListField";
        case PropertyType.Dictionary:
          return "DictionaryField";
      }
    },

    titleCase

  },
  emits: ["change", "create", "delete"],
  components: {
    TextField,
    ListField,
    EnumField,
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
.datetime-field-control {
  min-height: 30px;
  border-radius: 4px;
  background: #2e2e2e;
}

.text-field-control.disabled,
.enum-field-control.disabled,
.number-field-control.disabled,
.datetime-field-control.disabled {
  background: none;
  border: dashed 1px #404040;
}

</style>
