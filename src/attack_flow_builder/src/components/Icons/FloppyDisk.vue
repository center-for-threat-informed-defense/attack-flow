<template>
  <svg :fill="color" width="12" height="12" version="1.1" viewBox="0 0 3.175 3.175" xmlns="http://www.w3.org/2000/svg">
    <path d="m0.43136 0c-0.2371 0-0.43136 0.19425-0.43136 0.43136v2.3097c0 0.2371 0.19425 0.43394 0.43136 0.43394h2.3097c0.2371 0 0.43394-0.19684 0.43394-0.43394v-2.2668l-0.47475-0.47424h-0.32029zm0 0.26346h0.3611v1.0585h0.79452v5.167e-4h0.79349v-1.059h0.21025l0.31822 0.32029v2.1573c0 0.094159-0.073735 0.16789-0.16789 0.16789h-0.09557v-1.3215h-2.1165v1.3215h-0.097637c-0.094159 0-0.16789-0.073735-0.16789-0.16789v-2.3097c0-0.094159 0.073735-0.16789 0.16789-0.16789zm0.62715 0h0.52848v0.79504h-0.52848zm-0.26605 1.5875h1.5875v1.058h-1.5875z"/>
  </svg>
</template>

<script lang="ts">
  import { defineComponent } from "vue";
  
  export default defineComponent({
    name: "FloppyDisk",
    props: {
      color: {
        type: String,
        default: "#999999"
      }
    }
  });
  </script>
  
  <style scoped>
  
  /** === Main Icon === */
  
  .collapsed { 
    transform: rotate(270deg) translateY(0.5px);
  }
  
  </style>
  