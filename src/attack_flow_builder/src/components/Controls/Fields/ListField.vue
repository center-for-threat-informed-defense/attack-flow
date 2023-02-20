<template>
  <div class="list-field-control">
    <div class="field-item" v-for="[key, value] in _property.value" :key="key">
      <!-- Dictionary Field -->
      <template v-if="getField(value.type) === 'DictionaryField'">
        <component
          :is="getField(value.type)"
          :property="value"
          @change="(...args) => $emit('change', ...args)"
          @create="(...args) => $emit('create', ...args)"
          @delete="(...args) => $emit('delete', ...args)"
        >
          <button v-if="!disabled" class="delete-button" @pointerdown="onDelete(key)" tabindex="-1">✗</button>
        </component>
      </template>
      <!-- Primitive Fields -->
      <template v-else>
        <component
          :is="getField(value.type)"
          :property="value"
          @change="(...args) => $emit('change', ...args)"
          @create="(...args) => $emit('create', ...args)"
          @delete="(...args) => $emit('delete', ...args)"
        />
        <button v-if="!disabled" class="delete-button" @pointerdown="onDelete(key)" tabindex="-1">✗</button>
      </template>
    </div>
    <button v-if="!disabled" class="create-button" @pointerdown="onCreate()">
      <span><Plus /></span>Add
    </button>
  </div>
</template>

<script lang="ts">
// Dependencies
import { ListProperty, PropertyType } from "@/assets/scripts/BlockDiagram";
import { defineAsyncComponent, defineComponent, PropType } from "vue";
// Components
import Plus from "@/components/Icons/Plus.vue";
import TextField from "./TextField.vue";
import EnumField from "./EnumField.vue";
import NumberField from "./NumberField.vue";
import DateTimeField from "./DateTimeField.vue";
const DictionaryField = defineAsyncComponent(() => import("./DictionaryField.vue")) as any;

export default defineComponent({
  name: "ListField",
  props: {
    property: {
      type: Object as PropType<ListProperty>,
      required: true
    }
  },
  computed: {

    /**
     * A reactive version of the property.
     * @returns
     *  The property.
     */
    _property(): ListProperty {
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
        case PropertyType.Int:
        case PropertyType.Float:
          return "NumberField";
        case PropertyType.String:
          return "TextField";
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

    /**
     * Create subproperty behavior.
     */
    onCreate() {
      this.$emit("create", this._property);
    },

    /**
     * Delete subproperty behavior.
     * @param id
     *  The subproperty's id.
     */
    onDelete(id: string) {
      this.$emit("delete", this._property, id);
    }

  },
  emits: ["change", "create", "delete"],
  components: {
    Plus,
    TextField,
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
  display: flex;
  margin-bottom: 8px;
}

.text-field-control,
.enum-field-control,
.number-field-control,
.datetime-field-control {
  flex: 1;
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

.dictionary-field-control {
  flex: 1;
}

/** === Create & Delete Buttons === */

.create-button,
.delete-button {
  display: flex;
  align-items: center;
  color: #cccccc;
  font-size: 9pt;
  font-family: inherit;
  border: solid 1px #3d3d3d;
  border-radius: 3px;
  background: none;
}

.create-button {
  width: 100%;
  padding: 4px 10px;
}

.delete-button {
  justify-content: center;
  width: 25px;
  margin-left: 5px;
}

.create-button:hover,
.delete-button:hover {
  background: #303030;
}

.create-button span {
  margin-right: 9px;
}

</style>
