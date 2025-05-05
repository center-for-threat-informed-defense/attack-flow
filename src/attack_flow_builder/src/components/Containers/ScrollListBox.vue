<template>
  <div class="scroll-list-box-container">
    <div class="up-indicator">
      <slot v-if="isAtTop" name="up">[UP]</slot>
    </div>
    <ul class="items" ref="content">
      <li 
        v-for="item of box.content"
        :key="item.id"
        :class="['item', { active: item.id === box.item.id }]"
        @mousemove="onMouseMove($event, item.id)"
      >
        <slot name="item" :item="item"></slot>
      </li>
    </ul>
    <div class="down-indicator">
      <slot v-if="isAtBottom" name="down">[DOWN]</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from 'vue';
import { RawScrollListBox, unsignedMod } from '@/assets/scripts/Browser';

export default defineComponent({
  name: "ScrollListBox",
  props: {
    items: {
      type: Array as PropType<{ id: string }[]>,
      required: true
    },
    itemDisplayCount: {
      type: Number,
      required: true
    },
  },
  data() {
    return {
      box: new RawScrollListBox(
        this.items,
        this.itemDisplayCount,
        o => ref(o).value
      ),
      pointer: [0,0],
    };
  },
  computed: {

    /**
     * Whether navigation is at the top of the list.
     * @returns
     *  Whether navigation is at the top of the list.
     */
    isAtTop(): boolean {
      return 0 < this.box.range[0]
    },

    /**
     * Whether navigation is at the bottom of the list.
     * @returns
     *  Whether navigation is at the bottom of the list.
     */
    isAtBottom(): boolean {
      return this.box.range[2] < this.box.items.length;
    }

  },
  methods: {
    
    /**
     * Shifts selection `delta` items up/down.
     */
    shiftSelection(delta: number) {
      // Resolve index
      const len = this.items.length;
      const index = unsignedMod(this.box.index + delta, len);
      // Set index
      this.box.jumpToItem(index);
    },

    /**
     * Item mousemove behavior.
     * @param id
     *  The item's id.
     */
    onMouseMove(event: MouseEvent, id: string) {
      this.pointer[0] += event.movementX;
      this.pointer[1] += event.movementY;
      // If pointer has traveled more than 5 pixels...
      if(this.pointer.some(p => p < -5 || 5 < p)) {
        // Trip update
        const index = this.box.items.findIndex(o => o.id === id);
        if(-1 < index) {
          this.box.jumpToItem(index);
        }
        // Reset trip
        this.pointer[0] = 0;
        this.pointer[1] = 0; 
      }
    }

  },
  emits: ["scroll"],
  watch: {
    items() {
      this.box.items = this.items;
    },
  },
  mounted() {
    this.box.mount(
      this.$refs.content as HTMLElement,
      index => this.$emit("scroll", index)
    )
  },
  unmounted() {
    this.box.destroy()
  }
});
</script>

<style scoped>
.items {
  list-style-type: none;
}
</style>
