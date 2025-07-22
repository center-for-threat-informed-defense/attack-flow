<template>
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="#000000"
  >
    <path
      d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M13 2.04932C13 2.04932 16 5.99994 16 11.9999"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M11 21.9506C11 21.9506 8 17.9999 8 11.9999C8 5.99994 11 2.04932 11 2.04932"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M2.62964 15.5H12"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M2.62964 8.5H21.3704"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M19 17.5L19 19L20.5 19"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M19 23C21.2091 23 23 21.2091 23 19C23 16.7909 21.2091 15 19 15C16.7909 15 15 16.7909 15 19C15 21.2091 16.7909 23 19 23Z"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({ 
  name: "TimezoneIcon",
  props: {
    color: {
      type: String,
      default: "#737373"
    }
  }
});
</script>
