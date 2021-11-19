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
    default     : { default: "" },
    align       : { type: String, default: "left" },
    typeTimeout : { type: Number, default: 300 },
  },
  data() {
    return {
      text    : this.default,
      timeout : undefined as number | undefined,
    };
  },
  emits: {
    change: (value: string) => true,
  },
  methods: {
    onKeyDown() {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.$emit("change", this.text);
      }, this.typeTimeout);
    },
  },
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
