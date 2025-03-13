<template>
  <div class="context-menu-control" :style="offset" @contextmenu.prevent="">
    <ContextMenuListing 
      :sections="sections" 
      :forceInsideWindow="false" 
      @select="data => $emit('select', data)"
    />
  </div>
</template>

<script lang="ts">
// Dependencies
import { RawFocusBox } from "@/assets/scripts/Browser";
import { defineComponent, markRaw, type PropType } from 'vue';
import type { CommandEmitter } from "@/assets/scripts/Application";
import type { ContextMenuSection } from "@/assets/scripts/Browser";
// Components
import ContextMenuListing from "./ContextMenuListing.vue";

export default defineComponent({
  name: 'ContextMenu',
  props: {
    sections: {
      type: Array as PropType<ContextMenuSection<CommandEmitter>[]>,
      required: true
    }
  },
  data() {
    return {
      xOffset: 0,
      yOffset: 0,
      focusBox: markRaw(new RawFocusBox("click"))
    }
  },
  computed: {

    /**
     * Returns the ContextMenu's offset styling.
     * @returns
     *  The ContextMenu's offset styling.
     */
    offset(): { marginTop: string, marginLeft: string } {
      return {
        marginTop: `${ this.yOffset }px`,
        marginLeft: `${ this.xOffset }px`
      }
    }

  },
  emits: {
    select: (item: CommandEmitter) => item,
    focusout: () => true,
  },
  mounted() {
    // Configure focus box
    this.focusBox.mount(
      this.$el,
      undefined,
      () => this.$emit('focusout')
    );
    // Offset menu if outside of viewport
    let viewWidth  = window.innerWidth;
    let viewHeight = window.innerHeight;
    let { bottom, right } = this.$el.getBoundingClientRect();
    // -1 ensures cursor is over menu and not the element beneath it
    this.xOffset = right > viewWidth ? -(this.$el.clientWidth - 1) : 0;
    this.yOffset = bottom > viewHeight ? -(this.$el.clientHeight - 1) : 0;
    // Focus context menu
    this.$el.focus();
  },
  unmounted() {
    this.focusBox.destroy()
  },
  components: { ContextMenuListing }
});
</script>

<style scoped>

/** === Main Control === */

.context-menu-control {
  z-index: 999;
}

</style>
