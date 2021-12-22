<template>
  <FocusBox class="title-bar-control" @unfocus="menuClickOut">
    <li class="icon"><slot name="icon"></slot></li>
    <li 
      v-for="menu of menus" :key="menu.id"
      :class="{ focused: menu.id === focusedMenu }"
      @click="menuClickIn(menu.id)"
      @mouseenter="menuMouseEnter(menu.id)"
    >
      <p>{{ menu.text }}</p>
      <ContextMenuListing 
        v-if="menu.id === focusedMenu"
        class="menu-listing" 
        :sections="menu.sections"
        @select="menuSelect"
      />
    </li>
  </FocusBox> 
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import FocusBox from "@/components/Containers/FocusBox.vue";
import ContextMenuListing from "./Menus/ContextMenuListing.vue";

export default defineComponent({
  name: 'TitleBar',
  props: {
    menus: {
      type: Array as PropType<Array<Types.ContextMenuItem>>,
      default: []
    }
  },
  data() {
    return {
      focusedMenu: null as string | null
    }
  },
  emit: ["select"],
  methods: {
    
    // Menu click behavior
    menuClickIn(id: string) {
      this.focusedMenu = id;
    },
    menuClickOut() {
      this.focusedMenu = null;
    },

    // Menu hover behavior
    menuMouseEnter(id: string) {
      if(this.focusedMenu === null)
        return;
      this.focusedMenu = id;
    },

    // Menu select behavior
    menuSelect(id: string, data: any) {
      this.$emit("select", id, data);
      this.focusedMenu = null;
    }

  },
  components: { FocusBox, ContextMenuListing }
});
</script>

<style scoped>

/** === Main Control === */

.title-bar-control {
  display: flex;
  align-items: center;
  list-style: none;
  font-size: 10pt;
  font-weight: 500;
}

/** === Menu Items === */

li, .icon {
  display: flex;
  align-items: center;
  user-select: none;
}
li:not(.icon) {
  position: relative;
  height: 100%;
  padding: 0px 7px;
}
li:not(.icon):hover,
li:not(.icon).focused {
  color: #bfbfbf;
  background: #333333;
}

/** === Menu Dropdown Listings === */

.menu-listing {
  position: absolute;
  top: 100%;
  left: -1px;
  border-top: none;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  z-index: 1;
}

</style>
