<template>
  <FocusBox class="context-menu-control" @unfocus="$emit('unfocus')">
    <ContextMenuListing :sections="[{ id: 'context-menu', items: sections }]"  @select="menuSelect"/>
  </FocusBox>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import FocusBox from "@/components/Containers/FocusBox.vue";
import ContextMenuListing from "../Menus/ContextMenuListing.vue";

export default defineComponent({
  name: 'ContextMenu',
  props: {
    sections: {
        type: Array as PropType<Array<Types.ContextMenuItem>>,
        required: true
    },
    x: {
        type: Number,
        default: 0,
    },
    y: {
        type: Number,
        default: 0,
    }
  },
  emits: ["select", "unfocus"],
  methods: {
    // Menu select behavior
    menuSelect(id: string, data: any) {
      this.$emit("select", id, data);
      this.$emit('unfocus');
    }
  },
  components: { FocusBox, ContextMenuListing }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
