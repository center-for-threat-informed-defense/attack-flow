<template>
  <svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000">
    <path
      d="M12 6L12 12L18 12"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round">
    </path>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({ 
  name: "ClockIcon",
  props: {
    color: {
      type: String,
      default: "#737373"
    }
  }
});
</script>
