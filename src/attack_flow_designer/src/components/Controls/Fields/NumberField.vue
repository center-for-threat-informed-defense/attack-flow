<template>
  <div class="number-field-input">
    <input :class="`align-${align}`" type="text" v-model="text" @keydown="onKeyDown" @focusout="onUnfocus" />
    <div class="increment-arrows">
      <div class="up-arrow" @click="increment">▲</div>
      <div class="down-arrow" @click="decrement">▼</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { clamp } from "@/assets/Math";

export default defineComponent({
  name: "NumberField",
  props: {
    value: { type: Number, default: 0 },
    align: { type: String, default: "left" },
    range: { type: Object, default: { min: -Infinity, max: Infinity } }
  },
  data() {
    return {
      refreshText: true as boolean,
      forceEmptyField: false as boolean
    }
  },
  computed: {
    text: {
      get(): string {
        return this.forceEmptyField ? "" : `${ this.refreshText ? this.value : this.value }`;
      },
      set(text: string) {
        if(text === "") {
          this.forceEmptyField = true;
          this.$emit("change", this.parseInput("0"));
        } else {
          this.forceEmptyField = false;
          this.$emit("change", this.parseInput(text));
        }
      }
    }
  },
  emits: {
    change: (value: number) => true,
  },
  methods: {
    onKeyDown(event: KeyboardEvent) {
      switch(event.key) {
        case "ArrowUp":
          event.preventDefault();
          this.increment();
          break;
        case "ArrowDown":
          event.preventDefault();
          this.decrement();
          break;
      }
    },
    onUnfocus() {
      this.forceEmptyField = false;
      this.refreshText = !this.refreshText;
    },
    increment() {
      let number = Number.isNaN(this.value) ? "0" : `${ this.value + 1 }`;
      this.$emit("change", this.parseInput(number));
    },
    decrement() {
      let number = Number.isNaN(this.value) ? "0" : `${ this.value - 1 }`
      this.$emit("change", this.parseInput(number));
    },
    parseInput(text: string): number {
      let number = parseFloat(text);
      if(Number.isNaN(number)) {
        if(this.range.min <= 0 && 0 <= this.range.max) {
          return 0;
        } else {
          return this.range.min
        }
      } else {
        return clamp(number, this.range.min, this.range.max);
      }
    }
  },
});
</script>

<style scoped>
.number-field-input {
  display: flex; 
  align-items: center;
}

input {
  box-sizing: border-box;
  background: none;
  font-family: "Inconsolata";
  border: none;
  color: #bfbfbf;
  height: 100%;
  width: 100%;
  padding: 6px 8px 6px 12px;
}
input:focus {
  outline: none;
}
.align-left {
  text-align: left;
}
.align-right {
  text-align: right;
}

.increment-arrows {
  display: flex;
  flex-direction: column;
  font-family: "Inter";
  font-size: 7pt;
  color: #666666;
  padding-right: 8px;
  width: 16px;
  user-select: none;
}
.up-arrow, .down-arrow {
  width: 100%;
  text-align: center;
  border-radius: 2px;
  cursor: pointer;
}
.up-arrow:hover, .down-arrow:hover {
  color: #bfbfbf;
}
</style>
