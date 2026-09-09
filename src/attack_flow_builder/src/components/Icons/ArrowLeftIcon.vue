<template>
  <svg
    :width="width"
    :height="height"
    :fill="color"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <!-- !Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
    <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H109.3l105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
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
