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

    <ScrollBox
      class="menu-body-scrollbox"
      :reset-scroll-on-change="true"
    >
      <div
        class="menu-body"
        v-if="application.splashMenuMode === 'home'"
      >
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
                <span class="button-icon">
                  <EmptyPageIcon />
                </span>
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
                <span class="button-icon">
                  <FolderIcon />
                </span>
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
              @click="onGenerateFlow"
            >
              <div class="button-header">
                <span class="button-icon">
                  <FolderIcon />
                </span>
                <p class="button-title">
                  {{ generateFlow.title }}
                </p>
              </div>
              <p class="button-description">
                {{ generateFlow.description }}
              </p>
            </div>
            <div
              class="button"
              @click="onImportStix"
            >
              <div class="button-header">
                <span class="button-icon">
                  <FolderIcon />
                </span>
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
                <span class="button-icon">
                  <LinkIcon />
                </span>
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

      <div
        class="menu-body"
        v-else
      >
        <AIGenerationSplashScreen @on-click-back="onGenerationClickBack" />
      </div>
    </ScrollBox>
  </div>
</template>

<script lang="ts">
import * as AppCommands from "@/assets/scripts/Application/Commands";
import Configuration from "@/assets/configuration/app.configuration";
import { version } from "@/../package.json";
import { defineComponent } from "vue";
import { useApplicationStore } from "@/stores/ApplicationStore";
import { AppCommand } from "@/assets/scripts/Application";
import LinkIcon from "@/components/Icons/LinkIcon.vue";
import FolderIcon from "@/components/Icons/FolderIcon.vue";
import FullPageIcon from "@/components/Icons/FullPageIcon.vue";
import EmptyPageIcon from "@/components/Icons/EmptyPageIcon.vue";
import ScrollBox from "../Containers/ScrollBox.vue";
import AIGenerationSplashScreen from "./AIGenerationSplashScreen.vue";

const displayVersion = version.split(".").slice(0, 2).join(".");

export default defineComponent({
  name: "SplashMenu",
  data() {
    return {
      application: useApplicationStore(),
      applicationName: Configuration.application_name,
      applicationVersion: displayVersion,
      organization: Configuration.splash.organization,
      newFile: Configuration.splash.new_file,
      openFile: Configuration.splash.open_file,
      generateFlow: Configuration.splash.generate_flow,
      importStix: Configuration.splash.import_stix,
      helpLinks: Configuration.splash.help_links
    };
  },
  computed: {

    /**
     * Returns the application's recovered files.
     * @returns
     *  The application's recovered files.
     */
    files(): Map<string, { name: string, date: Date, contents: string }> {
      const files = new Map();
      for (const [id, file] of this.application.fileRecoveryBank.files) {
        if (id !== this.application.activeEditor.id) {
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
     * Generate Flow behavior.
     */
    onGenerateFlow() {
      this.application.splashMenuMode = "ai-generation";
    },

    onGenerationClickBack() {
      this.application.splashMenuMode = "home";
    },

    /**
     * Import STIX behavior.
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
      this.execute(AppCommands.openHyperlink(url));
    }
  },
  components: {
    AIGenerationSplashScreen,
    LinkIcon,
    FolderIcon,
    FullPageIcon,
    EmptyPageIcon,
    ScrollBox
  }
});
</script>

<style scoped>

/** === Main Element === */

.splash-menu-element {
  display: flex;
  flex-direction: column;
  min-width: 640px;
  max-width: 740px;
  border: solid 1px var(--af-border-color-primary);
  border-radius: 5px;
  background: var(--af-bg-color-primary);
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.35);
  overflow: hidden;
  max-height: 90vh;
}

/** === Header === */

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 30px;
  border-bottom: solid 1px var(--af-border-color-primary);
  background: var(--af-bg-color-secondary);
  pointer-events: none;
  user-select: none;
}

.application-info {
  color: #fff;
}

*[data-theme="blog_theme"] .application-info,
*[data-theme="light_theme"] .application-info {
  color: #000;
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

*[data-theme="blog_theme"] .organization,
*[data-theme="light_theme"] .organization {
  filter: invert(1);
}

/** === Body === */

.menu-body {
  padding: 30px;
  box-sizing: border-box;
}

.section {
  margin-bottom: 26px;
}

.section:last-child {
  margin-bottom: 0px;
}

.section-title {
  color: var(--af-text-color-secondary);
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
  margin-bottom: 6px;
}

.file-entry:last-child {
  margin-bottom: 0px;
}

.file,
.button {
  border: solid 1px var(--af-border-color-primary);
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
  cursor: pointer;
}

.button {
  padding: 24px;
  cursor: pointer;
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
  fill: var(--af-color-info);
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 15px;
  margin-right: 10px;
}

.button-icon svg {
  fill: var(--af-color-info);
}

.file-title,
.button-title {
  color: var(--af-color-info);
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
  color: var(--af-text-color-secondary);
  font-size: 11pt;
}

.button-description {
  color: var(--af-text-color-secondary);
  font-size: 10pt;
}

.delete-file {
  display: flex;
  align-items: center;
  color: var(--af-color-info);
  font-size: 9.5pt;
  user-select: none;
  box-sizing: border-box;
  padding: 0px 10px;
  border: solid 1px var(--af-border-color-primary);
  border-radius: 5px;
  margin-left: 8px;
  cursor: pointer;
}

.file:hover,
.button:hover,
.delete-file:hover {
  background: var(--af-border-color-primary);
}

/** === Open File Section === */

.section.open-file .button-grid {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
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
  border: 1px solid var(--af-border-color-primary);
  border-radius: 5px;
}

.menu-body-scrollbox {
    flex-basis: auto;
}
</style>
