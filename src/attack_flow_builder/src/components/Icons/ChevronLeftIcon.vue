<template>
  <svg
    :width="width"
    :height="height"
    :fill="color"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 320 512"
  >
    <!-- !Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
    <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
  </svg>
</template>
<script setup lang="ts">

defineProps({
    color: {
        type: String,
        default: "#737373"
    },
    width: {
        type: Number,
        default: 16
    },
    height: {
        type: Number,
        default: 16
    }
});

</script>
<style scoped></style>
