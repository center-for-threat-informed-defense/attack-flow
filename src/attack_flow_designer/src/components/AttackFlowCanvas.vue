<template>
  <div class="attack-flow-canvas-container">
    <div class="attack-flow-canvas-context" @wheel.passive="onCanvasMouseWheel" @contextmenu="$event.preventDefault()" ref="context">
      <div @pointerdown="on">
        <div class="attack-flow-canvas-panel" :style="canvasStyle" @pointerdown="startCanvasDrag" ref="panel">
          <svg>
            <AttackFlowEdge 
              v-for="edge of getEdges" :key="edge.id" 
              :source="edge.source" :target="edge.target" color="#4d4d4d"
            />
            <AttackFlowEdge 
              :source="startLink.source" :target="startLink.target ?? startLink.cursor" color="#4d4d4d" 
            />
          </svg>
        </div>
        <div class="floating-elements" ref="nodes">
          <div
            v-for="node of getNodes" :key="node.id" :id="node.id"
            :class="['attack-flow-node-wrapper', selected.get(node.id)]"
            :style="{ top: `${ node.y0 }px`, left: `${ node.x0 }px` }"
          >
            <AttackFlowNode
              class="attack-flow-node"
              :config="node" :schema="getNodeSchema(node.type)"
              @fieldUpdate="(field, value) => setNodeField({ id: node.id, field, value })"
              @subtypeUpdate="(value) => setNodeSubtype({ id: node.id, value })"
              @pointerdown="fullSelectNode($event, node.id)"
              @dragStart="evt => startNodeDrag(evt, node.id)"
              @linkStart="evt => startNodeLink(evt, node)"
              @mouseenter="nodeMouseEnter(node)"
              @mouseleave="nodeMouseLeave(node)"
            />
          </div>
        </div>
      </div>
      <div class="floating-menus">
        <ContextMenu
          class="canvas-context-menu"
          :options="coreContextMenu"
          :style="{ top:`${lastClick[1]}px`, left:`${lastClick[0]}px`}"
          @select="onContextMenuSelection"
          @unfocus="showCtxMenu = false"
          v-show="showCtxMenu"
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
import { mapGetters, mapActions } from "vuex";

import AttackFlowNode from "./AttackFlowNode.vue";
import AttackFlowEdge from "./AttackFlowEdge.vue";
import ContextMenu from "./menus/ContextMenu.vue";
import PlugIcon from "./svgs/PlugIcon.vue";

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
        source : null as Types.ICanvasNode | null,
        target : null  as Types.ICanvasNode | null,
        cursor : { x0: 0, x1: 0, y0: 0, y1: 0  } as Types.IBox
      },
      lastClick: [0, 0] as Array<number>,
      showCtxMenu: false
    }
  },
  computed: {
    ...mapGetters(["getNodes", "getEdges"]),
    canvasStyle(): Object {
      return {
        width  : `${ this.canvasWidth }px`,
        height : `${ this.canvasHeight }px`
      }
    },
    coreContextMenu(): Object {
      // Use canvas context menu if nothing selected
      if(this.selected.size === 0) {
        return this.canvasContextMenu;
      } else if (this.selected.size === 1) {
        return [[
          { id: "delete-node", text: "Delete Node" },
          { id: "duplicate-node", text: "Duplicate Node" }
        ]]
      } else {
        return [[
          { id: "delete-node", text: `Delete ${ this.selected.size } Nodes` },
          { id: "duplicate-node", text: `Duplicate ${ this.selected.size } Nodes` }
        ]]
      }
    },
    canvasContextMenu(): Array<Array<Types.IContextMenuOption>> {
      let menu: Array<Types.IContextMenuOption> = [];
      for(let [type, _] of this.getNodeSchemas()) {
        menu.push({
          id: `create-node`, 
          text: `Create ${ this.capitalize(type) } Node`, 
          data: { type }
        })
      }
      return [menu];
    }
  },
  methods: {
    ...mapGetters([
      "getPageSize", 
      "getNodeSchemas", 
      "getCameraPosition",
      "getCanvasPadding"
    ]),
    ...mapActions([
      "createNode",
      "createEdge",
      "deleteNodes",
      "duplicateNodes",
      "offsetNode", 
      "setNodeField", 
      "setNodeSubtype",
      "setNodeLowerBound",
      "setCameraPosition",
      "recalculatePages"
    ]),

    on(event: PointerEvent) {
      this.storeClickCoordinates(event);
      if(event.button === 2) {
        this.showCtxMenu = true;
      } else {
        this.showCtxMenu = false;
      }
    },      

    /**
     * Canvas Click / Drag / Scroll
     */

    startCanvasDrag(event: PointerEvent) {
      this.deselectNode();
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
      // Recalcuate layout on the next tick
      this.$nextTick(() => {
        this.recalculateLayout();
      })
    },

    /**
     * Node Link
     */

    startNodeLink(event: PointerEvent, source: Types.ICanvasNode) {
      event.preventDefault();
      // Select node
      this.fullSelectNode(event, source.id, true);
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
      this.deselectNode();
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
          this.setNodeLowerBound({ id: parseInt(node.id), x1, y1 })
      }
      // Get canvas size parameters
      let { width, height } = this.getPageSize();
      let padding = this.getCanvasPadding();
      // Compute canvas dimensions
      this.canvasWidth = Math.ceil((x + padding)/width) * width;
      this.canvasHeight = Math.ceil((y + padding)/height) * height;
      this.canvasWidth = Math.max(this.canvasWidth, this.$el.clientWidth + 10);
      this.canvasHeight = Math.max(this.canvasHeight, this.$el.clientHeight + 10);
      // Reset camera on the next tick
      this.$nextTick(() => {
        let { x: cameraX, y: cameraY } = this.getCameraPosition();
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

    onContextMenuSelection(id: string, data: any): void {
      switch(id) {
        case "create-node":
          this.createNode({ type: data.type, location: this.lastClick });
          break;
        case "delete-node":
          this.deleteNodes([...this.selected.keys()]);
          this.deselectNode();
          break;
        case "duplicate-node":
          this.duplicateNodes([...this.selected.keys()])
          break;
      }
      // Recalcuate layout on the next tick
      this.$nextTick(() => {
        this.recalculateLayout();
      })
    },

    /**
     * Node Mouse Over
     */

    nodeMouseEnter(node: Types.ICanvasNode) {
      if(!this.startLink.show || this.startLink.source?.id === node.id) 
        return;
      this.startLink.target = node;
      this.partialSelectNode(node.id);
    },

    nodeMouseLeave(node: Types.ICanvasNode) {
      if(!this.startLink.show || this.startLink.source?.id === node.id)
        return;
      this.startLink.target = null;
      this.deselectNode(node.id);
    },

    /**
     * Node Selection
     */

    fullSelectNode(event: PointerEvent, id: number, exclusive: boolean = false) {
      if(exclusive) {
          this.deselectNode();
          this.selected.set(id, "select-full");
          return;
      }
      if(event.button === 2 && this.selected.has(id)) {
        return;
      }
      if(event.ctrlKey) {
        if(this.selected.has(id)) {
          this.deselectNode(id);
        } else {
          this.selected.set(id, "select-full");
        }
      } else {
        this.deselectNode();
        this.selected.set(id, "select-full");
      }
    },

    partialSelectNode(id: number) {
      this.selected.set(id, "select-partial");
    },
    
    deselectNode(id?: number) {
      if(id === undefined) {
        this.selected.clear();
      } else {
        this.selected.delete(id);
      }
    },

    /**
     * Helpers
     */

    getNodeSchema(type: string): Types.INodeSchema {
      return this.getNodeSchemas().get(type);
    },

    storeClickCoordinates(event: PointerEvent) {
      let bounds = (this.$refs.panel as any).getBoundingClientRect();
      this.lastClick[0] = event.x - bounds.left;
      this.lastClick[1] = event.y - bounds.top;
    },

    capitalize(text: string): string {
      return `${ text[0].toLocaleUpperCase() }${ text.substring(1) }`
    }

  },
  mounted() { this.recalculateLayout(); },
  components: { AttackFlowNode, AttackFlowEdge, ContextMenu, PlugIcon },
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

.floating-elements, .floating-menus {
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

.attack-flow-canvas-panel svg {
  width: 100%;
  height: 100%;
}

.attack-flow-canvas-panel svg path {
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

.canvas-context-menu {
  position: absolute;
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
