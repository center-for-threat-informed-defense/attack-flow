<template>
  <svg width="12" height="15" version="1.1" viewBox="0 0 3.175 3.9688" xmlns="http://www.w3.org/2000/svg" :fill="color">
    <path d="m0 0v3.9687h3.175v-3.2556l-0.7121-0.71313h-0.61082zm0.26355 0.26355h1.5885v1.0594h1.0573v2.3823h-2.6458zm1.8542 0h0.23564l0.55604 0.55914v0.23668h-0.79168z"/>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({ 
  name: "EmptyPage",
  props: {
    color: {
      type: String,
      default: "#89a0ec"
    }
  }
});
</script>
