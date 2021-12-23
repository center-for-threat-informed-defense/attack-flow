<template>
  <div class="attack-flow-canvas-container">
    <div class="attack-flow-canvas-context" @wheel.passive="onCanvasMouseWheel" @contextmenu="$event.preventDefault()" ref="context">
      <div @pointerdown="contextMenu">
        <div class="attack-flow-canvas-panel" :style="canvasSize" @pointerdown="startCanvasDrag" ref="panel"></div>
        <svg class="edges" :style="canvasSize">
          <AttackFlowEdge 
            v-for="[id, edge] of edges" :key="id" 
            :source="edge.source" 
            :target="edge.target" 
            :color="selected.has(id) ? '#e6d845' : getEdgeColor(edge.type)"
            :arrow="getEdgeArrow(edge.type)"
            :dash="getEdgeDash(edge.type)"
            @pointerdown="fullSelectItem($event, id)"
          />
          <AttackFlowEdge 
            :source="startLink.source" 
            :target="startLink.target ?? startLink.cursor" 
            :color="startLink.color"
            :arrow="startLink.arrow"
            :dash="startLink.dash"
          />
        </svg>
        <div class="nodes" ref="nodes">
          <div
            v-for="[id, node] of nodes" :key="id" :id="id"
            :class="['attack-flow-node-wrapper', selected.get(id)]"
            :style="{ top: `${ node.y0 }px`, left: `${ node.x0 }px` }"
          >
            <AttackFlowNode
              class="attack-flow-node"
              :id="node.id"
              @pointerdown="fullSelectItem($event, node.id)"
              @dragStart="evt => startNodeDrag(evt, node.id)"
              @linkStart="evt => startNodeLink(evt, node)"
              @mouseenter="nodeMouseEnter(node)"
              @mouseleave="nodeMouseLeave(node)"
            />
          </div>
        </div>
      </div>
      <div class="menus">
        <ContextMenu
          class="canvas-context-menu"
          :sections="coreContextMenu"
          :style="{ top:`${lastClick[1]}px`, left:`${lastClick[0]}px`}"
          @select="onContextMenuSelection"
          @unfocus="showCtxMenu = false"
          v-show="showCtxMenu"
        />
        <AttackFlowEdgeMenu
          class="attack-flow-edge-menu"
          v-if="Object.keys(focusedEdge?.payload ?? {}).length > 0" 
          :id="focusedEdge.id"
          :style="{ top:`${lastClick[1] + 5}px`, left:`${lastClick[0]}px` }"
        />
        <transition name="pop-in">
          <div 
            v-show="startLink.show" 
            :style="{ top:`${startLink.cursor.y0}px`, left:`${startLink.cursor.x0}px`}" 
            class="start-link-icon"
          ><PlugIcon/></div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapActions } from "vuex";
import * as Store from "@/store/StoreTypes";
import { titleCase } from "@/assets/String";
import AttackFlowEdgeMenu from "./AttackFlowEdgeMenu.vue";
import AttackFlowNode from "./AttackFlowNode.vue";
import AttackFlowEdge from "@/components/Vectors/AttackFlowEdge.vue";
import ContextMenu from "@/components/Controls/Menus/ContextMenu.vue";
import PlugIcon from "@/components/Vectors/PlugIcon.vue";

export default defineComponent({
  name: "AttackFlowCanvas",
  data() {
    return {
      selected: new Map(),
      canvasHeight : 0,
      canvasWidth  : 0,
      drag: { 
        target   : null as any,
        origin   : [0,0] as Array<number>,
        position : [0,0] as Array<number>,
      },
      startLink: {
        show   : false as boolean,
        source : null as Store.CanvasNode | null,
        target : null  as Store.CanvasNode | null,
        cursor : { x0: 0, x1: 0, y0: 0, y1: 0  } as Store.IBox,
        color  : "#4d4d4d",
        arrow  : true,
        dash   : false
      },
      lastClick: [0, 0] as Array<number>,
      showCtxMenu: false
    }
  },
  computed: {
    ...mapState({
      nodes(state: Store.ModuleStore): Map<string, Store.CanvasNode> {
        return state.SessionStore.session.nodes;
      },
      edges(state: Store.ModuleStore): Map<string, Store.CanvasEdge> {
        return state.SessionStore.session.edges;
      },
      schemas(state: Store.ModuleStore): Store.SchemaStore {
        return state.SchemaStore;
      },
      canvas(state: Store.ModuleStore): Store.CanvasMetadata {
        return state.SessionStore.session.canvas;
      },
      layoutTrigger(state: Store.ModuleStore): number {
        return state.SessionStore.layoutTrigger;
      }
    }),

    /**
     * Returns the current canvas size.
     */
    canvasSize(): Object {
      return {
        width  : `${ this.canvasWidth }px`,
        height : `${ this.canvasHeight }px`
      }
    },
    
    /**
     * Returns the current (context-dependant) context menu configuration.
     */
    coreContextMenu(): Array<Types.ContextMenuItem> {
      if(this.selected.size === 0) {
        return this.canvasContextMenu;
      } else {
        let options: Array<Types.ContextMenuItem> = [];
        let nLen = this.selectedNodes.length;
        let eLen = this.selectedEdges.length;
        // Delete option
        let nodeText = nLen === 0 ? '' : nLen === 1 ? "Node" : "Nodes";
        let edgeText = eLen === 0 ? '' : eLen === 1 ? "Edge" : "Edges";
        let text = nodeText && edgeText ? "Items" : `${ nodeText }${ edgeText }` 
        options.push({ id: "delete-item", text: `Delete ${ text }`, type: "action" });
        // Duplicate option
        if(nLen > 0) {
          let text = `Duplicate ${ nLen > 1 ? 'Sequence' : 'Node' }`
          options.push({ id: "duplicate-node", text, type: "action" })
        }
        return options;
      }
    },

    /**
     * Returns the current context menu configuration for the canvas.
     */
    canvasContextMenu(): Array<Types.ContextMenuItem> {
      let menu: Array<Types.ContextMenuItem> = [];
      for(let [type, _] of this.schemas.nodeSchemas) {
        menu.push(
            {
              id: `create-node#type::${ type }`, 
              text: `Create ${ titleCase(type) } Node`,
              type: "action"
            }
        )
      }
      return menu;
    },

    /**
     * Returns the currently focused edge. (If there is one.)
     */
    focusedEdge(): Store.CanvasEdge | null {
      if(this.selectedEdges.length === 1 && this.selectedNodes.length === 0) {
        return this.edges.get(this.selectedEdges[0])!;
      } else {
        return null;
      }
    },

    /**
     * Returns all nodes that are currently selected.
     */
    selectedNodes(): Array<string> {
      let nodes: Array<string> = [];
      for(let [id, select] of [...this.selected.entries()]) {
        if(/^[0-9]+$/.test(id) && select === "select-full")
          nodes.push(id);
      }
      return nodes;
    },

    /**
     * Returns all edges that are currently selected.
     */
    selectedEdges(): Array<string> {
      let edges: Array<string> = [];
      for(let [id, select] of [...this.selected.entries()]) {
        if(/^[0-9]+\.[0-9]+$/.test(id) && select === "select-full")
          edges.push(id);
      }
      return edges;
    }

  },
  methods: {
    
    ...mapActions([
      "offsetNode",
      "createNode",
      "createEdge",
      "deleteItems",
      "getEdgeType",
      "duplicateSequence",
      "setNodeLowerBound",
      "setCameraPosition",
      "recalculatePages"
    ]),   


    ///////////////////////////////////////////////////////////////////////////
    //  1. Canvas Click / Drag / Scroll  //////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Canvas drag start behavior.
     * @param event
     *  The pointer event.
     */
    startCanvasDrag(event: PointerEvent) {
      this.deselectItem();
      // Setup drag state
      this.drag.position = [this.$el.scrollLeft, this.$el.scrollTop];
      this.drag.origin = [event.x, event.y];
      this.drag.target = event.target;
      // Attach event callbacks
      this.drag.target!.onpointermove = this.onCanvasDrag;
      this.drag.target!.onpointerup = this.stopCanvasDrag;
      // Capture pointer
      this.drag.target!.setPointerCapture(event.pointerId);
    },

    /**
     * Canvas drag behavior.
     * @param event
     *  The pointer event.
     */
    onCanvasDrag(event: PointerEvent) {
      event.preventDefault();
      let deltaX = event.x - this.drag.origin[0];
      let deltaY = event.y - this.drag.origin[1];
      this.$el.scrollTop = this.drag.position[1] - deltaY;
      this.$el.scrollLeft = this.drag.position[0] - deltaX;
    },

    /**
     * Canvas drag stop behavior.
     * @param event
     *  The pointer event.
     */
    stopCanvasDrag(event: PointerEvent) {
      event.preventDefault()
      this.drag.target.onpointermove = null;
      this.drag.target.onpointerup = null;
      this.drag.target.releasePointerCapture(event.pointerId);
      this.setCameraPosition({
        x: this.$el.scrollLeft,
        y: this.$el.scrollTop
      })
    },

    /**
     * Canvas scroll behavior.
     * @param event
     *  The wheel event.
     */
    onCanvasMouseWheel(event: WheelEvent) {
      this.$el.scrollLeft += event.altKey ? event.deltaY : event.deltaX;
      this.$el.scrollTop += event.altKey ? event.deltaX : event.deltaY;
      this.setCameraPosition({
        x: this.$el.scrollLeft,
        y: this.$el.scrollTop
      })
    },


    ///////////////////////////////////////////////////////////////////////////
    //  2. Node Dragging  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Node drag start behavior.
     * @param event
     *  The pointer event.
     * @param id
     *  The id of the node being dragged.
     */
    startNodeDrag(event: PointerEvent, id: number) {
      event.preventDefault();
      // Setup drag state
      this.drag.origin = [event.x, event.y];
      this.drag.target = event.target;
      // Attach event callbacks
      this.drag.target!.onpointermove = 
        (evt: PointerEvent) => this.onNodeDrag(evt, id);
      this.drag.target!.onpointerup =
        (evt: PointerEvent) => this.stopNodeDrag(evt);
      // Capture pointer
      this.drag.target!.setPointerCapture(event.pointerId);
    },

    /**
     * Node drag behavior.
     * @param event
     *  The pointer event.
     * @param id
     *  The id of the node being dragged.
     */
    onNodeDrag(event: PointerEvent, id: number) {
      let deltaX = event.x - this.drag.origin[0];
      let deltaY = event.y - this.drag.origin[1];
      this.offsetNode({ id, x: deltaX, y: deltaY })
      this.drag.origin[0] = event.x;
      this.drag.origin[1] = event.y;
    },

    /**
     * Node drag stop behavior.
     * @param event
     *  The pointer event.
     * @param id
     *  The id of the node being dragged.
     */
    stopNodeDrag(event: PointerEvent) {
      event.preventDefault();
      this.drag.target.onpointermove = null;
      this.drag.target.onpointerup = null;
      this.drag.target.releasePointerCapture(event.pointerId);
      // Recalculate Pages
      this.recalculatePages();
      // Recalculate layout on the next tick
      this.$nextTick(() => {
        this.recalculateLayout();
      })
    },


    ///////////////////////////////////////////////////////////////////////////
    //  3. Node Linking  //////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Node start link behavior.
     * @param event
     *  The pointer event.
     * @param source
     *  The link's source node.
     */
    startNodeLink(event: PointerEvent, source: Store.CanvasNode) {
      event.preventDefault();
      // Select node
      this.fullSelectItem(event, source.id, true);
      // Setup drag state
      this.storeClickCoordinates(event);
      this.drag.origin = [event.x, event.y];
      this.startLink.show = true;
      this.startLink.source = source;
      this.startLink.cursor = { 
        x0: this.lastClick[0] - 18,
        y0: this.lastClick[1] - 13,
        x1: this.lastClick[0] + 18,
        y1: this.lastClick[1] + 13,
      }
      // Attach event callbacks
      let context = (this.$refs.context as any)
      context.onmousemove = 
        (evt: PointerEvent) => this.onNodeLinkDrag(evt);
      context.onmouseup =
        (evt: PointerEvent) => this.stopNodeLink(evt);
    },

    /**
     * Node link drag behavior.
     * @param event
     *  The pointer event.
     */
    onNodeLinkDrag(event: PointerEvent) {
      let deltaX = event.x - this.drag.origin[0];
      let deltaY = event.y - this.drag.origin[1];
      this.startLink.cursor.x0 += deltaX;
      this.startLink.cursor.y0 += deltaY;
      this.startLink.cursor.x1 += deltaX;
      this.startLink.cursor.y1 += deltaY;
      this.drag.origin[0] = event.x;
      this.drag.origin[1] = event.y;
    },

    /**
     * Node link end behavior.
     * @param event
     *  The pointer event.
     */
    stopNodeLink(event: PointerEvent) {
      event.preventDefault();
      // Clear event callbacks
      let context = (this.$refs.context as any)
      context.onmousemove = null;
      context.onmouseup = null;
      // Clear drag state
      this.startLink.show = false;
      // Create Link
      let source = this.startLink.source?.id;
      let target = this.startLink.target?.id;
      let isInvalidTarget = this.selected.get(target) === "select-invalid";
      if(target !== undefined && !isInvalidTarget) {
        this.createEdge({ source, target })
      }
      // Deselect nodes
      this.startLink.source = null;
      this.startLink.target = null;
      this.startLink.color = this.getEdgeColor(null);
      this.startLink.arrow = this.getEdgeArrow(null);
      this.startLink.dash = this.getEdgeDash(null);
      this.deselectItem();
    },


    ///////////////////////////////////////////////////////////////////////////
    //  4. Canvas Page Calculation  ///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Recalculates the canvas size and the camera's position over it.
     * 
     * NOTE:
     * This function should be called after adding, moving, or removing nodes
     * from the canvas.
     * 
     */
    recalculateLayout(): void {
      // Compute lower-right bounds
      let [x, y] = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
      for(let node of (this.$refs as any).nodes.children) {
          let x0 = parseInt(node.style.left);
          let y0 = parseInt(node.style.top);
          let child = node.children[0];
          let x1 = x0 + child.clientWidth;
          let y1 = y0 + child.clientHeight;
          x = Math.max(x, x1);
          y = Math.max(y, y1);
          this.setNodeLowerBound({ id: node.id, x1, y1 })
      }
      // Get canvas size parameters
      let [width, height, padding] = [
          this.canvas.pageSizeX,
          this.canvas.pageSizeY,
          this.canvas.padding
      ];
      // Compute canvas dimensions
      this.canvasWidth = Math.ceil((x + padding)/width) * width;
      this.canvasHeight = Math.ceil((y + padding)/height) * height;
      this.canvasWidth = Math.max(this.canvasWidth, this.$el.clientWidth + 10);
      this.canvasHeight = Math.max(this.canvasHeight, this.$el.clientHeight + 10);
      // Reset camera on the next tick
      this.$nextTick(() => {
        let [cameraX, cameraY] = [this.canvas.cameraX, this.canvas.cameraY];
        // Center camera if coordinate is unset
        if(cameraX === -1)
          cameraX = (this.$el.scrollWidth - this.$el.clientWidth) / 2;
        if(cameraY === -1)
          cameraY = (this.$el.scrollHeight - this.$el.clientHeight) / 2;
        // Set camera position
        this.$el.scrollLeft = cameraX;
        this.$el.scrollTop = cameraY;
        // Store browser-restricted camera position
        this.setCameraPosition({
          x: this.$el.scrollLeft,
          y: this.$el.scrollTop
        })
      })
    },


    ///////////////////////////////////////////////////////////////////////////
    //  5. Context Menu  //////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Context menu behavior.
     * @param event
     *  The pointer event.
     */
    contextMenu(event: PointerEvent) {
      this.storeClickCoordinates(event);
      if(event.button === 2) {
        this.showCtxMenu = true;
      } else {
        this.showCtxMenu = false;
      }
    },   

    /**
     * The context menu selection callback.
     */
    onContextMenuSelection(id: string, data: any): void {
      switch(id) {
        case "create-node":
          this.createNode({ type: data.type, location: this.lastClick });
          break;
        case "delete-item":
          this.deleteItems([...this.selected.keys()]);
          this.deselectItem();
          break;
        case "duplicate-node":
          this.duplicateSequence(this.selectedNodes);
          break;
      }
    },


    ///////////////////////////////////////////////////////////////////////////
    //  6. Node Mouse Over  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Node mouseover behavior.
     * @param node
     *  The node that is being moused over.
     */
    async nodeMouseEnter(node: Store.CanvasNode) {
      if(!this.startLink.show || this.startLink.source?.id === node.id) 
        return;
      this.startLink.target = node;
      let type = await this.getEdgeType({
        source: this.startLink.source!.type,
        target: this.startLink.target.type
      });
      if(type === null) {
        this.invalidSelect(node.id);
      } else {
        this.startLink.color = this.getEdgeColor(type);
        this.startLink.arrow = this.getEdgeArrow(type);
        this.startLink.dash = this.getEdgeDash(type);
        this.partialSelectItem(node.id);
      }
    },

    /**
     * Node mouse exit behavior
     * @param node
     *  The node that was left.
     */
    nodeMouseLeave(node: Store.CanvasNode) {
      if(!this.startLink.show || this.startLink.source?.id === node.id)
        return;
      this.startLink.target = null;
      this.startLink.color = this.getEdgeColor(null);
      this.startLink.arrow = this.getEdgeArrow(null);
      this.startLink.dash = this.getEdgeDash(null);
      this.deselectItem(node.id);
    },


    ///////////////////////////////////////////////////////////////////////////
    //  7. Node Selection  ////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Primary item selection behavior.
     * @param event
     *  The pointer event.
     * @param id
     *  The id of the item clicked.
     * @param exclusive
     *  If true, the specified item will be selected and everything else will
     *  be unselected, no matter what.
     */
    fullSelectItem(event: PointerEvent, id: string, exclusive: boolean = false) {
      if(exclusive) {
          this.deselectItem();
          this.selected.set(id, "select-full");
          return;
      }
      // If right click and item is already selected, do nothing.
      if(event.button === 2 && this.selected.has(id)) {
        return;
      }
      // If control key is pressed:
      if(event.ctrlKey) {
        // and item is selected: remove it from the current selection.
        if(this.selected.has(id)) {
          this.deselectItem(id);
        }
        // and item is not selected: add it to the current selection.
        else {
          this.selected.set(id, "select-full");
        }
      } 
      // If control key is not pressed:
      // unselect everything and add the current item to the selection.
      else {
        this.deselectItem();
        this.selected.set(id, "select-full");
      }
    },

    /**
     * Adds an item to the current selection with the "partial" selection type.
     * @param id
     *  The id of the item to select.
     */
    partialSelectItem(id: string) {
      this.selected.set(id, "select-partial");
    },

    /**
     * Adds an item to the current selection with the "invalid" selection type.
     * @param id
     *  The id of the item to select.
     */
    invalidSelect(id: string) {
        this.selected.set(id, "select-invalid");
    },
    
    /**
     * Deselects an item.
     * @param id
     *  The id of the node to deselect. If no id is specified, all nodes will
     *  be deselected.
     */
    deselectItem(id?: string) {
      if(id === undefined) {
        this.selected.clear();
      } else {
        this.selected.delete(id);
      }
    },


    ///////////////////////////////////////////////////////////////////////////
    //  7. Misc Helpers  //////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Stores the coordinates from a mouse event in the component's store.
     */
    storeClickCoordinates(event: MouseEvent) {
      let bounds = (this.$refs.panel as any).getBoundingClientRect();
      this.lastClick[0] = event.x - bounds.left;
      this.lastClick[1] = event.y - bounds.top;
    },

    /**
     * Looks up an edge's color based on type.
     * @param type
     *  The type of the edge.
     * @returns
     *  The edge's color.
     */
    getEdgeColor(type: string | null): string {
      if(type === null) {
        return "#4d4d4d"
      } else {
        return this.schemas.edgeSchemas.get(type)?.color ?? "#4d4d4d";
      }
    },

    /**
     * Looks up an edge's arrow style based on type.
     * @param type
     *  The type of the edge.
     * @returns
     *  The edge's arrow style.
     */
    getEdgeArrow(type: string | null): boolean {
      if(type === null) {
        return true;
      } else {
        return this.schemas.edgeSchemas.get(type)?.hasArrow ?? true;
      }
    },

    /**
     * Looks up an edge's dash style based on type.
     * @param type
     *  The type of the edge.
     * @returns
     *  The edge's dash style.
     */
    getEdgeDash(type: string | null): boolean {
      if(type === null) {
        return false;
      } else {
        console.log(this.schemas.edgeSchemas.get(type)?.hasDash)
        return this.schemas.edgeSchemas.get(type)?.hasDash ?? false;
      }
    }

  },
  watch: {
    layoutTrigger() {
      // Recalculate layout on the next tick
      this.$nextTick(() => {
        this.recalculateLayout();
      })
    }
  },
  mounted() { this.recalculateLayout(); },
  components: { 
    AttackFlowEdgeMenu, AttackFlowNode, 
    AttackFlowEdge, ContextMenu, PlugIcon
  }
});
</script>

<style scoped>

/** === Main Element === */

.attack-flow-canvas-container {
  position: relative;
  overflow: hidden;
}

.attack-flow-canvas-context {
  padding: 50px;
  display: inline-block;
}

.attack-flow-canvas-panel {
  position: relative;
  width: 100%;
  height: 100%;
  background: url("~@/assets/images/grid.png") #141414;
  border: solid 2px #292929;
  box-sizing: border-box;;
  box-shadow: 0px 0px 10px 4px rgb(0 0 0 / 20%);
  border-radius: 5px;
  overflow: visible;
}

.edges, 
.nodes,
.menus {
  position: absolute;
  top:50px;
  left: 50px;
  width: 0px;
  height: 0px;
}

/** === Nodes === */

.attack-flow-node-wrapper {
  position: absolute;
  width: max-content;
}

.attack-flow-node-wrapper.select-full, 
.attack-flow-node-wrapper.select-partial,
.attack-flow-node-wrapper.select-invalid {
  border-radius: 8px;
  padding: 4px;
  margin-left: -5px;
  margin-top: -5px;
}
.attack-flow-node-wrapper.select-full {
  border: solid 1px #e6d845;
}
.attack-flow-node-wrapper.select-partial {
  border: dashed 1px #e6d845;
}
.attack-flow-node-wrapper.select-invalid {
  border: solid 1px #f62323;
}

/** === Edges === */

.edges {
  pointer-events: none;
}

.edges path {
  pointer-events: all;
  cursor: pointer;
}

/** === Menus === */

.canvas-context-menu,
.attack-flow-edge-menu {
  position: absolute;
}

.canvas-context-menu {
  z-index:9999;
}

.attack-flow-edge-menu {
  width: max-content;
  transform:translateX(-50%);
}

/** === Start Link Floating Icon === */

.start-link-icon {
  position: absolute;
  height: 26px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  border-radius: 3px;
  border: solid 1px #1f1f1f;
  box-sizing: border-box;
  background: #0f0f0f;
  box-shadow: 3px 3px 0px 0px rgb(0 0 0 / 30%);
  pointer-events: none;
}

.pop-in-enter-active, .pop-in-leave-active {
  transition: opacity .15s, transform .2s;
}
.pop-in-enter-from, .pop-in-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

</style>
