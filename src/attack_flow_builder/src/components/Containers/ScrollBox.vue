<template>
  <div class="scrollbox-container">
    <div 
      ref="content" 
      class="scroll-content" 
      @wheel.passive="onScrollWheel"
      @scroll="onScrollContent"
    >
      <slot></slot>
    </div>
    <div
      ref="scrollbar"
      class="scroll-bar"
      :style="scroll.sty"
      @wheel.passive="onScrollWheel"
      v-show="alwaysShowScrollBar || showScrollbar"
    >
      <div
        class="scroll-handle"
        :style="handle.sty"
        @pointerdown="startDrag"
        v-show="showScrollbar"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { clamp } from '@/assets/scripts/BlockDiagram';
import { PointerTracker } from '@/assets/scripts/PointerTracker';
import { defineComponent, markRaw, ref } from 'vue';

export default defineComponent({
  name: "ScrollBox",
  setup() {
    return { 
      content: ref<HTMLElement | null>(null),
      scrollbar: ref<HTMLElement | null>(null),
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
    propagateScroll: {
      type: Boolean,
      default: true
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
    },
    top: {
      type: Number,
      default: 0
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
  emits: ["scroll"],
  methods: {

    /**
     * Scroll wheel behavior.
     * @param event
     *  The wheel event.
     */
    onScrollWheel(event: WheelEvent) {
      this.moveScrollPosition(this.scrollTop + event.deltaY, event);
    },

    /**
     * Scroll handle drag start behavior.
     * @param event
     *  The pointer event.
     */
    startDrag(event: PointerEvent) {
      this.handle.trk.capture(event, this.onDrag);
      // Configure stop drag
      document.addEventListener("pointerup", this.stopDrag, { once: true });
    },

    /**
     * Scroll handle drag behavior.
     * @param event
     *  The pointer event.
     * @param track
     *  The mouse tracker.
     */
    onDrag(event: PointerEvent, track: PointerTracker) {
      event.preventDefault();
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
      // Release pointer
      this.handle.trk.release(event);
    },

    /**
     * Scroll content behavior.
     */
    onScrollContent() {
      if(!this.content) {
        return;
      }
      // If browser changed scroll position on its own, update scroll state
      if(this.content.scrollTop != this.scrollTop) {
        this.scrollTop = this.content!.scrollTop;
        this.handle.pos = this.topToHandleTop(this.scrollTop);
        this.handle.sty.transform = `translateY(${this.handle.pos}px)`;
      }
      this.$emit("scroll", this.scrollTop);
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
      let content = this.content;
      // Ignore scroll content with no height
      if(!content || content.clientHeight === 0) {
       this.showScrollbar = false;
       return;
      }
      // Compute ratio
      let ratio = content.clientHeight / content.scrollHeight;
      // Compute scroll parameters
      let scrollBarSpace = this.getScrollBarHeight();
      this.handle.hei = Math.max(15, Math.round(scrollBarSpace * ratio));
      this.handle.max = scrollBarSpace - this.handle.hei;
      this.windowMax  = content.scrollHeight - content.clientHeight;
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
      if(!this.content) {
        return;
      }
      let scrollTop = this.scrollTop;
      this.scrollTop = clamp(Math.round(position), 0, this.windowMax);
      this.handle.pos = this.topToHandleTop(this.scrollTop);
      this.handle.sty.transform = `translateY(${this.handle.pos}px)`;
      this.content.scrollTop = this.scrollTop;
      // Selectively propagate scroll event
      let canMove = 0 < this.scrollTop && this.scrollTop < this.windowMax;
      let hasMoved = scrollTop - this.scrollTop !== 0;
      if(!this.propagateScroll || hasMoved || canMove) {
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
    },

    /**
     * Returns the scrollbar's height (excluding padding, borders, and margin).
     * @returns
     *  The scrollbar's true height.
     */
    getScrollBarHeight(): number {
      if(this.scrollbar) {
        let cs = getComputedStyle(this.scrollbar);
        let padding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
        return this.scrollbar.clientHeight - padding;
      } else {
        return 0;
      }
    }

  },
  watch: {
    // On top change
    top() {
      this.moveScrollPosition(this.top);
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
    // Calculate scroll state
    this.recalculateScrollState(false);
    // Set scroll position
    this.moveScrollPosition(this.top);
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
