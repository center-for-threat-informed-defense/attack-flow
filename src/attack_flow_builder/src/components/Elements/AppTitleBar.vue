<template>
  <TitleBar
    class="app-title-bar-element"
    :menus="menus"
    @select="onItemSelect"
  >
    <template #icon>
      <span class="logo">
        <img
          alt="Logo"
          title="Logo"
          :src="icon"
        >
      </span>
    </template>
  </TitleBar>
</template>

<script lang="ts">
import Configuration from "@/assets/configuration/builder.config";
// Dependencies
import { defineComponent } from "vue";
import { useApplicationStore } from "@/stores/Stores/ApplicationStore";
import { useContextMenuStore } from "@/stores/Stores/ContextMenuStore";
import type { CommandEmitter } from "@/stores/Commands/Command";
import type { ContextMenuSubmenu } from "@/assets/scripts/ContextMenuTypes";
// Components
import TitleBar from "@/components/Controls/TitleBar.vue";

export default defineComponent({
  name: "AppTitleBar",
  data() {
    return {
      application: useApplicationStore(),
      contextMenus: useContextMenuStore(),
      icon: Configuration.application_icon
    };
  },
  computed: {
   
    /**
     * Returns the application's menus.
     * @returns
     *  The application's menus.
     */
    menus(): ContextMenuSubmenu<CommandEmitter>[] {
      return [
        this.contextMenus.fileMenu, 
        this.contextMenus.editMenu,
        this.contextMenus.layoutMenu,
        this.contextMenus.viewMenu,
        this.contextMenus.helpMenu
      ]
    }

  },
  methods: {

    /**
     * Menu item selection behavior.
     * @param emitter
     *  Menu item's command emitter.
     */
    async onItemSelect(emitter: CommandEmitter) {
      try {
        const cmd = emitter();
        if(cmd instanceof Promise) {
          this.application.execute(await cmd);
        } else {
          this.application.execute(cmd);
        }
      } catch(ex: unknown) {
        console.error(ex);
      }
    }

  },
  components: { TitleBar }
});
</script>

<style scoped>

/** === App Logo === */

.logo {
  margin: 5px 6px 0px 12px;
}

.logo img {
  height: 16px;
}

</style>
