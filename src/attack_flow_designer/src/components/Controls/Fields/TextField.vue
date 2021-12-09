<template>
  <div class="text-field-input">
    <input :class="`align-${align}`" type="text" v-model="text" @keydown="onKeyDown" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TextField",
  props: {
    value: { default: "" },
    align: { type: String, default: "left" },
  },
  computed: {
    text: {
      get() { 
        return this.value;
      },
      set(text: string) {
        this.$emit("change", text);
      }
    }
  },
  emits: {
    change: (value: string) => true,
  }
});
</script>

<style scoped>
input {
  box-sizing: border-box;
  background: none;
  font-family: "Inconsolata";
  border: none;
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
