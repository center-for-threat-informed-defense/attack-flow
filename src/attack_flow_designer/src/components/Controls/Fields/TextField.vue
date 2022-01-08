<template>
  <div class="text-field-input">
    <p class="warning-icon" v-if="required && text.length === 0">⚠</p>
    <input :class="`align-${align}`" type="text" v-model="text"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TextField",
  props: {
    value: { type: String, default: "" },
    align: { type: String, default: "left" },
    required: { type: Boolean, default: false }
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
.text-field-input {
  display: flex;
  align-items: center;
}
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
.warning-icon {
  position: absolute;
  display: inline-block;
  font-size: 12pt;
  color: #d0ad43;
  margin: 0px 12px;
  user-select: none;
}
</style>
