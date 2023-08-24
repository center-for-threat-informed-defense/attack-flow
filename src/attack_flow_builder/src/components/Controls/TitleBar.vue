<template>
  <FocusBox class="title-bar-control" pointerEvent="click" @focusout="menuClose">
    <li class="icon">
      <slot name="icon"></slot>
    </li>
    <li 
      v-for="menu of menus"
      :key="menu.text"
      :class="{ active: isActive(menu) }"
      @click="menuOpen(menu.text)"
      @mouseenter="menuEnter(menu.text)"
    >
      <p>{{ menu.text }}</p>
      <ContextMenuListing 
        class="menu-listing"
        :sections="menu.sections"
        @select="menuSelect"
        v-if="isActive(menu)"
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
      activeMenu: null as string | null
    }
  },
  emits: ["select"],
  methods: {

    /**
     * Tests if a menu is currently active.
     * @param menu
     *  The context menu.
     * @returns
     *  True if the menu is active, false otherwise.
     */
    isActive(menu: ContextMenu): boolean {
      return menu.text === this.activeMenu;
    },
    
    /**
     * Menu selection behavior.
     * @param id
     *  The id of the selected menu.
     */
    menuOpen(id: string) {
      this.activeMenu = id;
    },

    /**
     * Menu mouse enter behavior.
     * @param id
     *  The id of the hovered menu.
     */
    menuEnter(id: string) {
      if(this.activeMenu === null)
        return;
      this.activeMenu = id;
    },

    /**
     * Menu close behavior.
     */
    menuClose() {
      this.activeMenu = null;
    },

    /**
     * Menu item selection behavior.
     * @param data
     *  The menu item's data.
     */
    menuSelect(data: any) {
      this.$emit("select", data);
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
