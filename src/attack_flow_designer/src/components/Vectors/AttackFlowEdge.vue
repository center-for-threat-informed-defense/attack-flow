<template>
    <path :fill="color" :stroke="color" stroke-width="6" stroke-linecap="round" :d="svgPath"/> 
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AttackFlowEdge",
  props: {
    source  : { type: Object, default: null },
    target  : { type: Object, default: null },
    padding : { type: Number, default: 15 },
    color   : { type: String, default: "#4d4d4d" }
  },
  data: () => ({ w: 4, h: 3 * Math.sqrt(3) }),
  computed: {
      svgPath(): string {

        // If missing node, draw nothing
        if(this.target === null || this.source === null)
            return "";

        // Minor offset required to center arrow. (Must be tuned based on 'stroke-width')
        let offset = 6;

        // Compute Line Coordinates
        let x0 = 0, y0 = 0, x1 = 0, y1 = 0;
        if(this.source_x1 <= this.target_x0) {
            x0 = this.source_x1;
            x1 = this.target_x0 - offset;
            y0 = Math.round(this.source_y0 + ((this.source_y1 - this.source_y0) / 2))
            y1 = Math.round(this.target_y0 + ((this.target_y1 - this.target_y0) / 2))
        } else if(this.target_x1 <= this.source_x0) {
            x0 = this.source_x0 - offset;
            x1 = this.target_x1
            y0 = Math.round(this.source_y0 + ((this.source_y1 - this.source_y0) / 2))
            y1 = Math.round(this.target_y0 + ((this.target_y1 - this.target_y0) / 2))
        } else {
            x0 = Math.round(this.source_x0 + ((this.source_x1 - this.source_x0) / 2))
            x1 = Math.round(this.target_x0 + ((this.target_x1 - this.target_x0) / 2))
            if(this.source_y1 <= this.target_y0) {
                y0 = this.source_y1;
                y1 = this.target_y0 - offset;
            } else if(this.target_y1 <= this.source_y0) {
                y0 = this.source_y0 - offset; 
                y1 = this.target_y1
            } else {
                // If total overlap, draw nothing
                return "";
            }
        }

        // Compute Arrow
        let u1 = x1 - x0;
        let u2 = y1 - y0;
        let len = Math.sqrt(u1**2 + u2**2);
        u1 /= len, u2 /= len;
        x1 = x0 + Math.fround(u1 * len), y1 = y0 + Math.fround(u2 * len);
        let p1 = Math.fround(this.h * u1);
        let p2 = Math.fround(this.w * -u2);
        let p3 = Math.fround(this.h * u2);   
        let p4 = Math.fround(this.w * u1); 
        let ax0 = x1 - p1 + p2;
        let ay0 = y1 - p3 + p4;
        let ax1 = x1 - p1 - p2;
        let ay1 = y1 - p3 - p4;
        
        // Return Path
        return `M${x0},${y0}L${x1},${y1}M${x1},${y1}L${ax0},${ay0}L${ax1},${ay1}Z`;

      },
      source_x0(): number { return this.source?.x0 - this.padding; },
      source_y0(): number { return this.source?.y0 - this.padding; },
      source_x1(): number { return this.source?.x1 + this.padding; },
      source_y1(): number { return this.source?.y1 + this.padding; },
      target_x0(): number { return this.target?.x0 - this.padding; },
      target_y0(): number { return this.target?.y0 - this.padding; },
      target_x1(): number { return this.target?.x1 + this.padding; },
      target_y1(): number { return this.target?.y1 + this.padding; },
  }

});
</script>