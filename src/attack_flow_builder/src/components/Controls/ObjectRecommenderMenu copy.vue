<template>
  <div class="object-recommender-menu-control">
    <input
      class="search-field"
      ref="search"
      type="text"
      placeholder="Search..."
      v-model="value"
      @input="updateRecommendations"
      @keydown="onKeyDown"
    />
    <div class="recommendations" @wheel="scroll">
      <TransitionGroup :name="transitions" tag="ul" class="container">
        <li :class="['recommendation', { active: item.name === activeName }]" v-for="(item, i) of window" :key="item.name" :style="getOpacity(i)">
          <div class="title">
            <div class="dot" :style="{ background: item.color }"></div>
            <div class="name">{{ item.name }}</div>
          </div> 
          <div class="subtitle">{{ item.subtitle }}</div>
        </li>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import { defineComponent, type PropType } from 'vue';
import type { CommandEmitter } from "@/assets/scripts/Application";
import type { ObjectRecommendation, ObjectRecommender } from "@OpenChart/DiagramEditor";
import { unsignedMod } from '@/assets/scripts/OpenChart/Utilities';

export default defineComponent({
  name: 'ObjectRecommenderMenu',
  props: {
    recommender: {
      type: Object as PropType<ObjectRecommender>,
      required: true
    }
  },
  data() {
    return {
      active: 0,
      activeName: "",
      value: "",
      items: [] as ObjectRecommendation[],
      window: [] as ObjectRecommendation[],
      windowSize: 4,
      transitions: ""
    }
  },
  computed: {

  },
  methods: {

    getOpacity(i: number) {
      console.log(`scale(${ 1 - (i * .2) })`)
      return { 
        opacity: 1 - (i * .2),
        // transform: `scale(${ 1 - (i * .2) })`
      }
    },
    
    scroll(event: WheelEvent) {
      if(0 < event.deltaY) {
        this.pageDown();
      } else {
        this.pageUp();
      }
      console.log(event);
    },


    /**
     * Search keydown behavior.
     * @param event
     *  The keydown event.
     */
    onKeyDown(event: KeyboardEvent) {
      // Update window
      let index: number
      switch(event.key) {
        case "ArrowUp":
          event.preventDefault();
          this.pageUp();
          break;
        case "ArrowDown":
          event.preventDefault();
          this.pageDown();
          break;
      }
    },

    pageUp() {
      // Resolve index
      const len = this.items.length;
      const index = unsignedMod(this.active - 1, len);
      // Update window
      this.active = index;
      this.window.unshift(this.items[index]);
      this.window.pop();
      this.activeName = this.items[this.active].name;
    },


    pageDown() {
      // Resolve index
      const len = this.items.length;
      const index = unsignedMod(this.active + this.windowSize, len);
      // Update window
      this.active = unsignedMod(this.active + 1, len);
      this.window.shift();
      this.window.push(this.items[index]);
      this.activeName = this.items[this.active].name;
    },



    /**
     * Updates the list of recommendations. 
     */
    async updateRecommendations() {
      const info = await this.recommender.getRecommendations(this.value);
      this.active = 0;
      // Disable animations
      this.transitions = "none";
      this.items = info.items;
      this.windowSize = Math.min(info.items.length, 4);
      this.window = info.items.slice(0, this.windowSize);
      this.$nextTick(() => {
        // Re-enable animations
        this.transitions = "list";
      })
    },

  },
  emits: {
    select: (item: CommandEmitter) => item,
    focusout: () => true,
  },
  async mounted() {
    const search = this.$refs.search as HTMLInputElement;
    // Focus search
    search.focus();
    // Update recommendations
    this.updateRecommendations();
  }
});
</script>

<style scoped>
/** === Main Control === */

.search-field {
  width: 100%;
  font-family: "Inter";
  color: #cccccc;
  background: #262626;
  border: solid 1px #383838;
  border-radius: 3px;
  padding: 6px;
  outline: none;
  box-shadow: 0px 0px 10px 0px #00000066;
  margin-bottom: 5px;
  box-sizing: border-box;
}

.recommendation {
  width: 100%;
  background: #262626;
  border: solid 1px #383838;
  padding: 10px 8px;
  margin-bottom: 5px;
  border-radius: 3px;
  box-sizing: border-box;
}

.recommendation .title {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.recommendation .dot {
  width: 8px;
  height: 8px;
  margin-right: 6px;
}

.recommendation .name {
  font-family: "Inter";
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  color: #bfbfbf;
}

.recommendation .subtitle {
  font-family: "Inter";
  font-size: 10pt;
  color: #757575;
}

.recommendation.active {
  border: solid 1px #737373;
}

/* .recommendation: */

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