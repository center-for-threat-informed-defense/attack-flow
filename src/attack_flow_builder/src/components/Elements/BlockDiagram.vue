<template>
  <div
    class="block-diagram-element"
    :style="cursorStyle"
  >
    <ContextMenu
      class="block-diagram-menu"
      v-if="menu.show"
      :style="menuStyle"
      :sections="menuOptions"
      @select="onItemSelect"
      @focusout="closeContextMenu"
    />
    <div class="inset-shadow"></div>
  </div>
</template>

<script lang="ts">
import * as EditorCommands from "@OpenChart/DiagramEditor/Commands";
// Dependencies
import { defineComponent, inject, markRaw } from 'vue';
import { useApplicationStore } from "@/stores/ApplicationStore";
import { useContextMenuStore } from "@/stores/ContextMenuStore";
// Components
import ContextMenu from "@/components/Controls/ContextMenu.vue";
import { Cursor, MouseClick } from "@OpenChart/DiagramInterface";
import { EditorCommand, type DiagramViewEditor } from '@/assets/scripts/OpenChart/DiagramEditor';
import type { DiagramObjectView } from "@OpenChart/DiagramView";
import type { ContextMenuSection } from '@/assets/scripts/Browser';
import type { Command, CommandEmitter } from '@/assets/scripts/Application';

export default defineComponent({
  name: 'BlockDiagram',
  setup() {
    return {
      isHotkeyActive: inject("isHotkeyActive") as
        (sequence: string, strict?: boolean) => boolean
    }
  },
  data() {
    return {
      application: useApplicationStore(),
      contextMenus: useContextMenuStore(),
      cursor: Cursor.Default,
      menu: {
        x: 0,
        y: 0,
        show: false,
      },
      view: {
        x: 0, y: 0, k: 1,
        w: 0, h: 0
      }
    }
  },
  computed: {

    /**
     * The active editor.
     */
    editor(): DiagramViewEditor {
      return this.application.activeEditor;
    },

    /**
     * The context menu's style.
     * @returns
     *  The context menu's style.
     */
    menuStyle(): { top: string; left: string } {
      return {
        top: `${this.menu.y}px`,
        left: `${this.menu.x}px`,
      };
    },

    /**
     * The current cursor style.
     * @returns
     *  The current cursor style.
     */
    cursorStyle(): { cursor: string } {
      return { cursor: this.cursor };
    },

    /**
     * Returns the context menu options.
     * @returns
     *  The context menu options.
     */
    menuOptions(): ContextMenuSection<CommandEmitter>[] {
      if(this.application.hasSelection) {
        return [
          // this.contextMenus.deleteMenu,
          // this.contextMenus.clipboardMenu,
          // this.contextMenus.duplicateMenu,
          // this.contextMenus.layeringMenu,
          // this.contextMenus.jumpMenu
        ];
      } else {
        return [
          this.contextMenus.undoRedoMenu,
          this.contextMenus.createAtMenu,
          // this.contextMenus.selectAllMenu,
          // this.contextMenus.unselectAllMenu,
          // this.contextMenus.zoomMenu,
          // this.contextMenus.diagramViewMenu
        ];
      }
    }

  },
  methods: {

    /**
     * Executes an application command.
     * @param command
     *  The command to execute.
     */
    execute(command: Command) {
      this.application.execute(command);
    },

    /**
     * Menu item selection behavior.
     * @param emitter
     *  Menu item's command emitter.
     */
    async onItemSelect(emitter: CommandEmitter) {
      try {
        const cmd = emitter();
        if(cmd instanceof Promise) {
          this.execute(await cmd);
        } else {
          this.execute(cmd);
        }
      } catch(ex: unknown) {
        console.error(ex);
      }
    },

    /**
     * Opens the context menu.
     * @param x
     *  The menu's x coordinate (relative to the container).
     * @param y
     *  The menu's y coordinate (relative to the container).
     */
    openContextMenu(x: number, y: number) {
      // Allow unfocus event to run first (if context
      // menu is already present) then show context menu.
      requestAnimationFrame(() => {
        this.menu.show = true;
        this.menu.x = x;
        this.menu.y = y;
      })
    },

    /**
     * Closes the context menu.
     */
    closeContextMenu() {
      this.menu.show = false;
    },


    /**
     * Object hover behavior.
     * @param o
     *  The hovered object. `undefined` if nothing is hovered.
     * @param c
     *  The cursor to use.
     */
    onCursorChange(cursor: Cursor) {
      this.cursor = cursor;
    },


    /**
     * Canvas click behavior.
     * @param e
     *  The click event.
     * @param x
     *  The clicked x-coordinate, relative to the container.
     * @param y
     *  The clicked y-coordinate, relative to the container.
     */
    onCanvasClick(e: PointerEvent, x: number, y: number) {
      if (e.button === MouseClick.Right) {
        this.openContextMenu(x, y);
      }
    },
    
    /**
     * Object interaction behavior.
     * @param command
     *  The interaction command.
     */
    onObjectInteraction(command: EditorCommand) {
      this.execute(command);
    },

    /**
     * View transform behavior.
     * @param x
     *  The view's left x-coordinate.
     * @param y
     *  The view's top y-coordinate.
     * @param k
     *  The view's scale.
     * @param w
     *  The view's width.
     * @param h
     *  The view's height.
     */
    onViewTransform(x: number, y: number, k: number, w: number, h: number) {
      // this.view = { x, y, k, w, h };
      // this.execute(
      //   new App.SetEditorViewParams(
      //     this.application, { ...this.view }
      //   )
      // );
    },

    configureEditor() {
      const ui = this.editor.interface;
      ui.mount(this.$el);
      ui.render();
      // Subscribe to diagram events
      ui.on("cursor-change", this.onCursorChange);
      // this.diagram.on("object-click", this.onObjectClick);
      ui.on("canvas-click", this.onCanvasClick);
      ui.on("plugin-command", this.onObjectInteraction);
    }

  },
  watch: {
    // On page change
    editor(next: DiagramViewEditor, prev: DiagramViewEditor) {
      prev.interface.unmount();
      this.configureEditor();

      // // Set page
      // this.diagram.setPage(markRaw(this.editor.page));
      // // Update view
      // this.diagram.updateView();
      // this.diagram.setCameraLocation(this.camera, 0);
      // // Configure view parameters
      // this.execute(
      //   new App.SetEditorViewParams(
      //     this.application, { ...this.view }
      //   )
      // );
    },
    // On camera update
    camera() {
      // this.editor.interface.setCameraLocation(this.camera);
      // this.diagram.setCameraLocation(this.camera);
    },
    // On page update
    pageUpdate() {
      // this.diagram.updateView();
      // this.diagram.render();
    },
    // On display grid change
    displayGrid() {
      // this.diagram.setGridDisplay(this.displayGrid);
      // this.diagram.render();
    },
    // On display shadows change
    displayShadows() {
      // this.diagram.setShadowsDisplay(this.displayShadows);
      // this.diagram.render();
    },
    // On display debug change
    displayDebugMode() {
      // this.diagram.setDebugDisplay(this.displayDebugMode);
      // this.diagram.render();
    },
    // On render quality change
    renderHighQuality() {
      // this.diagram.setSsaaScale(this.renderHighQuality ? 2 : 1);
      // this.diagram.render();
    },
    // On 'disable shadows at' change
    disableShadowsAt() {
      // this.diagram.setShadowsDisableAt(this.disableShadowsAt);
      // this.diagram.render();
    }
  },
  mounted() {
    this.configureEditor();
    // this.diagram.on("object-attach", this.onObjectAttach);
    // this.diagram.on("object-detach", this.onObjectDetach);
    // this.diagram.on("view-transform", this.onViewTransform);
    // this.diagram.on("line-create", this.onLineCreate);

    // Configure the current page
    // this.diagram.setGridDisplay(this.displayGrid);
    // this.diagram.setShadowsDisplay(this.displayShadows);
    // this.diagram.setDebugDisplay(this.displayDebugMode);
    // this.diagram.setSsaaScale(this.renderHighQuality ? 2 : 1);
    // this.diagram.setShadowsDisableAt(this.disableShadowsAt);
    // this.diagram.setPage(markRaw(this.editor.page));
    
    // Inject the diagram
    // this.diagram.inject(this.$el);
    // this.diagram.updateView();
    // this.diagram.setCameraLocation(this.camera, 0);

  },
  unmounted() {
    this.editor.interface.unmount();
  },
  components: { ContextMenu }
});
</script>

<style scoped>

/** === Main Element === */

.block-diagram-element {
  position: relative;
}

.block-diagram-menu {
  position: absolute;
  cursor: default;
}

.inset-shadow {
  position: absolute;
  width: 100%;
  height: 100%;
  box-shadow: inset 0px 0px 9px 0px rgb(0 0 0 / 35%);
  pointer-events: none;
}

</style>
