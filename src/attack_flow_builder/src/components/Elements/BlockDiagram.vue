<template>
  <div
    class="block-diagram-element"
    :style="cursorStyle"
  >
    <ObjectRecommenderMenu
      class="recommender-menu"
      v-if="recommender.active"
      :style="recommenderMenuStyle"
      :recommender="recommender"
    />
    <ContextMenu
      class="context-menu"
      v-if="menu.show"
      :style="contextMenuStyle"
      :sections="menuOptions"
      @select="onItemSelect"
      @focusout="closeContextMenu"
    />
    <div class="inset-shadow" />
  </div>
</template>

<script lang="ts">
import * as AppCommands from "@/assets/scripts/Application/Commands";
// Dependencies
import { defineComponent } from 'vue';
import { Cursor, MouseClick } from "@OpenChart/DiagramInterface";
import { useApplicationStore } from "@/stores/ApplicationStore";
import { useContextMenuStore } from "@/stores/ContextMenuStore";
import type { DiagramObjectView } from '@/assets/scripts/OpenChart/DiagramView';
import type { ContextMenuSection } from '@/assets/scripts/Browser';
import type { Command, CommandEmitter } from '@/assets/scripts/Application';
import type { DiagramViewEditor, ObjectRecommender } from '@OpenChart/DiagramEditor';
// Components
import ContextMenu from "@/components/Controls/ContextMenu.vue";
import ObjectRecommenderMenu from "@/components/Controls/ObjectRecommenderMenu.vue";

export default defineComponent({
  name: 'BlockDiagram',
  data() {
    return {
      application: useApplicationStore(),
      contextMenus: useContextMenuStore(),
      cursor: Cursor.Default,
      menu: {
        x: 0,
        y: 0,
        show: false,
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
     * The active object recommender.
     */
    recommender(): ObjectRecommender {
      return this.application.activeRecommender;
    },

    /**
     * The recommender menu's style.
     * @returns
     *  The recommender menu's style.
     */
    recommenderMenuStyle(): { top: string, left: string } {
      return {
        top: `${this.recommender.y - 12}px`,
        left: `${this.recommender.x + 15}px`,
      };
    },

    /**
     * The context menu's style.
     * @returns
     *  The context menu's style.
     */
    contextMenuStyle(): { top: string; left: string } {
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
          this.contextMenus.deleteMenu,
          // this.contextMenus.clipboardMenu,
          // this.contextMenus.duplicateMenu,
          // this.contextMenus.jumpMenu
        ];
      } else {
        return [
          this.contextMenus.undoRedoMenu,
          this.contextMenus.createAtMenu,
          this.contextMenus.selectAllMenu,
          this.contextMenus.unselectAllMenu,
          this.contextMenus.zoomMenu,
          this.contextMenus.diagramViewMenu
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
      // Close recommender
      if(this.recommender.active) {
        this.execute(AppCommands.stopRecommender(this.application));
      }
      // Open context menu
      if (e.button === MouseClick.Right) {
        this.openContextMenu(x, y);
      }
    },

    /**
     * Suggestions request behavior.
     * @param object
     *  The recommender's active target.
     */
    onSuggestionRequest(object: DiagramObjectView) {
      this.execute(AppCommands.startRecommender(this.application, object));
    }, 

    configureEditor() {
      const ui = this.editor.interface;
      // Mount
      ui.mount(this.$el);
      // Subscribe to diagram events
      ui.on("canvas-click", this.onCanvasClick, this);
      ui.on("cursor-change", this.onCursorChange, this);
      ui.on("suggestion-request", this.onSuggestionRequest, this);
      // Render
      ui.render();
      // this.diagram.setCameraLocation(this.camera, 0);
    }

  },
  watch: {
    // On editor change
    editor(_: DiagramViewEditor, prev: DiagramViewEditor) {
      prev.interface.unmount();
      this.configureEditor();
    },
  },
  mounted() {
    this.configureEditor();
  },
  unmounted() {
    const ui = this.editor.interface;
    ui.removeEventListenersWithContext(this);
    ui.unmount();
  },
  components: { ContextMenu, ObjectRecommenderMenu }
});
</script>

<style scoped>

/** === Main Element === */

.block-diagram-element {
  position: relative;
}

.context-menu {
  position: absolute;
  cursor: default;
}

.recommender-menu {
  position: absolute;
  width: 350px;
}

.inset-shadow {
  position: absolute;
  width: 100%;
  height: 100%;
  box-shadow: inset 0px 0px 9px 0px rgb(0 0 0 / 35%);
  pointer-events: none;
}

</style>
