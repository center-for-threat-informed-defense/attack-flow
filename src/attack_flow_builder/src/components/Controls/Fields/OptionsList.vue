<template>
  <div :class="['options-list-field-control', { flip }]">
    <ScrollBox
      :top="scrollTop"
      :style="style"
      :propagate-scroll="false"
    >
      <ul
        class="options"
        v-if="hasOptions"
      >
        <li 
          ref="items"
          v-for="opt in options"
          :key="opt.value ?? 0"
          :list-id="opt.value"
          :class="{ active: isActive(opt), null: isNull(opt) }"
          @click="$emit('select', opt.value)"
          @mouseenter="active = opt.value"
          exit-focus-box
        >
          {{ opt.text }}
        </li>
      </ul>
      <div
        class="no-options"
        v-if="!hasOptions"
      >
        No matches
      </div> 
    </ScrollBox>
  </div>
</template>

<script lang="ts">
// Dependencies
import { defineComponent, type PropType } from "vue";
// Components
import ScrollBox from "@/components/Containers/ScrollBox.vue";

export default defineComponent({
  name: "EnumField",
  props: {
    maxHeight: {
      type: Number,
      required: true
    },
    options: {
      type: Array as PropType<{ value: string | null, text: string }[]>,
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
      active: this.option ?? null,
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
  emits: ["select"],
  methods: {

    /**
     * Tests if an option is the null option.
     * @returns
     *  True if the options is the null option, false otherwise.
     */
    isNull(option: { value: string | null, text: string }) {
      return option.value === null
    },

    /**
     * Tests if an option is active.
     * @returns
     *  True if the option is active, false otherwise.
     */
    isActive(option: { value: string | null, text: string }) {
      return this.active === option.value;
    },

    /**
     * Moves the focus to the currently active item.
     */
    focusActive() {
      // Resolve active item
      let item: HTMLElement | undefined;
      for(const el of this.$refs.items as HTMLElement[]) {
        if(this.option === el.getAttribute("list-id")) {
          item = el as HTMLElement;
          break;
        }
      }
      // Update scroll position
      if(item) {
        // -6px for the <ul>'s padding
        this.scrollTop = item.offsetTop - 6;
      }
    }

  },
  watch: {
    // On select change
    select() {
      // Update active item
      this.active = this.option ?? null;
      // Focus the active item
      this.focusActive();
    },
    // On options change
    options() {
      // Focus the active item
      this.$nextTick(() => {
        this.focusActive();
      });
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
    const ele = this.$el;
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
    // Focus the active item
    this.focusActive();
  },
  components: { ScrollBox }
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
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 5px 12px;
  overflow: hidden;
}

.options li.active,
.options li.active.null {
  color: #fff;
  background: #726de2;
}

.options li.null {
  color: #999;
}

.no-options {
  color: #999;
  user-select: none;
  padding: 8px 12px;
}

/** === Scroll Box === */

.options-list-field-control:deep(.scroll-bar) {
  border-left: dotted 1px #3b3b3b;  
}

</style>
