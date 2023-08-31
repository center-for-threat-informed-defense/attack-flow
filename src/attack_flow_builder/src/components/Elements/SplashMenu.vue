<template>
  <div class="splash-menu-element">
    <div class="menu-header">
      <div class="application-info">
        <p class="application-name">{{ applicationName }}</p>
        <p class="application-version">Version {{ applicationVersion }}</p>
      </div>
      <img class="organization" v-if="organization" :src="organization" />
    </div>
    <div class="menu-body">
      <div class="section open-recovered-file" v-if="pages.size">
        <p class="section-title">RECOVER FILE</p>
        <ScrollBox class="file-scrollbox">
          <div :class="['file-grid', { 'has-scrollbar': 4 < pages.size }]">
            <div class="file-entry" v-for="[k, p] of pages" :key="k">
              <div class="file" @click="onRecoverFile(p.file)">
                <div class="file-header">
                  <FullPage class="file-icon"/>
                  <p class="file-title">{{ p.name }}</p>
                </div>
                <p class="file-date">{{ p.date }}</p>
              </div>
              <div class="delete-file" @click="onDeleteFile(k)">
                Delete ✗
              </div>
            </div>
          </div>
        </ScrollBox>
      </div>
      <div class="section open-file">
        <p class="section-title">OPEN FILE</p>
        <div class="button-grid">
          <div class="button" @click="onNewFile">
            <div class="button-header">
              <span class="button-icon"><EmptyPage /></span>
              <p class="button-title">{{ newFile.title }}</p>
            </div>
            <p class="button-description">{{ newFile.description }}</p>
          </div>
          <div class="button" @click="onOpenFile">
            <div class="button-header">
              <span class="button-icon"><Folder /></span>
              <p class="button-title">{{ openFile.title }}</p>
            </div>
            <p class="button-description">{{ openFile.description }}</p>
          </div>
        </div>
      </div>
      <div class="section resources" v-if="helpLinks.length">
        <p class="section-title">RESOURCES</p>
        <div class="button-grid">
          <div class="button" v-for="l of helpLinks" :key="l.url" @click="onOpenHelp(l.url!)">
            <div class="button-header">
              <span class="button-icon"><Link /></span>
              <p class="button-title">{{ l.title }}</p>
            </div>
            <p class="button-description">{{ l.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const Images = require.context("../../assets/configuration", false);
import * as App from "@/store/Commands/AppCommands";
import * as Store from "@/store/StoreTypes";
import Configuration from "@/assets/configuration/builder.config"
// Dependencies
import { version } from "@/../package.json";
import { defineComponent } from 'vue';
import { mapGetters, mapMutations, mapState } from 'vuex';
// Components
import Link from "@/components/Icons/Link.vue";
import Folder from "@/components/Icons/Folder.vue";
import FullPage from "@/components/Icons/FullPage.vue";
import EmptyPage from "@/components/Icons/EmptyPage.vue";
import ScrollBox from "../Containers/ScrollBox.vue";

export default defineComponent({
  name: 'SplashMenu',
  data() {
    let organization;
    if (Configuration.splash.organization) {
      organization = Images(Configuration.splash.organization);
    }
    return {
      applicationName: Configuration.application_name,
      applicationVersion: version,
      organization,
      newFile: Configuration.splash.new_file,
      openFile: Configuration.splash.open_file,
      helpLinks: Configuration.splash.help_links
    }
  },
  computed: {

    /**
     * Application Store data
     */
    ...mapState("ApplicationStore", {
      context(state: Store.ApplicationStore): Store.ApplicationStore {
        return state;
      },
      recoveredPages(state: Store.ApplicationStore): Map<string, { name: string, file: string }> {
        return state.recoveryBank.pages;
      }
    }),

    /**
     * Returns the application's recovered pages.
     * @returns
     *  The application's recovered pages.
     */
    pages(): Map<string, { name: string, date: string, file: string }> {
      let pages = new Map();
      for(let [key, page] of this.recoveredPages) {
        let parse = /^((?:.|\n)*)\s{1}\((.*)\)$/m.exec(page.name);
        let file = page.file;
        let name = parse ? parse[1] : "Unknown";
        let date = parse ? parse[2] : "Unknown";
        pages.set(key, { name, date, file });
      }
      return pages;
    }
    
  },
  methods: {

    /**
     * Application Store mutations
     */
    ...mapMutations("ApplicationStore", ["execute"]),

    /**
     * New File behavior.
     */
    async onNewFile() {
      this.execute(await App.PrepareEditorWithFile.fromNew(this.context));
    },

    /**
     * Open File behavior.
     */
    async onOpenFile() {
      this.execute(await App.PrepareEditorWithFile.fromFileSystem(this.context));
    },

    /**
     * Recover File behavior.
     * @param id
     *  The file to recover.
     */
    async onRecoverFile(file: string) {
      this.execute(await App.PrepareEditorWithFile.fromFile(this.context, file));
    },

    /**
     * Delete Recovered File behavior.
     * @param id
     *  The id of the file to delete.
     */
    onDeleteFile(id: string) {
      this.execute(new App.DeletePageFromRecoveryBank(this.context, id));
    },

    /**
     * Open help behavior.
     * @param url
     *  The url to open.
     */
    onOpenHelp(url: string) {
      this.execute(new App.OpenHyperlink(this.context, url));
    }

  },
  components: { Link, Folder, FullPage, EmptyPage, ScrollBox },
});
</script>

<style scoped>

/** === Main Element === */

.splash-menu-element {
  display: flex;
  flex-direction: column;
  min-width: 640px;
  border: solid 1px #383838;
  border-radius: 5px;
  background: #242424;
  box-shadow: 0 0 10px 0 rgba(0,0,0,0.35);
  overflow: hidden;
}

/** === Header === */

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 30px;
  border-bottom: solid 1px #383838;
  background: #2e2e2e;
  pointer-events: none;
  user-select: none;
}

.application-info {
  color: #fff;
}

.application-info .application-name {
  font-size: 13.5pt;
  font-weight: 700;
  white-space: nowrap;
}
.application-info .application-version {
  font-size: 9.5pt;
  white-space: nowrap;
}

.organization {
  height: 27px;
}

/** === Body === */

.menu-body {
  padding: 30px;
}

.section {
  margin-bottom: 26px;
}

.section:last-child {
  margin-bottom: 0px;
}

.section-title {
  color: #bfbfbf;
  font-size: 9.5pt;
  font-weight: 500;
  margin-left: 2px;
  margin-bottom: 15px;
}

.section-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 25px;
}

/** === Files & Buttons === */

.file-entry {
  display: flex;
}

.file-entry {
  margin-bottom: 6px;
}

.file-entry:last-child {
  margin-bottom: 0px;
}

.file,
.button {
  border: solid 1px #383838;
  border-radius: 5px;
  box-sizing: border-box;
  user-select: none;
}

.file {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
}

.button {
  padding: 24px;
}

.file-header,
.button-header {
  display: flex;
  align-items: center;
  height: 17px;
}

.button-header {
  margin-bottom: 6px;
}

.file-icon {
  margin-right: 10px;
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 15px;
  margin-right: 10px;
}

.file-title,
.button-title {
  color: #89a0ec;
  white-space: nowrap;
}

.file-title {
  font-size: 11pt;
  margin-right: 20px;
}

.button-title {
  font-size: 12.5pt;
  font-weight: 700;
}

.file-date {
  color: #bfbfbf;
  font-size: 11pt;
}

.button-description {
  color: #bfbfbf;
  font-size: 10pt;
}

.delete-file {
  display: flex;
  align-items: center;
  color: #89a0ec;
  font-size: 9.5pt;
  user-select: none;
  box-sizing: border-box;
  padding: 0px 10px;
  border: solid 1px #383838;
  border-radius: 5px;
  margin-left: 8px;
}

.file:hover,
.button:hover,
.delete-file:hover {
  background: #383838;
}

/** === Open File Section === */

.section.open-file .button-grid {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 14px;
}

/** === Recovered File Section === */

.section.open-recovered-file .file-scrollbox {
  max-height: 160px;
}

.section.open-recovered-file .file-grid.has-scrollbar {
  padding-right: 10px;
}

/** === Resources Section === */

.section.resources .button-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.section.resources .button {
  width: calc(50% - 7px);
}

/** === File Scrollbar === */

.file-scrollbox:deep(.scroll-bar) {
  border: 1px solid #383838;
  border-radius: 5px;
}

</style>
