<template>
  <div class="accordion-pane-container">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AccordionPane",
  props: {
    name: {
      type: String,
      required: true 
    },
    units: {
      type: Number,
      default: 1
    },
    minHeight: {
      type: Number,
      default: 100
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  }
});
</script>

<style scoped>

/** === Main Container === */

.accordion-pane-container {
  height: 100%;
}

</style>