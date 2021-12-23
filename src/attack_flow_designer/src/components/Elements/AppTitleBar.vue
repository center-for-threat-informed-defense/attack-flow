<template>
  <TitleBar class="app-title-bar-element" :menus="menus"  @select="itemSelect"></TitleBar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions } from "vuex";
import TitleBar from "@/components/Controls/TitleBar.vue";

export default defineComponent({
  name: "AppTitleBar",
  computed: {
    menus(): Array<Types.ContextMenuItem> {
      return [this.fileMenu];
    },
    fileMenu(): Types.ContextMenuItem {
      return {
        id: "file_menu",
        text: "File",
        type: "submenu",
        sections: [
          {
            id: "file_open",
            items: [
              {
                id: "open_attack_flow_save",
                text: "Open Attack Flow...",
                type: "file",
              },
            ],
          },
          {
            id: "file_export",
            items: [
              {
                id: "save_attack_flow",
                text: "Save Attack Flow...",
                type: "action",
              },
              {
                id: "publish_attack_flow",
                text: "Publish Attack Flow...",
                type: "action",
              },
            ],
          },
        ],
      };
    },
  },
  methods: {
    ...mapActions([
      "openAttackFlowSaveFile", 
      "saveAttackFlow",
      "publishAttackFlow"
    ]),

    /**
     * Menu item selection behavior
     */
    itemSelect(id: string, data: any) {
      let name, date;
      switch (id) {
        // Import & Export
        case "open_attack_flow_save":
          this.openAttackFlowSaveFile(data.file);
          break;
        case "save_attack_flow":
          date = new Date()
            .toISOString()
            .split(".")[0]
            .replace(/:/g, "-")
            .replace(/T/, "_");
          name = `attack_flow_${date}.afd`;
          this.saveAttackFlow(name);
          break;
        case "publish_attack_flow":
          date = new Date(); 
          let dateParse = date
            .toISOString()
            .split(".")[0]
            .replace(/:/g, "-")
            .replace(/T/, "_");
          name = `attack_flow_${dateParse}.json`;
          this.publishAttackFlow({ name, date });
        default:
          break;
      }
    },
  },
  components: { TitleBar },
});
</script>
