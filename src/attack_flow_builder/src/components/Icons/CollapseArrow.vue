<template>
  <svg width="8" height="5" :fill="color" :class="{ collapsed }" version="1.1" viewBox="0 0 2.1167 1.3229" xmlns="http://www.w3.org/2000/svg">
    <path d="m2.1167 0-1.0583 1.3229-1.0583-1.3229z" stroke-width="0"/>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CollapseArrow",
  props: {
    collapsed: {
      type: Boolean,
      default: false 
    },
    color: {
      type: String,
      default: "#8c8c8c"
    }
  }
});
</script>

<style scoped>

/** === Main Icon === */

.collapsed { 
  transform: rotate(270deg) translateY(0.5px);
}

</style>
