<template>
  <div @click="$emit('focus')" class="focus-box-container"><slot></slot></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FocusBox',
  data() {
    return {
      onFocusOut: (function(this: any, event: MouseEvent){ 
        if (this.$el != event.target && !this.$el.contains(event.target))
          this.$emit("unfocus")
      }).bind(this)
    }
  },
  emits: ["focus", "unfocus"],
  mounted() {
    document.body.addEventListener("click", this.onFocusOut)
  },
  destroyed() {
    document.body.removeEventListener('click', this.onFocusOut)
  },
});
</script>
