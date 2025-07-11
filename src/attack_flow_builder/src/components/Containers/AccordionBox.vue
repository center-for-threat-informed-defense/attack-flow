<script lang="ts">
// Dependencies
import { PointerTracker } from "@/assets/scripts/PointerTracker";
import { defineComponent, h, markRaw } from "vue";
// Components
import CollapseArrowIcon from "@/components/Icons/CollapseArrowIcon.vue";

export default defineComponent({
  name: "AccordionBox",
  data() {
    return {
      track: markRaw(new PointerTracker()),
      panes: [] as AccordionPaneHeight[],
      activePane: 0,
      onResizeObserver: null as ResizeObserver | null,
    }
  },
  props: {
    collapseHeight: {
      type: Number,
      default: 32,
    }
  },
  computed: {

    /**
     * Returns the accordion box's style.
     * @returns
     *  The accordion box's style.
     */
    boxStyle() {
      const gridTemplateRows = this.panes.map(
        o => `${ o.activeHeight + this.collapseHeight }px`
      ).join(" ");
      return { gridTemplateRows }
    }

  },
  
  methods: {

    /**
     * Pane collapse behavior.
     * @param event
     *  The pointer event.
     * @param i
     *  The index of the pane.
     */
    onCollapse(i: number) {
      if(this.panes[i].collapsed) {
        this.uncollapsePane(i);
      } else {
        this.collapsePane(i);
      }
    },

    /**
     * Collapses a pane.
     * @param i
     *  The index of the pane.
     */
    collapsePane(i: number) {
      const p = this.panes;

      // Cache heights
      this.cacheHeights();

      // Calculate next height
      const currentHeight = p.reduce((a,o) => a + o.cachedHeight, 0);
      const elementHeight = this.getAvailableHeight(); 
      const nextHeight = currentHeight - p[i].cachedHeight;
      
      // Collapse window
      p[i].collapsed = true;
      p[i].activeHeight = 0;
      p[i].uncollapsedHeight = p[i].cachedHeight;

      // Return collapsed height if room available.
      if(nextHeight < elementHeight) {
        const available = elementHeight - nextHeight;
        const availableDelta = Math.min(available, p[i].cachedHeight);
        for(let j = p.length - 1; 0 <= j; j--) {
          if(p[j].collapsed) {
            continue;
          }
          p[j].activeHeight += availableDelta;
          break;
        }
      }

      // Cache heights
      this.cacheHeights();

    },

    /**
     * Uncollapses a pane.
     * @param i
     *  The index of the pane.
     */
    uncollapsePane(i: number) {
      const p = this.panes;
      let neededHeight = p[i].uncollapsedHeight;
      
      // Cache heights
      this.cacheHeights();

      // Take collapsed height from element if available
      const currentHeight = p.reduce((a,o) => a + o.cachedHeight, 0);
      const elementHeight = this.getAvailableHeight();
      if(currentHeight === 0) {
        p[i].activeHeight += elementHeight;
        neededHeight -= Math.min(neededHeight, elementHeight);
      }

      // Take collapsed height from panes if available
      for(let j = p.length - 1; 0 <= j; j--) {
        if(p[j].collapsed) {
          continue;
        }
        const available = p[j].cachedHeight - p[j].minHeight;
        const availableDelta = Math.min(available, neededHeight);
        p[j].activeHeight -= availableDelta;
        p[i].activeHeight += availableDelta;
        neededHeight -= availableDelta;
      }

      // Snap to minimum height if needed
      p[i].activeHeight = Math.max(p[i].activeHeight, p[i].minHeight);
      p[i].collapsed = false;

      // Cache heights
      this.cacheHeights();

    },

    /**
     * Header drag start behavior.
     * @param event
     *  The pointer event.
     * @param i
     *  The index of the header.
     */
    startDrag(event: PointerEvent, i: number) {
      // Cache heights
      this.cacheHeights();
      // Set active pane
      this.activePane = i;
      // Capture pointer
      this.track.capture(event, this.onDrag);
      // Configure stop drag
      document.addEventListener("pointerup", this.stopDrag, { once: true });
    },

    /**
     * Header drag behavior.
     * @param event
     *  The pointer event.
     * @param track
     *  The mouse tracker.
     */
    onDrag(event: PointerEvent, track: PointerTracker) {
      event.preventDefault();

      const p = this.panes;

      // Ignore no movement
      if(track.movementY === 0)
        return;
      
      // Reset panes
      p.forEach(o => o.activeHeight = o.cachedHeight);
      
      // Drag above origin
      if(track.deltaY < 0) {
        // Select grow pane
        let growPane = -1;
        for(let i = this.activePane!; i < p.length; i++) {
          if(!p[i].collapsed) {
            growPane = i;
            break;
          }
        }
        if(growPane === -1) {
          return;
        }
        // Resize grow pane
        let remainingDelta = Math.abs(track.deltaY);
        for(let i = this.activePane! - 1; 0 <= i; i--) {
          if(p[i].collapsed) {
            continue;
          }
          const available = p[i].cachedHeight - p[i].minHeight;
          const availableDelta = Math.min(available, remainingDelta);
          p[i].activeHeight = p[i].cachedHeight - availableDelta;
          remainingDelta -= availableDelta;
        }
        const growAmount = Math.abs(track.deltaY) - remainingDelta;
        p[growPane].activeHeight = p[growPane].cachedHeight + growAmount; 
      }

      // Drag below origin
      else {
        // Select grow pane
        let growPane = -1;
        for(let i = this.activePane! - 1; 0 <= i; i--) {
          if(!p[i].collapsed) {
            growPane = i;
            break;
          }
        }
        if(growPane === -1) {
          return;
        }
        // Resize grow pane
        let remainingDelta = track.deltaY;
        for(let i = this.activePane!; i < p.length; i++) {
          if(p[i].collapsed) {
            continue;
          }
          const available = p[i].cachedHeight - p[i].minHeight;
          const availableDelta = Math.min(available, remainingDelta);
          p[i].activeHeight = p[i].cachedHeight - availableDelta;
          remainingDelta -= availableDelta;
        }
        const growAmount = track.deltaY - remainingDelta;
        p[growPane].activeHeight = p[growPane].cachedHeight + growAmount;
      }
      
    },

    /**
     * Header drag stop behavior.
     * @param event
     *  The pointer event.
     */
    stopDrag(event: PointerEvent) {
      // Release pointer
      this.track.release(event);
      // Cache heights
      this.cacheHeights();
    },

    /**
     * Refits the panes inside the container.
     */
    refit() {
      const p = this.panes;
      const currentHeight = p.reduce((a,o) => a + o.cachedHeight, 0);
      const elementHeight = this.getAvailableHeight();
      
      // If no height, bail
      if(currentHeight === 0) {
        return;
      }

      // Grow
      else if(currentHeight <= elementHeight) {
        const proportions = p.map(o => o.cachedHeight / currentHeight);
        for(let i = 0; i < p.length; i++) {
          p[i].activeHeight = elementHeight * proportions[i];
        }
      }

      // Shrink
      else {
        const minElementHeight = p.reduce((a,o) => a + (o.collapsed ? 0 : o.minHeight), 0);
        const n = currentHeight - Math.max(minElementHeight, elementHeight);
        const d = currentHeight - minElementHeight;
        const percentToMinimum = d !== 0 ? n / d : 1;
        for(let i = 0; i < p.length; i++) {
          if(p[i].collapsed) {
            continue;
          }
          const delta = (p[i].cachedHeight - p[i].minHeight) * percentToMinimum;
          p[i].activeHeight = p[i].cachedHeight - delta;
        }
      }

    },

    /**
     * Resets the panes inside the container.
     */
    reset() {
      if(!this.$slots.default)
        return;

      // Setup panes and heights
      const panes: AccordionPaneHeight[] = [];
      const units: number[] = [];
      for(const slot of this.$slots.default()) {
        units.push(slot.props?.units ?? 1);
        panes.push({
          minHeight: slot.props?.minHeight ?? 100,
          activeHeight: 0,
          cachedHeight: 0,
          uncollapsedHeight: 0,
          collapsed: slot.props?.collapsed ?? false
        });
      }
      const totalHeight = this.getAvailableHeight();

      // Configure base height
      const totalUnits = units.reduce((a,b) => a+b);
      for(let i = 0; i < panes.length; i++) {
        const p = panes[i];
        const height = totalHeight * (units[i] / totalUnits)
        p.cachedHeight = Math.max(p.minHeight, height);
      }
      this.panes = panes;

      // Fit to container
      this.refit();

      // Apply collapse state
      for(let i = 0; i < this.panes.length; i++) {
        if(this.panes[i].collapsed)
          this.collapsePane(i);
      }

    },

    /**
     * Returns the amount of useable space available from the container.
     */
    getAvailableHeight() {
      const height = this.$el.clientHeight;
      if(!this.$slots.default) {
        return height;
      } else {
        const totalPanes = this.$slots.default().length;
        return height - (totalPanes * this.collapseHeight);
      }
    },

    /**
     * Caches the height of each pane.
     */
    cacheHeights() {
      for(const pane of this.panes) {
        pane.cachedHeight = pane.activeHeight;
      }
    }

  },
  mounted() {
    // Configure resize observer
    this.onResizeObserver = new ResizeObserver(() => this.refit());
    this.onResizeObserver.observe(this.$el);
    // Reset boxes
    this.reset();
  },
  unmounted() {
    this.onResizeObserver?.disconnect();
  },
  render() {
    const children = [];
    if(this.$slots.default) {
      const _slots = this.$slots.default();
      // Generate accordion boxes
      for(let i = 0; i < _slots.length; i++) {
        const slot = _slots[i];
        // Generate handle
        const handle = h(
          "div",
          {
            class: "accordion-box-handle",
            onPointerup: (e: PointerEvent) => this.stopDrag(e),
            onPointerdown: (e: PointerEvent) => this.startDrag(e, i)
          }
        );
        // Generate head
        const head = h(
          "div",
          {
            class: "accordion-box-head",
            style: { height: `${ this.$props.collapseHeight }px` },
            onClick: () => this.onCollapse(i)
          },
          [
            h(
              CollapseArrowIcon,
              { 
                class: "collapse-arrow",
                collapsed: this.panes[i]?.collapsed
              }
            ),
            h("p", slot.props?.name.toLocaleUpperCase())
          ]
        );
        // Generate body
        const body = h("div", { class: "accordion-box-body" }, slot);
        // Generate box
        const box = h(
          "div",
          { 
            class: [
              "accordion-box",
              { collapsed: this.panes[i]?.collapsed }
            ]
          },
          [handle, head, body]
        );
        // Add box
        children.push(box);
      }
    }
    // Return accordion box container
    return h(
      "div",
      { 
        class: "accordion-box-container",
        style: this.boxStyle,
      },
      children
    )
  },
});

type AccordionPaneHeight = {
  minHeight: number,
  activeHeight: number,
  cachedHeight: number,
  uncollapsedHeight: number,
  collapsed: boolean
}

</script>

<style scoped>

/** === Main Container === */

.accordion-box-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  border-top: solid 1px #474747;
  box-sizing: border-box;
}

/** === Accordion Box === */

.accordion-box {
  display: flex;
  flex-direction: column;
  position: relative;
}

.accordion-box:first-child .accordion-box-head {
  border-top: none;
}

.accordion-box.collapsed .accordion-box-body {
  display: none;
}

.accordion-box-handle {
  position: absolute;
  top: -2px;
  width: 100%;
  height: 4px;
  background: #726de2;
  cursor: n-resize;
  transition: 0.15s opacity;
  opacity: 0;
}
.accordion-box-handle:hover {
  transition-delay: 0.2s;
  opacity: 1;
}

.accordion-box-head {
  display: flex;
  align-items: center;
  color: #d9d9d9;
  font-size: 9.5pt;
  font-weight: 600;
  user-select: none;
  border-top: solid 1px #474747;
  box-sizing: border-box;
  background: #3b3b3b;
  box-shadow: 0px 2px 2px 0px rgb(0 0 0 / 16%);
}

.accordion-box-head .collapse-arrow {
  padding: 0px 10px;
}

.accordion-box-body {
  flex: 1;
  overflow: hidden;
}

</style>
