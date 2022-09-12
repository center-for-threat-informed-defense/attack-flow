<template>
  <TabBox class="editor-tabs-element" v-model="active">
    <Tab class="object-properties" name="Properties">
      <ObjectEditor />
    </Tab>
  </TabBox>
</template>

<script lang="ts">
// Dependencies
import { ContextMenu } from "@/assets/scripts/ContextMenuTypes";
import { defineComponent, ref } from "vue";
import { mapActions, mapGetters } from "vuex";
// Components
import Tab from "@/components/Containers/Tab.vue";
import TabBox from "@/components/Containers/TabBox.vue";
import ObjectEditor from "@/components/Elements/ObjectEditor.vue";

export default defineComponent({
  name: "EditorTabs",
  setup() {
    return { active: ref(0) }
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
  components: { TabBox, Tab, ObjectEditor }
});
</script>

<style scoped>

.object-properties {
  box-sizing: border-box;
}

</style>
