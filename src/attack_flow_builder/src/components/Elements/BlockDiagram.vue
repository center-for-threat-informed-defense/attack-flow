<template>
  <div class="block-diagram-element" :style="cursorStyle">
    <ContextMenu
      class="block-diagram-menu"
      v-if="menu.show"
      :style="menuStyle"
      :sections="menuOptions"
      @select="onItemSelect"
      @focusout="closeContextMenu"
    />
  </div>
</template>

<script lang="ts">
import * as App from "@/store/Commands/AppCommands";
import * as Page from "@/store/Commands/PageCommands";
import * as Store from "@/store/StoreTypes";
// Dependencies
import { CommandEmitter } from "@/store/Commands/Command";
import { defineComponent, inject, markRaw } from 'vue';
import { mapGetters, mapMutations, mapState } from "vuex";
import {
  ContextMenuSection
} from "@/assets/scripts/ContextMenuTypes";
import { 
  BlockDiagram,CameraLocation,Cursor,
  CursorCssName,
  DiagramAnchorableModel,
  DiagramAnchorModel,
  DiagramLineModel,
  DiagramObjectModel,
  MouseClick,
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
      },
      view: { 
        x: 0, y: 0, k: 1,
        w: 0, h: 0
      }
    }
  },
  computed: {

    /**
     * Application Store data
     */
    ...mapState("ApplicationStore", {
      ctx(state: Store.ApplicationStore): Store.ApplicationStore {
        return state;
      },
      editor(state: Store.ApplicationStore): Store.PageEditor {
        return state.activePage;
      },
      camera(state: Store.ApplicationStore): CameraLocation {
        return state.activePage.location.value;
      },
      pageUpdate(state: Store.ApplicationStore): number {
        return state.activePage.trigger.value;
      },
      displayGrid(state: Store.ApplicationStore): boolean {
        return state.settings.view.diagram.display_grid;
      },
      displayShadows(state: Store.ApplicationStore): boolean {
        return state.settings.view.diagram.display_shadows;
      },
      displayDebugMode(state: Store.ApplicationStore): boolean {
        return state.settings.view.diagram.display_debug_mode;
      },
      renderHighQuality(state: Store.ApplicationStore): boolean {
        return state.settings.view.diagram.render_high_quality;
      },
      disableShadowsAt(state: Store.ApplicationStore): number {
        return state.settings.view.diagram.disable_shadows_at;
      },
      multiselectHotkey(state: Store.ApplicationStore): string {
        return state.settings.hotkeys.select.many;
      }
    }),

    ...mapGetters("ApplicationStore", ["hasSelection"]),

    /**
     * Context Menu Store data
     */
    ...mapGetters("ContextMenuStore", [
      "deleteMenu",
      "clipboardMenu",
      "duplicateMenu",
      "layeringMenu",
      "jumpMenu",
      "undoRedoMenu",
      "createAtMenu",
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
          this.createAtMenu,
          this.selectAllMenu,
          this.zoomMenu,
          this.diagramViewMenu
        ];
      }
    }

  },
  methods: {

    /**
     * Application Store mutations
     */
    ...mapMutations("ApplicationStore", ["execute"]),

    /**
     * Menu item selection behavior.
     * @param emitter
     *  Menu item's command emitter.
     */
    async onItemSelect(emitter: CommandEmitter) {
      try {
        let cmd = emitter();
        if(cmd instanceof Promise) {
          this.execute(await cmd);
        } else {
          this.execute(cmd);
        }
      } catch(ex: any) {
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
    onObjectHover(o: DiagramObjectModel | undefined, c: number) {
      this.cursor = c;
      this.execute(new Page.UnhoverDescendants(this.editor.page));
      if(o) {
        this.execute(new Page.HoverObject(o));
      }
    },

    /**
     * Object click behavior.
     * @param e
     *  The click event.
     * @param o
     *  The clicked object.
     * @param x
     *  The clicked x-coordinate, relative to the container.
     * @param y
     *  The clicked y-coordinate, relative to the container.
     */
    onObjectClick(e: PointerEvent, o: DiagramObjectModel, x: number, y: number) {
      // Unselect items, if needed
      let isMultiselect = this.isHotkeyActive(this.multiselectHotkey);
      if(!isMultiselect && !o.isSelected()) {
        this.execute(new Page.UnselectDescendants(this.editor.page));
      }
      // Select item
      this.execute(new Page.SelectObject(o));
      // Open context menu, if needed
      if (e.button === MouseClick.Right) {
        this.openContextMenu(x, y);
      }
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
      this.execute(new Page.UnselectDescendants(this.editor.page));
      this.execute(new App.SetEditorPointerLocation(this.ctx, x, y));
      if (e.button === MouseClick.Right) {
        this.openContextMenu(x, y);
      }
    },
    
    /**
     * Object move behavior.
     * @param o
     *  The moved objects.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    onObjectMove(o: DiagramObjectModel[], dx: number, dy:number) {
      let cmd = new Page.GroupCommand();
      for(let obj of o) {
        if(!obj.hasUserSetPosition()) {
            cmd.add(new Page.UserSetObjectPosition(obj));
        }
        cmd.add(new Page.MoveObjectBy(obj, dx, dy));
      }
      this.execute(cmd);
    },

    /**
     * Object attach behavior.
     * @param o
     *  The object.
     * @param a
     *  The object's anchor.
     */
    onObjectAttach(o: DiagramAnchorableModel, a: DiagramAnchorModel) {
      let { xMid, yMid } = a.boundingBox;
      let cmd = new Page.GroupCommand();
      if(o.isAttached()) {
        cmd.add(new Page.DetachObject(o));  
      }
      cmd.add(new Page.MoveObjectTo(o, xMid, yMid));
      cmd.add(new Page.AttachObject(a, o));
      this.execute(cmd);
    },

    /**
     * Object detach behavior.
     * @param o
     *  The object to detach.
     * @param dx
     *  The change in x.
     * @param dy
     *  The change in y.
     */
    onObjectDetach(o: DiagramAnchorableModel, dx: number, dy: number) {
      let cmd = new Page.GroupCommand();
      cmd.add(new Page.DetachObject(o));
      cmd.add(new Page.MoveObjectBy(o, dx, dy));
      this.execute(cmd);
    },

    /**
     * Line create behavior.
     * @param o
     *  The line object.
     * @param p
     *  The parent object.
     * @param s
     *  The line source's anchor.
     * @param t
     *  The line target's anchor. `undefined` if there wasn't one.
     */
    onLineCreate(
      o: DiagramLineModel,
      p: DiagramObjectModel,
      s: DiagramAnchorModel,
      t?: DiagramAnchorModel
    ) {
      this.execute(new Page.AddLineObject(o, p, s, t));
      this.execute(new Page.UnselectDescendants(this.editor.page));
      this.execute(new Page.SelectObject(o));
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
      this.view = { x, y, k, w, h };
      this.execute(
        new App.SetEditorViewParams(
          this.ctx, { ...this.view }
        )
      );
    }

  },
  watch: {
    // On page change
    editor() {
      // Set page
      this.diagram.setPage(markRaw(this.editor.page));
      // Update view
      this.diagram.updateView();
      this.diagram.setCameraLocation(this.camera, 0);
      // Configure view parameters
      this.execute(
        new App.SetEditorViewParams(
          this.ctx, { ...this.view }
        )
      );
    },
    // On camera update
    camera() {
      this.diagram.setCameraLocation(this.camera);
    },
    // On page update
    pageUpdate() {
      this.diagram.updateView();
      this.diagram.render();
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
    this.diagram.on("object-hover", this.onObjectHover);
    this.diagram.on("object-click", this.onObjectClick);
    this.diagram.on("canvas-click", this.onCanvasClick);
    this.diagram.on("object-move", this.onObjectMove);
    this.diagram.on("object-attach", this.onObjectAttach);
    this.diagram.on("object-detach", this.onObjectDetach);
    this.diagram.on("view-transform", this.onViewTransform);
    this.diagram.on("line-create", this.onLineCreate);

    // Configure the current page
    this.diagram.setGridDisplay(this.displayGrid);
    this.diagram.setShadowsDisplay(this.displayShadows);
    this.diagram.setDebugDisplay(this.displayDebugMode);
    this.diagram.setSsaaScale(this.renderHighQuality ? 2 : 1);
    this.diagram.setShadowsDisableAt(this.disableShadowsAt);
    this.diagram.setPage(markRaw(this.editor.page));
    
    // Inject the diagram
    this.diagram.inject(this.$el);
    this.diagram.updateView();
    this.diagram.setCameraLocation(this.camera, 0);

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
