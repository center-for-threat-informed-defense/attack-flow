<template>
  <svg width="17.285" height="13" version="1.1" viewBox="0 0 4.5734 3.4396" xmlns="http://www.w3.org/2000/svg" :fill="color">
    <path d="m0 0v3.4396h0.26458v-0.26355h-0.0010335v-2.9125h1.1369l0.26355 0.26562h2.0412v0.26458h0.26355v-0.5302h-2.1931l-0.26562-0.26355zm0.26458 3.4396h3.713l0.59583-2.3812h-3.713l-0.025322 0.099735zm0.80253-2.1177h3.1662l-0.46302 1.8542h-3.1657z"/>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({ 
  name: "Folder",
  props: {
    color: {
      type: String,
      default: "#89a0ec"
    }
  }
});
</script>
