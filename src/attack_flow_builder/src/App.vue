<template>
  <AppHotkeyBox id="main">
    <AppTitleBar id="app-title-bar"/>
    <div id="app-body">
        <BlockDiagram id="block-diagram"/>
        <EditorTabs id="app-tabs"/>
        <AppFooterBar id="app-footer-bar"/>
    </div>
  </AppHotkeyBox>
</template>

<script lang="ts">
// Dependencies
import { mapActions } from 'vuex';
import { defineComponent } from 'vue';
import Configuration from "@/assets/builder.config";
// Components
import AppTitleBar from "@/components/Elements/AppTitleBar.vue";
import AppHotkeyBox from "@/components/Elements/AppHotkeyBox.vue";
import BlockDiagram from "@/components/Elements/BlockDiagram.vue";
import AppFooterBar from "@/components/Elements/AppFooterBar.vue";
import EditorTabs from "@/components/Elements/EditorTabs.vue";

import FILE from "../test_file_2.json";

export default defineComponent({
  name: 'App',
  methods: {
    
    /**
     * Active Document Store actions
     */
    ...mapActions("ActiveDocumentStore", [
      "createEmptyDocument", "openDocument"
    ]),

    /**
     * App Settings Store actions
     */
    ...mapActions("AppSettingsStore", [
      "loadSettings"
    ]),

  },
  async created() {
    await this.loadSettings();
    await this.createEmptyDocument(`Untitled ${ Configuration.file_type_name }`);
    // await this.openDocument(FILE);
  },
  components: {
    AppHotkeyBox,
    AppTitleBar,
    BlockDiagram,
    AppFooterBar,
    EditorTabs
  },
});
</script>

<style>

/** === Global === */

html,
body {
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0px;
  margin: 0px;
  background: #1a1a1a;
  overflow: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

p {
  margin: 0px;
}

ul {
  margin: 0px;
  padding: 0px;
}

input {
  font-family: "Inter", sans-serif;
  padding: 7px 10px;
}

/** === Main App === */

#app {
  width: 100%;
  height: 100%;
}

#main {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

#app-title-bar {
  flex-shrink: 0;
  height: 32px;
  color: #9e9e9e;
  box-sizing: border-box;
  border-bottom: solid 1px #333333;
  background: #262626;
}

#app-body {
  flex: 1;
  display: grid;
  overflow: hidden;
  grid-template-columns: minmax(0, 1fr) 300px;
  grid-template-rows: minmax(0, 1fr) 29px;
}

#block-diagram { 
  width: 100%;
  flex: 1;
}

#app-footer-bar {
  grid-column: 1 / 3;
  border-top: solid 1px #333333;
  background: #262626;
  color: #bfbfbf;
}

</style>
