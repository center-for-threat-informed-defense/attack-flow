<template>
  <div class="object-field-contents-input">
    <div class="field-item" v-for="[key, value] in property.value" :key="key">
      <p class="field-name">
        {{ titleCase(key) }}
      </p>
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
import { defineAsyncComponent, defineComponent, PropType } from "vue";
import { DictionaryProperty, Property, PropertyType } from "@/assets/scripts/BlockDiagram";

const TextField = defineAsyncComponent(() => import("./TextField.vue"));
const ListField = defineAsyncComponent(() => import("./ListField.vue"));
const DictionaryField = defineAsyncComponent(() => import("./DictionaryField.vue")) as any;

export default defineComponent({
  name: "DictionaryFieldContents",
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
  methods: {
   
    /**
     * Returns a field component of a specific type.
     * @param type
     *  The type of field component.
     * @returns
     *  The field component.
     */
    getField(type: PropertyType): string | undefined {
      switch(type) {
        case PropertyType.String:
          return "TextField";
        case PropertyType.List:
          return "ListField";
        case PropertyType.Dictionary:
          return "DictionaryField";
      }
    },

    /**
     * Field change behavior.
     * @param property
     *  The field's property.
     * @param value
     *  The field's new value.
     */
    onChange(property: Property, value: any): void {
      this.$emit("change", property, value);
    },

    /**
     * Capitalizes the first letter in a string.
     * @param text
     *  The string to capitalize.
     * @returns
     *  The capitalized string.
     */
    capitalize(text: string): string {
      return `${ text[0].toLocaleUpperCase() }${ text.substring(1) }`
    },

    /**
     * Casts a string to title case.
     * 
     * ex. "foo_bar" -> "Foo Bar" 
     * 
     * @param text
     *  The string to cast to title case.
     * @returns
     *  The string cast to title case.
     */
    titleCase(text: string): string {
      return text.split(/\s+|_/).map(s => this.capitalize(s)).join(" ");
    }

  },
  emits: ["change"],
  components: { TextField, ListField, DictionaryField }
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

