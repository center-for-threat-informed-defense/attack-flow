<template>
  <FocusBox class="title-bar-control" @unfocus="menuClose">
    <li class="icon">
      <slot name="icon"></slot>
    </li>
    <li 
      v-for="menu of menus" :key="menu.id"
      :class="{ focused: menu.id === focusedMenu }"
      @mouseenter="menuEnter(menu.id)"
      @click="menuOpen(menu.id)"
    >
      <p>{{ menu.text }}</p>
      <ContextMenuListing 
        class="menu-listing"
        v-if="menu.id === focusedMenu"
        :sections="menu.sections"
        :select="menuSelect"
        @click.stop
      />
    </li>
  </FocusBox> 
</template>

<script lang="ts">
// Dependencies
import { defineComponent, PropType } from 'vue';
import { ContextMenu } from "@/assets/scripts/ContextMenuTypes";
// Components
import FocusBox from "@/components/Containers/FocusBox.vue";
import ContextMenuListing from "./ContextMenuListing.vue";

export default defineComponent({
  name: 'TitleBar',
  props: {
    menus: {
      type: Array as PropType<ContextMenu[]>,
      default: []
    }
  },
  data() {
    return {
      focusedMenu: null as string | null
    }
  },
  emits: ["select"],
  methods: {
    
    /**
     * Menu selection behavior.
     * @param id
     *  The id of the selected menu.
     */
    menuOpen(id: string) {
      this.focusedMenu = id;
    },

    /**
     * Menu mouse enter behavior.
     * @param id
     *  The id of the hovered menu.
     */
    menuEnter(id: string) {
      if(this.focusedMenu === null)
        return;
      this.focusedMenu = id;
    },

    /**
     * Menu close behavior.
     */
    menuClose() {
      this.focusedMenu = null;
    },

    /**
     * Menu item selection behavior.
     * @param id
     *  The id of the selected menu item.
     * @param closeMenu
     *  [true]
     *   The active menu will close after the selection event.
     *  [false]
     *   The active menu will remain open after the selection event.
     * @param data
     *  Any auxillary data associated with the selection.
     */
    menuSelect(id: string, closeMenu: boolean, data: any) {
      this.$emit("select", id, data);
      if(closeMenu) this.focusedMenu = null;
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
  font-size: 10pt;
  font-weight: 500;
  z-index: 999;
}

/** === Menus === */

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
  color: #d1d1d1;
  background: #383838;
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
