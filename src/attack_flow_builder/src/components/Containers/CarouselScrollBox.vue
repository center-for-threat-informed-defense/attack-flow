<template>
  <div class="carousel-scrollbox-container">
    <TransitionGroup ref="content" name="list" tag="ul" class="container">
      <li class="item" v-for="(item, i) of scrollbox.content" :key="item.name">
        <slot :item="item"></slot>
      </li>
    </TransitionGroup>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RawCarouselScrollBox } from '@/assets/scripts/Browser';

export default defineComponent({
  name: "CarouselScrollBox",
  props: {
    items: {
      type: Array,
      default: false
    },
    itemHeight: {
      type: Number,
      default: false
    },
    itemPadding: {
      type: Number,
      default: false
    },
    itemNumber: {
      type: Number,
      default: false
    },
    alwaysShowScrollBar: {
      type: Boolean,
      default: false
    },
    propagateScroll: {
      type: Boolean,
      default: true
    },
    resetScrollOnChange: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      scrollbox: new RawCarouselScrollBox(
        this.items,
        this.itemHeight, 
        this.itemPadding,
        this.itemNumber,
        this.alwaysShowScrollBar,
        this.resetScrollOnChange
      )
    };
  },
  emits: ["scroll"],
  watch: {
    items() {
      this.scrollbox.setItems(this.items);
    },
    alwaysShowScrollBar() {
      this.scrollbox.alwaysShowScrollBar = this.alwaysShowScrollBar;
    },
    resetScrollOnChange() {
      this.scrollbox.resetScrollOnChange = this.resetScrollOnChange;
    }
  },
  mounted() {
    console.log(this.$refs.content);
    this.scrollbox.mount(
      this.$el,
      this.$refs.content!.$el as HTMLElement,
      this.$options.__scopeId,
      scrollTop => this.$emit("scroll", scrollTop)
    )
  },
  unmounted() {
    this.scrollbox.destroy()
  },
});
</script>


<style scoped>
.container {
  position: relative;
  padding: 0;
  list-style-type: none;
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0 !important;
  transform: scale(0.4);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}

</style>