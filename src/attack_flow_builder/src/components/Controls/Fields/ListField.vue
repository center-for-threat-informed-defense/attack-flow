<template>
  <div class="object-field-contents-input">
    <div class="field-item" v-for="[key, value] in property.value" :key="key">
      <component
        :is="getField(value.type)"
        :property="value"
        :align="align"
        @change="onChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import { defineComponent, PropType } from "vue";
import { DictionaryProperty, Property, PropertyType } from "@/assets/scripts/BlockDiagram";
// Components
import TextField from "./TextField.vue";
import DictionaryField from "./DictionaryField.vue";

export default defineComponent({
  name: "DictionaryContentsField",
  props: {
    property: {
      type: Object as PropType<DictionaryProperty>,
      required: true
    },
    align: {
      type: String,
      default: "left"
    }
  },
  computed: {
    text: {
      get() { 
        return this.property.value;
      },
      set(text: string) {
        this.$emit("change", text);
      }
    }
  },
  methods: {
   
    /**
     * Returns a field component of a specific type.
     * @param type
     *  The type of field component.
     * @returns
     *  The field component.
     */
    getField(type: PropertyType) {
      switch(type) {
        case PropertyType.String:
          return TextField;
        case PropertyType.Dictionary:
          return DictionaryField
      }
    },

    /**
     * Field change behavior.
     * @param property
     *  The field's property.
     * @param value
     *  The field's new value.
     */
    onChange(property: Property, value: any) {
      this.$emit("change", property, value);
    }

  },
  emits: ["change"]
});
</script>

<style scoped>

.field-item {
  margin-bottom: 12px;
}

.field-name {
  color: #bfbfbf;
  font-size: 10pt;
  font-weight: 500;
  margin-bottom: 8px;
}

.field.text {
  padding: 2px;
  border: solid 1px #3d3d3d;
  background: #2e2e2e;
  border-radius: 3px;
}

</style>

