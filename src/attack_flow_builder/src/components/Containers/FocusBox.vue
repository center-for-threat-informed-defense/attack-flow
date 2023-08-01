<template>
  <div class="focus-box-container" :tabindex="tabindex" @focusin="onFocusIn" @focusout="onFocusOut">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'FocusBox',
  props: {
    tabindex: {
      type: String as PropType<string>,
      default: "-1"
    },
    pointerEvent: {
      type: String as PropType<"click" | "pointerdown" | null>,
      default: null
    }
  },
  data() {
    return {
      focus: false,
    }
  },
  emits: ["focusin", "focusout"],
  methods: {
    
    /**
     * Focus in behavior.
     */
    onFocusIn() {
      this.focus = true;
      this.$emit("focusin");
    },

    /**
     * Focus out behavior.
     * @param event
     *  The focus event.
     */
    onFocusOut(event: FocusEvent) {
      // If target is not a child of this container, unfocus.
      if(this.focus && !this.$el.contains(event.relatedTarget)) {
        this.focus = false;
        this.$emit("focusout");
      }
    },

    /**
     * Pointer event behavior.
     * @param event
     *  The pointer event.
     */
    onPointerEvent(event: PointerEvent) {
      // If target is a child of this container...
      let target = event.target as HTMLElement;
      while(this.$el !== target) {
        // ...but has the exit flag, emit unfocus.
        if(target.hasAttribute("exit-focus-box")) {
          this.focus = false;
          this.$emit("focusout");
          // Force the container out of focus
          this.$el.blur();
          return;
        }
        target = target.parentElement!;
      }
    }

  },
  mounted() {
    if(this.pointerEvent) {
      this.$el.addEventListener(this.pointerEvent, this.onPointerEvent);
    }
  },
  unmounted() {
    this.$el.removeEventListener(this.pointerEvent, this.onPointerEvent);
  },
});
</script>

<style scoped>

/** === Main Container === */

.focus-box-container:focus {
  outline: none;
}

</style>
