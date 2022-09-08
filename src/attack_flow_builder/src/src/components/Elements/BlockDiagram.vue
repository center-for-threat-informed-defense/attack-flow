<template>
  <div class="block-diagram-element" :style="cursorStyle">
    <ContextMenu
      class="block-diagram-menu"
      v-if="menu.show"
      :style="menuStyle"
      :sections="menuOptions"
      @select="onItemSelect"
      @unfocus="closeContextMenu"
    />
  </div>
</template>

<script lang="ts">
import * as Store from "@/store/StoreTypes";
// Dependencies
import { defineComponent, inject, markRaw } from 'vue';
import { mapActions, mapGetters, mapState } from "vuex";
import { ContextMenuSection } from "@/assets/scripts/ContextMenuTypes";
import { 
  BlockDiagram,Cursor, CursorCssName,
  DiagramObjectModel, MouseClick, PageModel
} from "@/assets/scripts/BlockDiagram";
// Components
import ContextMenu from "@/components/Controls/ContextMenu.vue";

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
      cursor: Cursor.Default,
      diagram: markRaw(new BlockDiagram()),
      menu: {
        x: 0,
        y: 0,
        show: false,
      }
    }
  },
  computed: {

    /**
     * Active Page Store data
     */
    ...mapState("ActivePageStore", {
      page(state: Store.ActivePageStore): PageModel {
        return state.page.ref;
      },
      hovers(state: Store.ActivePageStore): DiagramObjectModel[] {
        return state.hovers;
      },
      selects(state: Store.ActivePageStore): number {
        return state.selects.trigger;
      },
      pageUpdate(state: Store.ActivePageStore): number {
        return state.page.trigger;
      }
    }),

    ...mapGetters("ActivePageStore", ["hasSelection"]),
    
    /**
     * App Settings Store data
     */
    ...mapState("AppSettingsStore", {
      displayGrid(state: Store.AppSettingsStore): boolean {
        return state.settings.view.diagram.display_grid;
      },
      displayShadows(state: Store.AppSettingsStore): boolean {
        return state.settings.view.diagram.display_shadows;
      },
      displayDebugMode(state: Store.AppSettingsStore): boolean {
        return state.settings.view.diagram.display_debug_mode;
      },
      renderHighQuality(state: Store.AppSettingsStore): boolean {
        return state.settings.view.diagram.render_high_quality;
      },
      disableShadowsAt(state: Store.AppSettingsStore): number {
        return state.settings.view.diagram.disable_shadows_at;
      },
      multiselectHotkey(state: Store.AppSettingsStore): string {
        return state.settings.hotkeys.select.many;
      }
    }),

    /**
     * Context Menu Store data
     */
    ...mapGetters("ContextMenuStore", [
      "deleteMenu",
      "clipboardMenu",
      "duplicateMenu",
      "layeringMenu",
      "jumpMenu",
      "createMenu",
      "undoRedoMenu",
      "selectAllMenu",
      "zoomMenu",
      "diagramViewMenu"
    ]),

    /**
     * Returns the current cursor style.
     * @returns
     *  The current cursor style.
     */
    cursorStyle(): { cursor: string } {
      return { cursor: CursorCssName[this.cursor] }
    },

    /**
     * Returns the context menu's style.
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
     * Returns the context menu options.
     * @returns
     *  The context menu options.
     */
    menuOptions(): ContextMenuSection[] {
      if(this.hasSelection) {
        return [
          this.deleteMenu,
          this.clipboardMenu,
          this.duplicateMenu,
          this.layeringMenu,
          this.jumpMenu
        ];
      } else {
        return [
          this.undoRedoMenu,
          this.createMenu,
          this.selectAllMenu,
          this.zoomMenu,
          this.diagramViewMenu
        ];
      }
    }

  },
  methods: {

    /**
     * Active Page Store actions
     */
    ...mapActions("ActivePageStore", [
      "select", "unselectAll", "attach", "detach", "hover",
      "unhoverAll", "moveBy", "addLineObject", "moveCameraTo",
      "setViewTransform"
    ]),

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
    onItemSelect(id: string, data: any) {
      try {
        if(id === "create_object") {
          this.executeAppAction({ 
            id, data: { ...data, x: this.menu.x, y: this.menu.y }
          });
        } else {
          this.executeAppAction({ 
            id, data
          });
        }
      } catch(ex) {
        console.error(ex);
      }
      this.closeContextMenu();
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

  },
  watch: {
    // On page change
    page() {
      this.diagram.setPage(markRaw(this.page));
      this.diagram.updateView(0);
    },
    // On hover change
    hovers() {
      this.diagram.render();
    },
    // On select change
    selects() {
      this.diagram.render();
    },
    // On page update
    pageUpdate() {
      this.diagram.updateView();
    },
    // On display grid change
    displayGrid() {
      this.diagram.setGridDisplay(this.displayGrid);
      this.diagram.render();
    },
    // On display shadows change
    displayShadows() {
      this.diagram.setShadowsDisplay(this.displayShadows);
      this.diagram.render();
    },
    // On display debug change
    displayDebugMode() {
      this.diagram.setDebugDisplay(this.displayDebugMode);
      this.diagram.render();
    },
    // On render quality change
    renderHighQuality() {
      this.diagram.setSsaaScale(this.renderHighQuality ? 2 : 1);
      this.diagram.render();
    },
    // On 'disable shadows at' change
    disableShadowsAt() {
      this.diagram.setShadowsDisableAt(this.disableShadowsAt);
      this.diagram.render();
    }
  },
  mounted() {
    
    // Subscribe to diagram events
    this.diagram.on("object-hover", (obj, cursor) => {
      this.cursor = cursor;
      if(obj) {
        this.hover(obj.id);
      } else {
        this.unhoverAll();
      }
    });
    this.diagram.on("object-click", (evt, obj, x, y) => {
      // Unselect last item, if needed
      if(
        !this.isHotkeyActive(this.multiselectHotkey) &&
        !obj.isSelected()
      ) {
        this.unselectAll();
      }
      // Select item
      this.select(obj.id);
      // Open context menu, if needed
      if (evt.button === MouseClick.Right) {
        this.openContextMenu(x, y);
      }
    });
    this.diagram.on("canvas-click", (evt, x, y) => {
      this.unselectAll();
      if (evt.button === MouseClick.Right) {
        this.openContextMenu(x, y);
      }
    });
    this.diagram.on("canvas-transform", (x, y, k) => {
        this.setViewTransform({ x, y, k });
    });
    this.diagram.on("object-move", (objs, dx, dy) => {
      this.moveBy({ objects: objs.map(o => o.id), dx, dy });
    });
    this.diagram.on("object-attach", (object, anchor) => {
      this.attach({ object: object.id, anchor: anchor.id });
    });
    this.diagram.on("object-detach", (obj, dx, dy) => {
      this.detach({ object: obj.id, dx, dy });
    });
    this.diagram.on("line-create", (obj, par, src, trg) => {
      this.addLineObject({
        object: obj,
        source: src.id,
        target: trg?.id,
        parent: par.id
      });
      this.unselectAll();
      this.select(obj.id);
    });
    this.diagram.on("camera-move", (location) => {
      this.moveCameraTo(location);
    });

    // Configure the current page
    this.diagram.setGridDisplay(this.displayGrid);
    this.diagram.setShadowsDisplay(this.displayShadows);
    this.diagram.setDebugDisplay(this.displayDebugMode);
    this.diagram.setSsaaScale(this.renderHighQuality ? 2 : 1);
    this.diagram.setShadowsDisableAt(this.disableShadowsAt);
    this.diagram.setPage(markRaw(this.page));
    
    // Inject the diagram
    this.diagram.inject(this.$el);

  },
  unmounted() {
    this.diagram.destroy();
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

</style>
