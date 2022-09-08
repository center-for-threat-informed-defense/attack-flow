<template>
  <div @click="$emit('focus')" class="focus-box-container"><slot></slot></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FocusBox',
  data() {
    return {
      onFocusOut: (
        function(this: any, event: MouseEvent) {
          // If clicked item isn't this container or a child of it, emit
          // unfocus.
          if (this.$el != event.target && !this.$el.contains(event.target)) {
            this.$emit("unfocus");
          }
        }
      ).bind(this)
    }
  },
  emits: ["focus", "unfocus"],
  mounted() {
    // Exit current event chain before binding to the pointerdown event.
    // Otherwise, any click event that triggered mounted() will bubble up to
    // this bound document event and cause focus to be left immediately.
    setTimeout(() => {
        document.body.addEventListener("pointerdown", this.onFocusOut)
    }, 0);
  },
  unmounted() {
    document.body.removeEventListener('pointerdown', this.onFocusOut)
  },
});
</script>
