<template>
  <div class="attack-flow-canvas-container">
    <div class="attack-flow-canvas-context" @wheel.passive="onCanvasMouseWheel" @contextmenu="$event.preventDefault()" ref="context">
      <div @pointerdown="contextMenu">
        <div class="attack-flow-canvas-panel" :style="panelSize" @pointerdown="startCanvasDrag" ref="panel"></div>
        <svg class="edges" :style="panelSize">
          <AttackFlowEdge 
            v-for="[id, edge] of edges" :key="id" 
            :source="edge.source" :target="edge.target"
            :color="selected.has(id) ? '#e6d845' : getEdgeColor(edge.type)"
            @pointerdown="fullSelectItem($event, id)"
          />
          <AttackFlowEdge :source="startLink.source" :target="startLink.target ?? startLink.cursor" color="#4d4d4d"/>
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
          :options="coreContextMenu"
          :style="{ top:`${lastClick[1]}px`, left:`${lastClick[0]}px`}"
          @select="onContextMenuSelection"
          @unfocus="showCtxMenu = false"
          v-show="showCtxMenu"
        />
        <AttackFlowEdgeMenu
          class="attack-flow-edge-menu"
          v-if="focusedEdge !== null" 
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
import { capitalize } from "@/assets/StringTools";

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
        source : null as Types.CanvasNode | null,
        target : null  as Types.CanvasNode | null,
        cursor : { x0: 0, x1: 0, y0: 0, y1: 0  } as Types.IBox
      },
      lastClick: [0, 0] as Array<number>,
      showCtxMenu: false
    }
  },
  computed: {
    ...mapState({
      nodes(state: Types.DesignerStore): Map<string, Types.CanvasNode> {
        return state.session.nodes;
      },
      edges(state: Types.DesignerStore): Map<string, Types.CanvasEdge> {
        return state.session.edges;
      },
      schemas(state: Types.DesignerStore): Types.IAttackFlowSchema {
        return state.schema;
      },
      canvas(state: Types.DesignerStore): Types.CanvasMetadata {
        return state.session.canvas;
      }
    }),
    panelSize(): Object {
      return {
        width  : `${ this.canvasWidth }px`,
        height : `${ this.canvasHeight }px`
      }
    },
    coreContextMenu(): Array<Array<Types.IContextMenuOption>> {
      if(this.selected.size === 0) {
        return this.canvasContextMenu;
      } else {
        let options: Array<Array<Types.IContextMenuOption>> = [[]];
        let nLen = this.selectedNodes.length;
        let eLen = this.selectedEdges.length;
        // Delete option
        let nodeText = nLen === 0 ? '' : nLen === 1 ? "Node" : "Nodes";
        let edgeText = eLen === 0 ? '' : eLen === 1 ? "Edge" : "Edges";
        let text = nodeText && edgeText ? "Items" : `${ nodeText }${ edgeText }` 
        options[0].push({ id: "delete-item", text: `Delete ${ text }` });
        // Duplicate option
        if(nLen > 0) {
          let text = `Duplicate ${ nLen > 1 ? 'Sequence' : 'Node' }`
          options[0].push({ id: "duplicate-node", text })
        }
        return options;
      }
    },
    canvasContextMenu(): Array<Array<Types.IContextMenuOption>> {
      let menu: Array<Types.IContextMenuOption> = [];
      for(let [type, _] of this.schemas.nodes) {
        menu.push({
          id: `create-node`, 
          text: `Create ${ capitalize(type) } Node`, 
          data: { type }
        })
      }
      return [menu];
    },
    focusedEdge(): Types.CanvasEdge | null {
      if(this.selectedEdges.length === 1) {
        return this.edges.get(this.selectedEdges[0])!;
      } else {
        return null;
      }
    },
    selectedNodes(): Array<string> {
      let nodes: Array<string> = [];
      for(let [id, select] of [...this.selected.entries()]) {
        if(/^[0-9]+$/.test(id) && select === "select-full")
          nodes.push(id);
      }
      return nodes;
    },
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
      "createNode",
      "createEdge",
      "deleteItems",
      "duplicateNodes",
      "offsetNode",
      "setNodeLowerBound",
      "setCameraPosition",
      "recalculatePages"
    ]),   

    /**
     * Canvas Click / Drag / Scroll
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
    onCanvasDrag(event: PointerEvent) {
      event.preventDefault();
      let deltaX = event.x - this.drag.origin[0];
      let deltaY = event.y - this.drag.origin[1];
      this.$el.scrollTop = this.drag.position[1] - deltaY;
      this.$el.scrollLeft = this.drag.position[0] - deltaX;
    },
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

    onCanvasMouseWheel(event: WheelEvent) {
      this.$el.scrollLeft += event.altKey ? event.deltaY : event.deltaX;
      this.$el.scrollTop += event.altKey ? event.deltaX : event.deltaY;
      this.setCameraPosition({
        x: this.$el.scrollLeft,
        y: this.$el.scrollTop
      })
    },

    /**
     * Node Dragging
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
    onNodeDrag(event: PointerEvent, id: number) {
      let deltaX = event.x - this.drag.origin[0];
      let deltaY = event.y - this.drag.origin[1];
      this.offsetNode({ id, x: deltaX, y: deltaY })
      this.drag.origin[0] = event.x;
      this.drag.origin[1] = event.y;
    },
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

    /**
     * Node Link
     */

    startNodeLink(event: PointerEvent, source: Types.CanvasNode) {
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
      if(target !== undefined) {
        let targets = [target];
        this.createEdge({ source, targets })
      }
      // Deselect nodes
      this.startLink.source = null;
      this.startLink.target = null;
      this.deselectItem();
    },

    /**
     * Canvas Page Calculation
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

    /**
     * Context Menus
     */

    contextMenu(event: PointerEvent) {
      this.storeClickCoordinates(event);
      if(event.button === 2) {
        this.showCtxMenu = true;
      } else {
        this.showCtxMenu = false;
      }
    },   

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
          this.duplicateNodes(this.selectedNodes);
          break;
      }
      // Recalculate layout on the next tick
      this.$nextTick(() => {
        this.recalculateLayout();
      })
    },

    /**
     * Node Mouse Over
     */

    nodeMouseEnter(node: Types.CanvasNode) {
      if(!this.startLink.show || this.startLink.source?.id === node.id) 
        return;
      this.startLink.target = node;
      this.partialSelectItem(node.id);
    },

    nodeMouseLeave(node: Types.CanvasNode) {
      if(!this.startLink.show || this.startLink.source?.id === node.id)
        return;
      this.startLink.target = null;
      this.deselectItem(node.id);
    },

    /**
     * Node Selection
     */

    fullSelectItem(event: PointerEvent, id: string, exclusive: boolean = false) {
      if(exclusive) {
          this.deselectItem();
          this.selected.set(id, "select-full");
          return;
      }
      if(event.button === 2 && this.selected.has(id)) {
        return;
      }
      if(event.ctrlKey) {
        if(this.selected.has(id)) {
          this.deselectItem(id);
        } else {
          this.selected.set(id, "select-full");
        }
      } else {
        this.deselectItem();
        this.selected.set(id, "select-full");
      }
    },

    partialSelectItem(id: string) {
      this.selected.set(id, "select-partial");
    },
    
    deselectItem(id?: string) {
      if(id === undefined) {
        this.selected.clear();
      } else {
        this.selected.delete(id);
      }
    },

    /**
     * Helpers
     */
    
    storeClickCoordinates(event: PointerEvent) {
      let bounds = (this.$refs.panel as any).getBoundingClientRect();
      this.lastClick[0] = event.x - bounds.left;
      this.lastClick[1] = event.y - bounds.top;
    },

    getEdgeColor(type: string | null): string {
      if(type === null) {
        return "#4d4d4d"
      } else {
        return this.schemas.edges.get(type)?.color ?? "#4d4d4d";
      }
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

.attack-flow-canvas-container {
  position: relative;
  overflow: hidden;
}

.attack-flow-canvas-context {
  padding: 50px;
  display: inline-block;
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

.edges {
  pointer-events: none;
}
.edges path {
  pointer-events: all;
  cursor: pointer;
}

.attack-flow-node-wrapper {
  position: absolute;
  width: max-content;
}

.attack-flow-node-wrapper.select-full, 
.attack-flow-node-wrapper.select-partial {
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

.attack-flow-edge-menu,
.canvas-context-menu {
  position: absolute;
}

.attack-flow-edge-menu {
  min-width: 250px;
  transform:translateX(-50%);
}

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
