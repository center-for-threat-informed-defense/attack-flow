<template>
  <div class="scrollbox-container">
    <div ref="content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { RawScrollBox } from '@/assets/scripts/Browser';
import { defineComponent, markRaw } from 'vue';

export default defineComponent({
  name: "ScrollBox",
  props: {
    alwaysShowScrollBar: {
      type: Boolean,
      default: false
    },
    propagateScroll: {
      type: Boolean,
      default: true
    },
    resetScrollOnChange: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      scrollbox: markRaw(new RawScrollBox(
        this.alwaysShowScrollBar,
        this.propagateScroll,
        this.resetScrollOnChange
      ))
    };
  },
  emits: ["scroll"],
  watch: {
    alwaysShowScrollBar() {
      this.scrollbox.alwaysShowScrollBar = this.alwaysShowScrollBar;
    },
    propagateScroll() {
      this.scrollbox.propagateScroll = this.propagateScroll;
    },
    resetScrollOnChange() {
      this.scrollbox.resetScrollOnChange = this.resetScrollOnChange;
    }
  },
  mounted() {
    this.scrollbox.mount(
      this.$el,
      this.$refs.content as HTMLElement,
      this.$options.__scopeId,
      scrollTop => this.$emit("scroll", scrollTop)
    )
  },
  unmounted() {
    this.scrollbox.destroy()
  },
});
</script>
