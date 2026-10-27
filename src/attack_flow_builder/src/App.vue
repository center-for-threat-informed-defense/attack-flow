<template>
  <AppHotkeyBox
    id="main"
    :class="applicationMode"
    :data-theme="application.activeEditor.file.factory.theme.id"
  >
    <AppTitleBar
      id="app-title-bar"
      v-if="!application.readOnlyMode"
    />
    <FindDialog
      id="find-dialog"
      v-if="extendedEditorShown"
      :style="findDialogLayout"
    />
    <div
      id="app-body"
      ref="body"
      :style="gridLayout"
    >
      <div class="frame center">
        <BlockDiagram id="block-diagram" />
        <SplashMenu
          id="splash-menu"
          v-if="splashMenuShown"
        />
      </div>
      <div
        class="frame right"
        v-if="extendedEditorShown"
      >
        <div
          class="resize-handle"
          @pointerdown="startResize($event, Handle.Right)"
        />
        <EditorSidebar id="app-sidebar" />
      </div>
      <div
        class="frame bottom"
        v-if="extendedEditorShown"
      >
        <AppFooterBar id="app-footer-bar" />
      </div>
    </div>
    <VisualizationModal />
  </AppHotkeyBox>
</template>

<script lang="ts">
// Dependencies
import * as AppCommand from "./assets/scripts/Application/Commands";
import { useApplicationStore } from './stores/ApplicationStore';
import { defineComponent, markRaw, ref } from 'vue';
import { Device, clamp, OperatingSystem, PointerTracker } from "./assets/scripts/Browser";
import type { Command } from "./assets/scripts/Application"
// Components
import FindDialog from "@/components/Elements/FindDialog.vue";
import SplashMenu from "@/components/Elements/SplashMenu.vue";
import AppTitleBar from "@/components/Elements/AppTitleBar.vue";
import AppHotkeyBox from "@/components/Elements/AppHotkeyBox.vue";
import BlockDiagram from "@/components/Elements/BlockDiagram.vue";
import AppFooterBar from "@/components/Elements/AppFooterBar.vue";
import EditorSidebar from "@/components/Elements/EditorSidebar.vue";
import LocalStorageManager from "./LocalStorageManager";
import VisualizationModal from "./components/Elements/VisualizationModal.vue";

const Handle = {
  None   : 0,
  Right  : 1
}

export default defineComponent({
  name: 'App',
  setup() {
    return { body: ref<HTMLElement | null>(null) };
  },
  data() {
    return {
      application: useApplicationStore(),
      Handle,
      bodyWidth: -1,
      bodyHeight: -1,
      frameSize: {
        [Handle.Right]: 376
      },
      minFrameSize: {
        [Handle.Right]: 310
      },
      track: markRaw(new PointerTracker()),
      onResizeObserver: null as ResizeObserver | null
    }
  },
  computed: {

    /**
     * Returns the application's current mode.
     */
    applicationMode() {
        const classes = [];
        if(this.application.isShowingSplash) {
          classes.push("landing");
        }
        if(this.application.readOnlyMode) {
          classes.push("readonly")
        }
        return classes;
    },

    /**
     * Returns whether the extended editor is shown.
     * @returns
     *  True if the extended editor should be shown, false otherwise.
     */
    extendedEditorShown() {
      return !(this.application.isShowingSplash || this.application.readOnlyMode)
    },

    /**
     * Returns whether the splash menu can be shown.
     * @returns
     *  True if the splash menu should be shown, false otherwise.
     */
    splashMenuShown(): boolean {
      return this.application.isShowingSplash && !this.application.readOnlyMode;
    },

    /**
     * Returns the grid layout, for use after the splash screen.
     * @returns
     *  The current grid layout.
     */
    gridLayout(): { gridTemplateColumns: string, gridTemplateRows?: string } {
      const r = this.frameSize[Handle.Right];
      if(this.application.isShowingSplash || this.application.readOnlyMode) {
        return {
          gridTemplateColumns: "100%",
          gridTemplateRows: "100%"
        }
      } else {
        return {
          gridTemplateColumns: `minmax(0, 1fr) ${ r }px`
        }
      }
    },

    /**
     * Compute the location of the find dialog
     * @returns
     *  The current grid layout.
     */
    findDialogLayout(): { right: string } {
      const r = this.frameSize[Handle.Right] + 25;
      return {
        right: `${r}px`
      }
    }

  },
  methods: {

    /**
     * Executes an application command.
     * @param command
     *  The command to execute.
     */
    execute: async function execute(command: Command) {
      await this.application.execute(command);
    },

    /**
     * Resize handle drag start behavior.
     * @param event
     *  The pointer event.
     * @param handle
     *  The id of the handle being dragged.
     */
    startResize(event: PointerEvent, handle: number) {
      const origin = this.frameSize[handle];
      this.track.capture(event, (e, track) => {
        e.preventDefault();
        switch (handle) {
          default:
          case Handle.None:
            break;
          case Handle.Right:
            this.setRightFrameSize(origin - track.deltaX);
            break;
        }
      });
    },

    /**
     * Sets the size of the right frame.
     * @param size
     *  The new size of the right frame.
     */
    setRightFrameSize(size: number) {
      const max = this.bodyWidth;
      const min = this.minFrameSize[Handle.Right];
      this.frameSize[Handle.Right] = clamp(size, min, max);
    }

  },
  async created() {
    const ctx = this.application;
    
    // Import settings
    const os = Device.getOperatingSystemClass();
    let settings;
    if(os === OperatingSystem.MacOS) {
      settings = await (await fetch("./settings_macos.json")).json();
    } else {
      settings = await (await fetch("./settings_win.json")).json();
    }

    settings["view"]["diagram"]["theme"] = LocalStorageManager.getThemeId();
    
    // Load settings
    this.execute(AppCommand.loadSettings(ctx, settings));
    
    // Process query parameters
    const params = new URLSearchParams(window.location.search);
    
    // Set default theme
    const theme = params.get("theme");
    if(theme) {
      this.execute(AppCommand.setDefaultTheme(ctx, theme));
    }

    // Load file
    const src = params.get("src");
    if(src) {
      // Set readonly mode. (Only applies when `src` parameter is also provided).
      if (params.has("readonly")) {
        this.execute(AppCommand.setReadonlyMode(ctx, true));
      }
      // Try to load a file from a URL.
      try {
        // TODO: Incorporate loading dialog
        this.execute(await AppCommand.prepareEditorFromUrl(ctx, src));
      } catch(ex) {
        console.error(`Failed to load file from url: '${ src }'`);
        console.error(ex);
      }
    }
  },
  mounted() {
    this.bodyWidth = this.body!.clientWidth;
    this.bodyHeight = this.body!.clientHeight;
    this.onResizeObserver = new ResizeObserver(() => {
      // Update current body size
      this.bodyWidth = this.body!.clientWidth;
      this.bodyHeight = this.body!.clientHeight;
      // Restrict bottom and right frames
      this.setRightFrameSize(this.frameSize[Handle.Right]);
    });
    this.onResizeObserver.observe(this.body!);

  },
  unmounted() {
    this.onResizeObserver?.disconnect();
  },
  components: {
    AppHotkeyBox,
    AppTitleBar,
    BlockDiagram,
    AppFooterBar,
    EditorSidebar,
    FindDialog,
    SplashMenu,
    VisualizationModal
  },
});
</script>

<style>

/** === Global === */

:root, [data-theme="dark_theme"] * {
    --af-bg-color-primary: #242424;
    --af-bg-color-secondary: #2e2e2e;
    --af-bg-color-tertiary: #3b3b3b;
    --af-bg-color-hover-action: #726de2;

    --af-border-color-primary: #3d3d3d;
    --af-border-color-secondary: #303030;
    --af-border-color-tertiary: #474747;

    --af-text-color-primary: #cccccc;
    --af-text-color-secondary: #a6a6a6;
    --af-text-color-tertiary: #d9d9d9;
    --af-text-color-hover-action: #fff;
    --af-text-color-disabled: #999;
    --af-text-color-placeholder: #808080;
    --af-text-color-info-bg: #000000;

    --af-color-valid: #2bd463;
    --af-color-warning: #e6d846;
    --af-color-error: #ff4d4d;
    --af-color-info: #89a0ec;
}

[data-theme="light_theme"] *, [data-theme="blog_theme"] * {
    --af-bg-color-primary: #eaeaea;
    --af-bg-color-secondary: #dbdbdb;
    --af-bg-color-tertiary: #dcdcdc;
    --af-bg-color-hover-action: #B8CBE0;

    --af-border-color-primary: #d0d0d0;
    --af-border-color-secondary: #cccccc;
    --af-border-color-tertiary: #bbbbbb;

    --af-text-color-primary: #000000;
    --af-text-color-secondary: #5d5d5d;
    --af-text-color-tertiary: #2f2f2f;
    --af-text-color-hover-action: #4A4A4A;
    --af-text-color-disabled: #555;
    --af-text-color-placeholder: #757575;
    --af-text-color-info-bg: #ffffff;

    --af-color-valid: #1D7732;
    --af-color-warning: #e5ac00;
    --af-color-error: #dc3545;
    --af-color-info: #2E5FAD;
}

/* Show enabled native buttons as clickable controls across the app. */
button:not(:disabled) {
    cursor: pointer;
}

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
  height: 31px;
  color: var(--af-text-color-secondary);
  background: var(--af-bg-color-primary);
}

#app-body {
  flex: 1;
  display: grid;
  overflow: hidden;
  grid-template-rows: minmax(0, 1fr) 27px;
}

#block-diagram {
  width: 100%;
  height: 100%;
  border-top: solid 1px var(--af-border-color-secondary);
  box-sizing: border-box;
}

#splash-menu {
  position: absolute;
}

#app-sidebar {
  width: 100%;
  height: 100%;
}

#app-footer-bar {
  color: var(--af-text-color-primary);
  width: 100%;
  height: 100%;
  border-top: solid 1px var(--af-border-color-secondary);
  background: var(--af-bg-color-primary);
}

.readonly #block-diagram {
  border-top: none;
}

/** === Frames === */

.frame {
  position: relative;
}

.frame.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.frame.bottom {
  grid-column: 1 / 3;
}

/** === Resize Handles === */

.resize-handle {
  position: absolute;
  display: block;
  background: var(--af-bg-color-hover-action);
  transition: 0.15s opacity;
  opacity: 0;
  z-index: 1;
}
.resize-handle:hover {
  transition-delay: 0.2s;
  opacity: 1;
}

.frame.right .resize-handle {
  top: 0px;
  left: -2px;
  width: 4px;
  height: 100%;
  cursor: e-resize;
}

</style>
