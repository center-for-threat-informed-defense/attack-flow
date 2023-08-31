<template>
  <AppHotkeyBox id="main">
    <AppTitleBar id="app-title-bar"/>
    <FindDialog ref="findDialog" id="find-dialog" :style="findDialogLayout" />
    <div id="app-body" ref="body" :style="gridLayout">
      <div class="frame center">
        <BlockDiagram id="block-diagram"/>
        <SplashMenu id="splash-menu" v-if="isShowingSplash" />
      </div>
      <div class="frame right">
        <div class="resize-handle" @pointerdown="startResize($event, Handle.Right)"></div>
        <EditorSidebar id="app-sidebar"/>
      </div>
      <div class="frame bottom">
        <AppFooterBar id="app-footer-bar"/>
      </div>
    </div>
  </AppHotkeyBox>
</template>

<script lang="ts">
import * as App from './store/Commands/AppCommands';
import * as Store from "@/store/StoreTypes";
import Configuration from "@/assets/configuration/builder.config"
// Dependencies
import { clamp } from "./assets/scripts/BlockDiagram";
import { PointerTracker } from "./assets/scripts/PointerTracker";
import { Browser, OperatingSystem } from "./assets/scripts/Browser";
import { defineComponent, markRaw, ref } from 'vue';
import { mapMutations, mapGetters, mapState } from 'vuex';
// Components
import FindDialog from "@/components/Elements/FindDialog.vue";
import SplashMenu from "@/components/Elements/SplashMenu.vue";
import AppTitleBar from "@/components/Elements/AppTitleBar.vue";
import AppHotkeyBox from "@/components/Elements/AppHotkeyBox.vue";
import BlockDiagram from "@/components/Elements/BlockDiagram.vue";
import AppFooterBar from "@/components/Elements/AppFooterBar.vue";
import EditorSidebar from "@/components/Elements/EditorSidebar.vue";

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
      Handle,
      bodyWidth: -1,
      bodyHeight: -1,
      frameSize: {
        [Handle.Right]: 355
      },
      minFrameSize: {
        [Handle.Right]: 310
      },
      drag: {
        handle: Handle.None,
        track: markRaw(new PointerTracker())
      },
      onResizeObserver: null as ResizeObserver | null
    }
  },
  computed: {

    /**
     * Application Store data
     */
    ...mapState("ApplicationStore", {
      context(state: Store.ApplicationStore): Store.ApplicationStore {
        return state;
      }
    }),

    /**
     * Application Store getters
     */
    ...mapGetters("ApplicationStore", ["isShowingSplash"]),

    /**
     * Returns the current grid layout.
     * @returns
     *  The current grid layout.
     */
    gridLayout(): { gridTemplateColumns: string } {
      let r = this.frameSize[Handle.Right];
      return {
        gridTemplateColumns: `minmax(0, 1fr) ${ r }px`
      }
    },

    /**
     * Compute the location of the find dialog
     * @returns
     *  The current grid layout.
     */
    findDialogLayout(): { right: string } {
      let r = this.frameSize[Handle.Right] + 25;
      return {
        right: `${r}px`
      }
    }

  },
  methods: {
    
    /**
     * Application Store mutations
     */
    ...mapMutations("ApplicationStore", ["execute"]),

    /**
     * Resize handle drag start behavior.
     * @param event
     *  The pointer event.
     * @param handle
     *  The id of the handle being dragged.
     */
    startResize(event: PointerEvent, handle: number) {
      let origin = this.frameSize[handle];
      this.drag.handle = handle;
      this.drag.track.capture(event, (e, track) => {
        e.preventDefault();
        this.onResize(origin, track);
      });
      document.addEventListener("pointerup", this.stopResize, { once: true });
    },

    /**
     * Resize handle drag behavior.
     * @param origin
     *  The frame's origin.
     * @param track
     *  The mouse tracker.
     */
    onResize(origin: number, track: PointerTracker) {
      switch (this.drag.handle) {
        default:
        case Handle.None:
          break;
        case Handle.Right:
          this.setRightFrameSize(origin - track.deltaX);
          break;
      }
    },

    /**
     * Resize handle drag stop behavior.
     * @param event
     *  The pointer event.
     */
    stopResize(event: PointerEvent) {
      this.drag.handle = Handle.None;
      this.drag.track.release(event);
    },

    /**
     * Sets the size of the right frame.
     * @param size
     *  The new size of the right frame.
     */
    setRightFrameSize(size: number) {
      let max = this.bodyWidth;
      let min = this.minFrameSize[Handle.Right];
      this.frameSize[Handle.Right] = clamp(size, min, max);
    }

  },
  async created() {
    // Import settings
    let os = Browser.getOperatingSystemClass();
    let settings;
    if(Configuration.is_web_hosted) {
      if(os === OperatingSystem.MacOS) {
        settings = await (await fetch("../public/settings_macos.json")).json();
      } else {
        settings = await (await fetch("../public/settings_win.json")).json();
      }        
    } else {
      if(os === OperatingSystem.MacOS) {
        settings = require("../public/settings_macos.json");
      } else {
        settings = require("../public/settings_win.json");
      }
    }
    // Load settings
    this.execute(new App.LoadSettings(this.context, settings));
    // Load empty file
    this.execute(await App.LoadFile.fromNew(this.context));
    // Load file from query parameters, if possible
    let params = new URLSearchParams(window.location.search);
    let src = params.get("src");
    if(src) {
      try {
        // TODO: Incorporate loading dialog
        this.execute(await App.PrepareEditorWithFile.fromUrl(this.context, src));
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
    SplashMenu
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
  color: #9e9e9e;
  background: #262626;
}

#app-body {
  flex: 1;
  display: grid;
  overflow: hidden;
  grid-template-rows: minmax(0, 1fr) 29px;
}

#block-diagram { 
  width: 100%;
  height: 100%;
  border-top: solid 1px #333333;
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
  color: #bfbfbf;
  width: 100%;
  height: 100%;
  border-top: solid 1px #333333;
  background: #262626;
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
  background: #726de2;
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
