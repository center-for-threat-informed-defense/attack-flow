<template>
  <TupleField
    :property="property"
    :featured-options-map="featuredOptionsMap"
    :visible-options-map="visibleOptionsMap"
    @execute="$emit('execute', $event)"
  />
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { useApplicationStore } from "@/stores/ApplicationStore";
import TupleField from "./TupleField.vue";
import type { SynchronousEditorCommand } from "@OpenChart/DiagramEditor";
import { StringProperty, EnumProperty, ListProperty, TTPTupleProperty, MultiSelectProperty } from "@OpenChart/DiagramModel";

export default defineComponent({
  name: "TTPTupleField",
  props: {
    property: {
      type: Object as PropType<TTPTupleProperty>,
      required: true
    }
  },
  computed: {
    featuredOptionsMap(): Map<string, ReadonlySet<string>> {
      const map = new Map<string, ReadonlySet<string>>();
      for (const [key] of this.property.value) {
        const valid = this.property.validPropValues?.get(key);
        if (valid) {
          map.set(key, new Set(valid));
        }
      }
      return map;
    },

    visibleOptionsMap(): Map<string, ReadonlySet<string>> {
      // establish reactive dependency
      void this.selectedFrameworksHash;
      const app = useApplicationStore();
      const canvasProps = app.activeEditor.file.canvas.properties;
      const frameworksProp = canvasProps.get("ttp_frameworks") as MultiSelectProperty | undefined;
      const selectedFrameworks = new Set<string>(frameworksProp ? Array.from(frameworksProp.values) : []);

      const map = new Map<string, ReadonlySet<string>>();
      for (const [key, subprop] of this.property.value) {
        const allowed = new Set<string>();
        const options: ListProperty | undefined = (subprop as StringProperty | EnumProperty).options;
        if (options) {
            for (const [val, optProp] of options.value) {
                const label = optProp.toString();
                for (const code of selectedFrameworks) {
                if (label.includes(`[${code}]`)) { allowed.add(val); break; }
                }
            }
        }
        map.set(key, allowed);
      }
      return map;
    },

    selectedFrameworksHash(): string {
      const app = useApplicationStore();
      const canvasProps = app.activeEditor.file.canvas.properties;
      const frameworks = canvasProps.get("ttp_frameworks") as MultiSelectProperty | undefined;
      const arr = frameworks ? Array.from(frameworks.values) : [];
      return [...arr].sort().join(".");
    }
  },
  emits: {
    execute: (cmd: SynchronousEditorCommand) => cmd
  },
  components: { TupleField }
});
</script>

<style scoped></style>
