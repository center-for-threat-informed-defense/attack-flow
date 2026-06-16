<template>
  <svg
    :width="width"
    :height="height"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    :fill="color"
  >
    <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc. -->
    <path
      d="M160 64c0-17.7-14.3-32-32-32S96 46.3 96 64v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32v-96c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32h-64V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32v-64h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "ExitFullscreenIcon",
    props: {
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
    }
});
</script>
