<template>
  <div class="splash-menu-element">
    <div class="menu-header">
      <div class="application-info">
        <p class="application-name">
          {{ applicationName }}
        </p>
        <p class="application-version">
          Version {{ applicationVersion }}
        </p>
      </div>
      <img
        class="organization"
        v-if="organization"
        :src="organization"
      >
    </div>
    <div class="menu-body">
      <div
        class="section open-recovered-file"
        v-if="files.size"
      >
        <p class="section-title">
          RECOVER FILE
        </p>
        <ScrollBox class="file-scrollbox">
          <div :class="['file-grid', { 'has-scrollbar': 4 < files.size }]">
            <div
              class="file-entry"
              v-for="[k, p] of files"
              :key="k"
            >
              <div
                class="file"
                @click="onRecoverFile(p.contents, p.name)"
              >
                <div class="file-header">
                  <FullPageIcon class="file-icon" />
                  <p class="file-title">
                    {{ p.name }}
                  </p>
                </div>
                <p class="file-date">
                  {{ p.date.toLocaleString() }}
                </p>
              </div>
              <div
                class="delete-file"
                @click="onDeleteFile(k)"
              >
                Delete ✗
              </div>
            </div>
          </div>
        </ScrollBox>
      </div>
      <div class="section open-file">
        <p class="section-title">
          OPEN FILE
        </p>
        <div class="button-grid">
          <div
            class="button"
            @click="onNewFile"
          >
            <div class="button-header">
              <span class="button-icon"><EmptyPageIcon /></span>
              <p class="button-title">
                {{ newFile.title }}
              </p>
            </div>
            <p class="button-description">
              {{ newFile.description }}
            </p>
          </div>
          <div
            class="button"
            @click="onOpenFile"
          >
            <div class="button-header">
              <span class="button-icon"><FolderIcon /></span>
              <p class="button-title">
                {{ openFile.title }}
              </p>
            </div>
            <p class="button-description">
              {{ openFile.description }}
            </p>
          </div>
          <div
            class="button"
            @click="onImportStix"
          >
            <div class="button-header">
              <span class="button-icon"><FolderIcon /></span>
              <p class="button-title">
                {{ importStix.title }}
              </p>
            </div>
            <p class="button-description">
              {{ importStix.description }}
            </p>
          </div>
        </div>
      </div>
      <div
        class="section resources"
        v-if="helpLinks.length"
      >
        <p class="section-title">
          RESOURCES
        </p>
        <div class="button-grid">
          <div
            class="button"
            v-for="l of helpLinks"
            :key="l.url"
            @click="onOpenHelp(l.url!)"
          >
            <div class="button-header">
              <span class="button-icon"><LinkIcon /></span>
              <p class="button-title">
                {{ l.title }}
              </p>
            </div>
            <p class="button-description">
              {{ l.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as AppCommands from "@/assets/scripts/Application/Commands";
import Configuration from "@/assets/configuration/app.configuration";
// Dependencies
import { version } from "@/../package.json";
import { defineComponent } from 'vue';
import { useApplicationStore } from "@/stores/ApplicationStore";
import { AppCommand } from "@/assets/scripts/Application";
// Components
import LinkIcon from "@/components/Icons/LinkIcon.vue";
import FolderIcon from "@/components/Icons/FolderIcon.vue";
import FullPageIcon from "@/components/Icons/FullPageIcon.vue";
import EmptyPageIcon from "@/components/Icons/EmptyPageIcon.vue";
import ScrollBox from "../Containers/ScrollBox.vue";

export default defineComponent({
  name: 'SplashMenu',
  data() {
    return {
      application: useApplicationStore(),
      applicationName: Configuration.application_name,
      applicationVersion: version,
      organization: Configuration.splash.organization,
      newFile: Configuration.splash.new_file,
      openFile: Configuration.splash.open_file,
      importStix: Configuration.splash.import_stix,
      helpLinks: Configuration.splash.help_links
    }
  },
  computed: {

    /**
     * Returns the application's recovered files.
     * @returns
     *  The application's recovered files.
     */
    files(): Map<string, { name: string, date: Date, contents: string }> {
      const files = new Map();
      for(const [id, file] of this.application.fileRecoveryBank.files) {
        if(id !== this.application.activeEditor.id) {
          files.set(id, file);
        }
      }
      return files;
    }
    
  },
  methods: {

    /**
     * Executes an application command.
     * @param command
     *  The command to execute.
     */
    execute(command: AppCommand) {
      this.application.execute(command);
    },

    /**
     * New File behavior.
     */
    async onNewFile() {
      const ctx = this.application;
      this.execute(await AppCommands.prepareEditorFromNewFile(ctx));
    },

    /**
     * Open File behavior.
     */
    async onOpenFile() {
      const ctx = this.application;
      this.execute(await AppCommands.prepareEditorFromFileSystem(ctx));
    },

    /**
     * Import STIX behvior.
     */
    async onImportStix() {
      const ctx = this.application;
      this.execute(await AppCommands.prepareEditorFromStixFileSystem(ctx));
    },

    /**
     * Recover File behavior.
     * @param file
     *  The file to recover.
     * @param name
     *  The file's name.
     */
    async onRecoverFile(file: string, name: string) {
      const ctx = this.application;
      this.execute(await AppCommands.prepareEditorFromExistingFile(ctx, file, name));
    },

    /**
     * Delete Recovered File behavior.
     * @param id
     *  The id of the file to delete.
     */
    async onDeleteFile(id: string) {
      const ctx = this.application;
      this.execute(await AppCommands.removeFileFromRecoveryBank(ctx, id));
    },

    /**
     * Open help behavior.
     * @param url
     *  The url to open.
     */
    onOpenHelp(url: string) {
      const ctx = this.application;
      this.execute(AppCommands.openHyperlink(url));
    }

  },
  components: { 
    LinkIcon, FolderIcon, 
    FullPageIcon, EmptyPageIcon,
    ScrollBox
  },
});
</script>

<style scoped>

/** === Main Element === */

.splash-menu-element {
  display: flex;
  flex-direction: column;
  min-width: 640px;
  max-width: 740px;
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
  height: 36px;
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
  padding: 0px 24px;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 14px;
}

/** === Recovered File Section === */

.section.open-recovered-file .file-scrollbox {
  max-height: 162px;
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
