<template>
  <div :class="['options-list-field-control', { flip }]">
    <div
      ref="scrollbox"
      :style="style"
    >
      <div ref="content">
        <ul
          class="options"
          v-if="hasOptions"
        >
          <li 
            ref="items"
            v-for="opt in options"
            :key="opt.value ?? 0"
            :list-id="opt.value"
            :class="classes(opt)"
            @click="$emit('select', opt.value)"
            @mouseenter="setActive(opt)"
            exit-focus-box
          >
            <span>{{ opt.text }}</span>
          </li>
        </ul>
        <div
          class="no-options"
          v-if="!hasOptions"
        >
          No matches
        </div>
      </div> 
    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import { defineComponent, markRaw, type PropType } from "vue";
import { RawScrollBox } from "@/assets/scripts/Browser";
import type { OptionItem } from "@/assets/scripts/Browser";

export default defineComponent({
  name: "EnumField",
  props: {
    maxHeight: {
      type: Number,
      required: true
    },
    options: {
      type: Array as PropType<OptionItem<string | null>[]>,
      required: true
    },
    option: {
      type: String as PropType<string | null>,
      default: null
    }
  },
  data() {
    return {
      flip: false,
      scrollbox: markRaw(new RawScrollBox(false, false)),
      scrollTop: 0
    }
  },
  computed: {

    /**
     * Returns the option list's style.
     * @returns
     *  The option list's style.
     */
    style(): { maxHeight: string } {
      return { maxHeight: `${ this.maxHeight }px` };
    },

    /**
     * Tests if there are any options available.
     * @returns
     *  True if there are options available, false otherwise.
     */
    hasOptions() {
      return 0 < this.options.length;
    }

  },
  emits: ["select", "hover"],
  methods: {

    /**
     * Returns an option's classes. 
     * @param option
     *  The option.
     */
    classes(option: OptionItem<string | null>) {
      return { 
        active : option.value === this.option,
        null   : option.value === null,
        dim    : !option.feature
      }
    },

    /**
     * Sets the active option.
     * @param option
     *  The option.
     */
    setActive(option: OptionItem<string | null>) {
      this.$emit("hover", option.value);
    },

    /**
     * Brings an item into focus at the top of the list.
     * @param value
     *  The value to bring into focus.
     */
    focusItemTop(value: string | null) {
      const item = this.getItemElement(value);
      // Update scroll position
      if(item) {
        // -6px for the <ul>'s padding
        this.scrollbox.moveScrollPosition(item.offsetTop - 6)
      }
    },

    /**
     * Brings an item into focus at the bottom of the list.
     * @param value 
     *  The value to bring into focus.
     */
    focusItemBottom(value: string | null) {
      const item = this.getItemElement(value);
      const scrollbox = this.$refs.scrollbox as HTMLElement;
      // Update scroll position
      if(item) {
        const { top: itTop, bottom: itBottom } = item.getBoundingClientRect();
        const { top: elTop, bottom: elBottom } = scrollbox.getBoundingClientRect();
        // -6px for the <ul>'s padding
        const offsetHeight = (elBottom - elTop) - (itBottom - itTop) - 6;
          this.scrollbox.moveScrollPosition(item.offsetTop - offsetHeight);
      }
    },

    /**
     * Brings an item into focus.
     * @param value
     *  The value to bring into focus.
     * @param prefer
     *  The preferred placement in the frame.
     *  (Default: Whichever side is closest to the element.)
     */
    bringItemIntoFocus(value: string | null, prefer?: "top" | "bottom") {
      const item = this.getItemElement(value);
      const scrollbox = this.$refs.scrollbox as HTMLElement;
      // Update scroll position
      if(item) {
        const { top: itTop, bottom: itBottom } = item.getBoundingClientRect();
        const { top: elTop, bottom: elBottom } = scrollbox.getBoundingClientRect();
        // -6px for the <ul>'s padding
        const aboveFrame = (itTop - 6) < elTop;
        const belowFrame = elBottom < (itBottom + 6);
        const outOfFrame = aboveFrame || belowFrame;
        const offsetHeight = (elBottom - elTop) - (itBottom - itTop) - 6;
        if(outOfFrame && prefer) {
          if(prefer === "top") {
            this.scrollbox.moveScrollPosition(item.offsetTop - 6)
          } else {
            this.scrollbox.moveScrollPosition(item.offsetTop - offsetHeight);
          }
        } else if(aboveFrame) {
          this.scrollbox.moveScrollPosition(item.offsetTop - 6)
        } else if(belowFrame) {
          this.scrollbox.moveScrollPosition(item.offsetTop - offsetHeight);
        }
      }
    },

    /**
     * Get an item's {@link HTMLElement} from the list.
     * @param value
     *  The value.
     * @returns
     *  The {@link HTMLElement}. `undefined` if the item doesn't exist.
     */
    getItemElement(value: string | null): HTMLElement | undefined {
      let item: HTMLElement | undefined = undefined;
      if(!this.$refs.items) {
        return item;
      }
      for(const el of this.$refs.items as HTMLElement[]) {
        if(value === el.getAttribute("list-id")) {
          item = el as HTMLElement;
          break;
        }
      }
      return item;
    }

  },
  mounted() {

    /**
     * Developer's Note:
     * If an <OptionsList> does not extend past the bottom of the document's
     * body or it's parent <ScrollBox>, it's deemed visible. These checks do
     * not account for any other scroll constructs and do not account for
     * nested <ScrollBox>'s. 
     */
    
    // Resolve parent
    const sc = "scroll-content";
    const ele = this.$refs.scrollbox as HTMLElement;
    let par = this.$el.parentElement;
    const body = document.body;
    while(par !== body && !par.classList.contains(sc)) {
      par = par.parentElement;
    }
    // Resolve overlap
    const { bottom: b1 } = par.getBoundingClientRect();
    const { bottom: b2 } = ele.getBoundingClientRect();
    if(b1 < b2) {
      this.flip = true;
    } else {
      this.flip = false;
    }
    // Configure scrollbox
    this.scrollbox.mount(
      this.$refs.scrollbox as HTMLElement,
      this.$refs.content as HTMLElement,
      this.$options.__scopeId
    )
    // Focus selection
    if(this.option !== undefined) {
      if(this.flip) {
        this.focusItemBottom(this.option);
      } else {
        this.focusItemTop(this.option);
      }
      
    }
  },
  unmounted() {
    this.scrollbox.destroy();
  }
});
</script>

<style scoped>

/** === Main Field === */

.options-list-field-control {
  position: absolute;
  width: 100%;
  border: solid 1px #3d3d3d;
  border-radius: 4px;
  box-sizing: border-box;
  background: #242424;
  z-index: 1;
}

.options-list-field-control:not(.flip) {
  top: calc(100% + 3px);
}

.options-list-field-control.flip {
  bottom: calc(100% + 3px);
}

/** === Scrollbox === */

.scrollbox-container {
  border-radius: 4px;
}

.options-list-field-control:not(.flip) .scrollbox-container {
  box-shadow: 0px 5px 5px -2px rgb(0 0 0 / 20%);
}

.options-list-field-control.flip .scrollbox-container {
  box-shadow: 0px -5px 5px -2px rgb(0 0 0 / 20%);
}

/** === Options List === */

.options {
  position: relative;
  padding: 6px 5px;
}

.options li {
  list-style: none;
  font-size: 10pt;
  user-select: none;
}

.options span {
  display: block;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 5px 12px;
  overflow: hidden;
}

.options li.active span,
.options li.active.dim span,
.options li.active.null span {
  color: #fff;
  background: #726de2;
}

.options li.dim span,
.options li.null span {
  color: #8c8c8c;
}

.no-options {
  color: #8c8c8c;
  user-select: none;
  padding: 8px 12px;
}

/** === Scroll Box === */

.options-list-field-control:deep(.scroll-bar) {
  border-left: dotted 1px #3b3b3b;  
}

</style>
