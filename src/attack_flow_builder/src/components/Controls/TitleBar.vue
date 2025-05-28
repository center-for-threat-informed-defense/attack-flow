<template>
  <div class="title-bar-control">
    <li class="icon">
      <slot name="icon" />
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
  </div> 
</template>

<script lang="ts">
// Dependencies
import { RawFocusBox } from '@/assets/scripts/Browser';
import { defineComponent, markRaw, type PropType } from 'vue';
import type { CommandEmitter } from '@/assets/scripts/Application';
import type { ContextMenuSubmenu } from "@/assets/scripts/Browser";
// Components
import ContextMenuListing from "./ContextMenuListing.vue";

export default defineComponent({
  name: 'TitleBar',
  props: {
    menus: {
      type: Array as PropType<ContextMenuSubmenu<CommandEmitter>[]>,
      default: () => []
    }
  },
  data() {
    return {
      activeMenu: null as string | null,
      focusBox: markRaw(new RawFocusBox("click"))
    }
  },
  emits: {
    select: (item: CommandEmitter) => item
  },
  methods: {

    /**
     * Tests if a menu is currently active.
     * @param menu
     *  The context menu.
     * @returns
     *  True if the menu is active, false otherwise.
     */
    isActive(menu: ContextMenuSubmenu<CommandEmitter>): boolean {
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
  mounted() {
    this.focusBox.mount(
      this.$el,
      undefined,
      this.menuClose
    )
  },
  unmounted() {
    this.focusBox.destroy();
  },
  components: { ContextMenuListing }
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
li.active {
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
