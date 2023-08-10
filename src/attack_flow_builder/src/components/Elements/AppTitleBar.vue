<template>
  <TitleBar class="app-title-bar-element" :menus="menus" @select="onItemSelect">
    <template v-slot:icon>
      <img alt="Logo" title="Logo" class="logo" :src="menuIcon">
    </template>
  </TitleBar>
</template>

<script lang="ts">
const Images = require.context("../../assets", false);
import Configuration from "@/assets/builder.config"
// Dependencies
import { ContextMenu } from "@/assets/scripts/ContextMenuTypes";
import { CommandEmitter } from "@/store/Commands/Command";
import { defineComponent } from "vue";
import { mapGetters, mapMutations } from "vuex";
// Components
import TitleBar from "@/components/Controls/TitleBar.vue";

export default defineComponent({
  name: "AppTitleBar",
  data() {
    return {
      menuIcon: Images(Configuration.menu_icon),
    };
  },
  computed: {

    /**
     * Context Menu Store data
     */
    ...mapGetters("ContextMenuStore", [
      "fileMenu",
      "editMenu",
      "layoutMenu",
      "viewMenu",
      "helpMenu"
    ]),
    
    /**
     * Returns the application's menus.
     * @returns
     *  The application's menus.
     */
    menus(): ContextMenu[] {
      return [
        this.fileMenu, 
        this.editMenu,
        this.layoutMenu,
        this.viewMenu,
        this.helpMenu
      ]
    }

  },
  methods: {

    /**
     * Application Store actions
     */
    ...mapMutations("ApplicationStore", ["execute"]),

    /**
     * Menu item selection behavior.
     * @param emitter
     *  Menu item's command emitter.
     */
    async onItemSelect(emitter: CommandEmitter) {
      try {
        let cmd = emitter();
        if(cmd instanceof Promise) {
          this.execute(await cmd);
        } else {
          this.execute(cmd);
        }
      } catch(ex: any) {
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
  margin: 2px 8px 0px 10px;
  height: 16px;
}
</style>
