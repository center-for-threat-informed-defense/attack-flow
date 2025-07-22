<template>
  <div
    class="hotkey-box-container"
    tabindex="0"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { HotkeyObserver } from "@/assets/scripts/Browser";
import { defineComponent, reactive, type PropType } from "vue";
import type { Hotkey } from "@/assets/scripts/Browser";

export default defineComponent({
  name: "HotkeyBox",
  provide() {
    return {

      /**
       * Tests if a hotkey sequence is active.
       * @param sequence
       *  The hotkey sequence.
       * @param strict
       *  [true]
       *   The active keys must match the provided hotkey sequence exactly.
       *  [false]
       *   The active keys only need to contain the provided hotkey sequence.
       *  (Default: true)
       * @returns
       *  True if the provided hotkey sequence is active, false otherwise.
       */
      isHotkeyActive: (sequence: string, strict: boolean = true): boolean => {
        return this.observer.isHotkeyActive(sequence, strict)
      }

    }
  },
  props: {
    hotkeys: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: Array as PropType<Hotkey<any>[]>,
      default: () => [],
    },
    global: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      observer: new HotkeyObserver((emitter?: any) => this.$emit("fire", emitter), reactive)
    };
  },
  emits: ["fire"],
  watch: {
    // On hotkeys change
    hotkeys() {
      this.observer.setHotkeys(this.hotkeys);
    }
  },
  mounted() {
    this.observer.observe(this.global ? document.body : this.$el);
    this.observer.setHotkeys(this.hotkeys);
  },
  unmounted() {
    this.observer.disconnect();
  }
});
</script>

<style scoped>

/** === Main Container === */

.hotkey-box-container {
	outline: none !important;
}

</style>
