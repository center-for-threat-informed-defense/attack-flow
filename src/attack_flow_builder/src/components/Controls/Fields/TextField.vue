<template>
  <div class="text-field-input">
    <input :class="`align-${align}`" type="text" v-model="text"/>
  </div>
</template>

<script lang="ts">
import { StringProperty } from "@/assets/scripts/BlockDiagram";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "TextField",
  props: {
    property: {
        type: Object as PropType<StringProperty>,
        required: true
    },
    align: {
        type: String,
        default: "left"
    },
  },
  computed: {
    text: {
      get() { 
        return this.property.value;
      },
      set(text: string) {
        this.$emit("change", this.property, text);
      }
    }
  },
  emits: ["change"]
});
</script>

<style scoped>

.text-field-input {
  display: flex;
  align-items: center;
}
input {
  box-sizing: border-box;
  background: #2e2e2e;
  border: none;
  border-radius: 4px;
  color: #bfbfbf;
  height: 100%;
  width: 100%;
  padding: 6px 10px;
}
input:focus {
  outline: none;
}
.align-left {
  text-align: left;
}
.align-right {
  text-align: right;
}

</style>
