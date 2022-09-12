<template>
  <div class="object-field-input">
    <div :class="['object-item', { uncollapsed }]" @click="uncollapsed=!uncollapsed">
      {{ property.toString() }}
    </div>
    <div class="object-contents" v-if="uncollapsed"> 
      <DictionaryFieldContents
        :property="property"
        :align="align"
        @change="onChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import { defineComponent, PropType } from "vue";
import { DictionaryProperty, Property } from "@/assets/scripts/BlockDiagram";
// Components
import DictionaryFieldContents from "./DictionaryFieldContents.vue";

export default defineComponent({
  name: "DictionaryField",
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
  data() {
    return {
      uncollapsed: false
    }
  },
  methods: {

    /**
     * Field change behavior.
     * @param property
     *  The field's property.
     * @param value
     *  The field's new value.
     */
    onChange(property: Property, value: any) {
      this.$emit("change", property, value);
    },

  },
  emits: ["change"],
  components: { DictionaryFieldContents }
});
</script>

<style scoped>

.object-item {
  border: solid 1px #3d3d3d;
  border-radius: 3px;
  padding: 8px 10px;
  color: #bfbfbf;
  font-size: 10.5pt;
  user-select: none;
}
.object-item.uncollapsed {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.object-contents {
  padding: 20px 0px 8px 16px;
}

</style>
