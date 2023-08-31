<template>
  <svg width="10" height="13" version="1.1" viewBox="0 0 2.6458 3.4396" xmlns="http://www.w3.org/2000/svg" :fill="color">
    <path d="m0 0v3.4396h2.6458v-2.8324l-0.6072-0.6072h-0.45114zm0.26355 0.26355h1.324v0.79478h0.79272v2.1177h-2.1167zm1.5875 0h0.078031l0.45114 0.4532v0.075964h-0.52917zm-1.3219 0.26562v0.79375h0.79375v-0.79375zm0.26407 0.26407h0.26613v0.26613h-0.26613zm-0.26407 0.79427v0.26458h1.5875v-0.26458zm0 0.52917v0.26458h1.5875v-0.26458zm0 0.52917v0.26458h1.5875v-0.26458z"/>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({ 
  name: "FullPage",
  props: {
    color: {
      type: String,
      default: "#89a0ec"
    }
  }
});
</script>
