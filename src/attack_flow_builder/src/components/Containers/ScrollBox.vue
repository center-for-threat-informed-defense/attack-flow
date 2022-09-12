<template>
  <div class="scrollbox-container">
    <div 
      ref="content" 
      class="scroll-content" 
      @wheel.passive="moveScrollPosition(scrollTop + $event.deltaY, $event)"
    >
      <slot></slot>
    </div>
    <div
      class="scroll-bar"
      :style="scroll.sty"
      v-show="alwaysShowScrollBar || showScrollbar"
      @wheel.passive="moveScrollPosition(scrollTop + $event.deltaY, $event)"
    >
      <div
        class="scroll-handle"
        :style="handle.sty"
        v-show="showScrollbar"
        @pointerdown="startDrag"
        @pointerup="stopDrag"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { clamp } from "@/assets/scripts/BlockDiagram";
import { PointerTracker } from "@/assets/scripts/PointerTracker";
import { defineComponent, markRaw, Ref, ref } from 'vue';

export default defineComponent({
  name: "ScrollBox",
  setup() {
    return { 
      content: ref(null) as Ref<HTMLElement | null> 
    }
  },
  props: {
    resetScrollOnChange: {
      type: Boolean,
      default: false,
    },
    alwaysShowScrollBar: {
      type: Boolean,
      default: false
    },
    handleColor: {
      type: String,
      default: "#333333"
    },
    scrollColor: {
      type: String,
      default: "none"
    },
    borderColor: {
      type: String,
      default: "#404040"
    },
    width: {
      type: Number,
      default: 17
    }
  },
  data() {
    return {
      scrollTop: 0,
      windowMax: 0,
      scroll: {
        sty: { 
          width: `${this.width}px`,
          background: this.scrollColor
        },
      },
      handle: {
        trk: markRaw(new PointerTracker()),
        hei: 0, 
        max: 0, 
        pos: 0,
        sty: { 
          height: "0px", 
          transform: "translateY(0px)", 
          background: this.handleColor, 
          borderColor: this.borderColor,
        },
      },
      showScrollbar: false,
      onResizeObserver: null as ResizeObserver | null,
      onMutateObserver: null as MutationObserver | null,
    };
  },
  methods: {

    /**
     * Scroll handle drag start behavior.
     * @param event
     *  The pointer event.
     */
    startDrag(event: PointerEvent) {
      this.handle.trk.capture(event, this.onDrag);
      document.addEventListener("pointerup", this.stopDrag, { once: true });
    },

    /**
     * Scroll handle drag behavior.
     * @param event
     *  The pointer event.
     * @param track
     *  The mouse tracker.
     */
    onDrag(_: PointerEvent, track: PointerTracker) {
      this.moveScrollPosition(
        this.handleTopToTop(this.handle.pos + track.movementY)
      );
    },

    /**
     * Scroll handle drag stop behavior.
     * @param event
     *  The pointer event.
     */
    stopDrag(event: PointerEvent) {
      this.handle.trk.release(event);
    },

    /**
     * Calculates and configures the parameters required to mimic scrolling.
     * 
     * NOTE:
     * This function should be called anytime:
     *  - The height of the scroll box changes.
     *  - The height of the scroll content changes.
     * 
     * @param resetTop
     *  [true]
     *   The scroll position will be set to 0, after recalculation.
     *  [false]
     *   The scroll position will go to its original spot, after recalculation.
     *  (Default: true)
     */
    recalculateScrollState(resetTop: boolean = true) {
      let showScrollbar = this.showScrollbar;
      let content = this.content!;
      // Ignore scroll content with no height
      if(content.clientHeight === 0) {
       this.showScrollbar = false;
       return;
      }
      // Compute ratio
      let ratio = content.clientHeight / content.scrollHeight;
      // Update scroll state (-4 for the 2px of padding around the scrollbar)
      this.handle.hei = Math.max(15, Math.round((content.clientHeight - 4) * ratio));
      this.handle.max = content.clientHeight - this.handle.hei - 4;
      this.windowMax = content.scrollHeight - content.clientHeight;
      // Update scroll handle
      this.showScrollbar = ratio !== 1;
      this.handle.sty.height = `${this.handle.hei}px`;
      // Update scroll position
      this.moveScrollPosition(resetTop ? 0 : content.scrollTop);
      // If scrollbar added, recalculate state after scrollbar applied
      if(!showScrollbar && this.showScrollbar) {
        setTimeout(() => this.recalculateScrollState(resetTop), 0);
      }
    },

    /**
     * Moves the scroll position.
     * @param position
     *  The new scroll position.
     * @param event
     *  The scroll wheel event, if applicable.
     */
    moveScrollPosition(position: number, event: WheelEvent | null = null) {
      let scrollTop = this.scrollTop;
      this.scrollTop = clamp(position, 0, this.windowMax);
      this.handle.pos = this.topToHandleTop(this.scrollTop);
      this.handle.sty.transform = `translateY(${this.handle.pos}px)`;
      this.content!.scrollTop = this.scrollTop;
      // Selectively propagate scroll event
      let hasMoved = scrollTop - this.scrollTop !== 0;
      if(hasMoved || 0 < this.scrollTop && this.scrollTop < this.windowMax) {
        event?.stopPropagation();
      }
    },
    
    /**
     * Calculates the scroll handle position from the scroll position.
     * @param top
     *  The current scroll position.
     * @returns
     *  The calculated scroll handle position.
     */
    topToHandleTop(top: number): number {
      return (top / this.windowMax) * this.handle.max;
    },

    /**
     * Calculates the scroll position from the scroll handle position.
     * @param top
     *  The current scroll handle position.
     * @returns
     *  The calculated scroll position.
     */
    handleTopToTop(top: number): number {
      return (top / this.handle.max) * this.windowMax;
    }

  },
  mounted() {
    // Configure mutation observer
    let mutateOptions = { childList: true, characterData: true, subtree: true };
    this.onMutateObserver = new MutationObserver(() =>
      this.recalculateScrollState(this.resetScrollOnChange)
    );
    // Configure resize observer
    this.onResizeObserver = new ResizeObserver(() =>
      this.recalculateScrollState(false)
    );
    this.onResizeObserver.observe(this.$el);
    this.onMutateObserver.observe(this.content!, mutateOptions);
  },
  unmounted() {
    this.onResizeObserver!.disconnect();
    this.onMutateObserver!.disconnect();
  },
});
</script>

<style scoped>

/** === Main Container === */

.scrollbox-container {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0px;  
  display: flex;
  overflow: hidden;
}
.scroll-content {
  flex: 1;
  overflow: hidden;
}
.scroll-bar {
  padding: 2px;
  box-sizing: border-box;
}
.scroll-handle {
  border-style: solid;
  border-width: 1px;
  border-radius: 3px;
  box-sizing: border-box;
}

</style>
