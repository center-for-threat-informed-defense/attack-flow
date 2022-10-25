<template>
  <svg width="8" height="8" version="1.1" viewBox="0 0 2.1167 2.1167" xmlns="http://www.w3.org/2000/svg" :fill="color">
    <path d="m0.79375 0v0.79375h-0.79375v0.52917h0.79375v0.79375h0.52917v-0.79375h0.79375v-0.52917h-0.79375v-0.79375z"/>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({ 
  name: "Plus",
  props: {
    color: {
      type: String,
      default: "#737373"
    }
  }
});
</script>
