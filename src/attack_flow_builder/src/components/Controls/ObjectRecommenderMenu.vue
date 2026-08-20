<template>
  <div
    class="object-recommender-menu-control"
    ref="menu"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <div class="menu-body">
      <LoadingSpinner
        v-if="loading"
        class="loading"
        label="Loading recommendations"
      />
      <ScrollListBox
        v-else
        ref="scrollbox"
        class="recommendations"
        :items="items"
        :item-display-count="10"
        @scroll="onScroll"
      >
        <template #up>
          ^
        </template>
        <template #item="{ item }">
          <div
            :class="[
              'recommendation',
              {
                child: item.parentId,
                'tie-recommendation': item.isTieRecommendation
              }
            ]"
            @click="submitSelection(item)"
          >
            <div class="title">
              <div
                class="dot"
                :style="{ background: item.color }"
              />
              <div class="name">
                {{ item.name }}
              </div>
            </div>
          </div>
        </template>
        <template #down>
          v
        </template>
      </ScrollListBox>
    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import { defineComponent, type PropType } from 'vue';
import type { ObjectRecommendation, ObjectRecommender } from "@OpenChart/DiagramEditor";
// Components
import LoadingSpinner from "@/components/Elements/LoadingSpinner.vue";
import ScrollListBox from '@/components/Containers/ScrollListBox.vue';

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
      items: [] as ObjectRecommendation[],
      active: null as string | null,
      loading: true
    }
  },
  methods: {

    /**
     * Keydown behavior.
     * @param event
     *  The keydown event.
     */
    onKeyDown(event: KeyboardEvent) {
      // Cast scrollbox
      const scrollbox = this.$refs.scrollbox as {
        shiftSelection(delta: number): void
      } | undefined;
      // Update window
      switch(event.key) {
        case "ArrowUp":
          event.preventDefault();
          if(this.items.length && scrollbox) {
            scrollbox.shiftSelection(-1);
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if(this.items.length && scrollbox) {
            scrollbox.shiftSelection(1);
          }
          break;
        case "Enter":
          event.preventDefault();
          if(this.active) {
            const item = this.items.find(o => o.id === this.active);
            if(item) {
              this.submitSelection(item);
            }
          }
          break;
      }
    },

    /**
     * Submits the selection.
     * @param item
     *  The selected item.
     */
    submitSelection(item: ObjectRecommendation) {
      this.$emit("select", item)
    },

    /**
     * Scroll selection behavior.
     * @param index
     *  The active item index.
     */
    onScroll(index: number) {
      this.active = this.items[index]?.id ?? null;
    },

    /**
     * Updates the list of recommendations.
     */
    async updateRecommendations() {
      this.loading = true;
      try {
        // Get recommendations
        const recs = await this.recommender.getRecommendations();
        // Update recommendations
        this.items = recs.items;
        this.active = this.items[0]?.id ?? null;
      } finally {
        this.loading = false;
      }
    },

  },
  emits: {
    select: (item: ObjectRecommendation) => item,
    focusout: () => true,
  },
  async mounted() {
    const menu = this.$refs.menu as HTMLDivElement;
    // Focus menu
    menu.focus();
    // Update recommendations
    this.updateRecommendations();
  },
  components: { LoadingSpinner, ScrollListBox }
});
</script>

<style scoped>

/** === Main Control === */

.object-recommender-menu-control {
  display: flex;
  flex-direction: column;
  box-shadow: 0px 0px 10px 0px #00000066;
  border-radius: 10px;
  outline: none;
  z-index: 1;
}

.menu-body {
  padding: 0px 6px;
  border-color: var(--af-border-color-secondary);
  border-width: 1px;
  border-style: solid;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  background: var(--af-bg-color-primary);
}

/** === Menu Body === */

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 180px;
  min-height: 56px;
}

.recommendations {
  display: flex;
  flex-direction: column;
}

.recommendations:deep(.up-indicator),
.recommendations:deep(.down-indicator) {
  display: flex;
  justify-content: center;
  height: 10px;
  color: var(--af-text-color-primary)
}

.active .recommendation {
  background: var(--af-bg-color-tertiary);
}

.recommendation {
  padding: 5px 8px;
  border-radius: 3px;
  box-sizing: border-box;
}

.recommendation.child {
  padding-left: 24px;
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

.recommendation.child .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.recommendation .name {
  font-family: "Inter";
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  color: var(--af-text-color-primary);
}

.recommendation.child .name {
  font-weight: 600;
  font-size: 12px;
  text-transform: none;
}

.recommendation .subtitle {
  font-family: "Inter";
  font-size: 10pt;
  color: var(--af-text-color-secondary);
}

</style>
