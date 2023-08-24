<template>
  <FocusBox 
    :style="offset" 
    class="context-menu-control"
    pointerEvent="click"
    @focusout="$emit('focusout')"
    @contextmenu.prevent=""
  >
    <ContextMenuListing 
      :sections="sections" 
      :forceInsideWindow="false" 
      @select="data => $emit('select', data)"
    />
  </FocusBox>
</template>

<script lang="ts">
// Dependencies
import { ContextMenuSection } from "@/assets/scripts/ContextMenuTypes";
import { defineComponent, PropType } from 'vue';
// Components
import FocusBox from "@/components/Containers/FocusBox.vue";
import ContextMenuListing from "./ContextMenuListing.vue";

export default defineComponent({
  name: 'ContextMenu',
  props: {
    sections: {
      type: Array as PropType<ContextMenuSection[]>,
      required: true
    }
  },
  data() {
    return {
      xOffset: 0,
      yOffset: 0,
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
  emits: ["select", "focusout"],
  mounted() {
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
  components: { FocusBox, ContextMenuListing }
});
</script>

<style scoped>

/** === Main Control === */

.context-menu-control {
  z-index: 999;
}

</style>
