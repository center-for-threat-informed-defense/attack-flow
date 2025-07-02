<template>
  <div class="list-field-control">
    <div
      class="field-item"
      v-for="[key, value] in property.value"
      :key="key"
    >
      <!-- Dictionary Field -->
      <template v-if="getField(value) === 'DictionaryField'">
        <component
          :is="getField(value)"
          :property="value"
          @execute="(cmd: SynchronousEditorCommand) => $emit('execute', cmd)"
        >
          <button
            class="delete-button"
            @pointerdown="onDelete(key)"
            tabindex="-1"
          >
            ✗
          </button>
        </component>
      </template>
      <!-- Primitive Fields -->
      <template v-else>
        <component
          :is="getField(value)"
          :property="value"
          @execute="(cmd: SynchronousEditorCommand) => $emit('execute', cmd)"
        />
        <button
          class="delete-button"
          @pointerdown="onDelete(key)"
          tabindex="-1"
        >
          ✗
        </button>
      </template>
    </div>
    <button
      class="create-button"
      @pointerdown="onCreate()"
    >
      <span><PlusIcon /></span>Add
    </button>
  </div>
</template>

<script lang="ts">
// Dependencies
import * as EditorCommands from "@OpenChart/DiagramEditor"
import { defineAsyncComponent, defineComponent, type PropType } from "vue";
import { 
  DateProperty, DictionaryProperty, EnumProperty, 
  FloatProperty, IntProperty, ListProperty, StringProperty
} from "@OpenChart/DiagramModel";
import type { Property } from "@OpenChart/DiagramModel";
import type { SynchronousEditorCommand } from "@OpenChart/DiagramEditor";
// Components
import PlusIcon from "@/components/Icons/PlusIcon.vue";
import TextField from "./TextField.vue";
import EnumField from "./EnumField.vue";
import NumberField from "./NumberField.vue";
import DateTimeField from "./DateTimeField.vue";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DictionaryField = defineAsyncComponent(() => import("./DictionaryField.vue")) as any;

export default defineComponent({
  name: "ListField",
  props: {
    property: {
      type: Object as PropType<ListProperty>,
      required: true
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
        case DictionaryProperty.name:
          return "DictionaryField";
      }
    },

    /**
     * Create sub-property behavior.
     */
    onCreate() {
      const cmd = EditorCommands.createSubproperty(this.property);
      this.$emit("execute", cmd);
    },

    /**
     * Delete sub-property behavior.
     * @param id
     *  The sub-property's id.
     */
    onDelete(id: string) {
      const cmd = EditorCommands.deleteSubproperty(this.property, id);
      this.$emit("execute", cmd);
    }

  },
  emits: {
    execute: (cmd: SynchronousEditorCommand) => cmd
  },
  components: {
    PlusIcon,
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
