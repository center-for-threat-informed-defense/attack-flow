<template>
  <TitleBar class="app-title-bar-element" :menus="menus" @select="onItemSelect">
    <template v-slot:icon>
      <span class="logo">AFB</span>
    </template>
  </TitleBar>
</template>

<script lang="ts">
// Dependencies
import { ContextMenu } from "@/assets/scripts/ContextMenuTypes";
import { defineComponent } from "vue";
import { mapActions, mapGetters } from "vuex";
// Components
import TitleBar from "@/components/Controls/TitleBar.vue";

export default defineComponent({
  name: "AppTitleBar",
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
     * App Actions Store actions
     */
    ...mapActions("AppActionsStore", ["executeAppAction"]),

    /**
     * Menu item selection behavior.
     * @param id
     *  The id of the selected menu.
     * @param data
     *  Auxillary data included with the selection.
     */
    async onItemSelect(id: string, data: any) {
      try {
        await this.executeAppAction({ id, data });
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
    margin: 0px 8px;
    padding: 2px 4px;
    color: #f0f1f2;
    font-size: 7pt;
    font-weight: 600;
    border-radius: 3px;
    background: #726de2;
}

</style>
