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
      d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM64 352c0-17.7-14.3-32-32-32S0 334.3 0 352v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM416 320c-17.7 0-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352c0-17.7-14.3-32-32-32z"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "FullscreenIcon",
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
