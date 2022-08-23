<template>
  <div class="block-diagram-element"></div>
</template>

<script lang="ts">
import * as Store from "@/store/StoreTypes";
import { mapActions, mapState } from "vuex";
import { PageModel } from "@/assets/scripts/Visualizations/BlockDiagram/ModelTypes/PageModel";
import { BlockDiagram } from "@/assets/scripts/Visualizations/BlockDiagram/BlockDiagram";
import { defineComponent, markRaw } from 'vue';

export default defineComponent({
  name: 'BlockDiagram',
  data() {
    return {
      diagram: markRaw(new BlockDiagram())
    }
  },
  computed: {

    /**
     * Active Page Store data
     */
    ...mapState("ActivePageStore", {
      page(state: Store.ActivePageStore): PageModel {
        return state.page;
      },
      triggerLayoutUpdate(state: Store.ActivePageStore): number {
        return state.triggerLayoutUpdate;
      },
      triggerAttributeUpdate(state: Store.ActivePageStore): number {
        return state.triggerAttributeUpdate;
      }
    }),

  },
  methods: {

    /**
     * Active Page Store actions
     */
    ...mapActions("ActivePageStore", ["select", "unselectAll"])

  },
  watch: {
    // On layout update trigger
    triggerLayoutUpdate() {
        this.diagram.updateView();
        this.diagram.render();
    },
    // On attribute update trigger
    triggerAttributeUpdate() {
        this.diagram.render();
    },
    // On page change
    "page.id"() {
        console.log("update: " + this.page.id);
        this.diagram.setPage(markRaw(this.page));
        this.diagram.updateView();
        this.diagram.render();
    }
  },
  mounted() {
    
    // Configure the current page
    this.diagram.setPage(markRaw(this.page));
    this.diagram.updateView();
    
    // Subscribe to diagram events
    this.diagram.on("object-click", (evt, obj, x, y) => {
        this.unselectAll();
        this.select(obj.id);
    });
    this.diagram.on("canvas-click", (evt, x, y) => {
        this.unselectAll();
    });

    // Inject the diagram
    this.diagram.inject(this.$el);
    this.diagram.render();

  }
});
</script>

<style scoped>
</style>
